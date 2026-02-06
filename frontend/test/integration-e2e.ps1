#!/usr/bin/env pwsh
# Frontend-Backend Integration Test Script
# Tests the complete flow from frontend to backend

param(
    [string]$BackendUrl = "http://localhost:3000",
    [string]$FrontendUrl = "http://localhost:3001"
)

Write-Host ""
Write-Host "TCG Marketplace Frontend-Backend Integration Tests" -ForegroundColor Cyan
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Gray
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Gray
Write-Host ""

$testResults = @()
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            RawContent = $response.Content
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [object]$Data = $null
    )
    
    if ($Passed) {
        Write-Host "PASSED: $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "  $Message" -ForegroundColor Gray }
        if ($Data) { 
            $Data.PSObject.Properties | ForEach-Object {
                Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
        }
        $script:testsPassed++
    }
    else {
        Write-Host "FAILED: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "  Error: $Message" -ForegroundColor Red }
        $script:testsFailed++
    }
    
    $script:testResults += @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
    }
    
    Write-Host ""
}

# Test 1: Backend Health Check
Write-Host "=== Test Suite 1: Backend Availability ===" -ForegroundColor Cyan
Write-Host ""

$healthCheck = Test-Endpoint -Name "Backend Health Check" -Url "$BackendUrl/health"
if ($healthCheck.Success) {
    Write-TestResult -TestName "Backend Health Check" -Passed $true -Data @{
        Status = $healthCheck.Content.status
        StatusCode = $healthCheck.StatusCode
    }
}
else {
    Write-TestResult -TestName "Backend Health Check" -Passed $false -Message $healthCheck.Error
    Write-Host "Backend is not running. Please start it with: npm run start:dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 2: Frontend Availability
Write-Host "=== Test Suite 2: Frontend Availability ===" -ForegroundColor Cyan
Write-Host ""

try {
    $frontendCheck = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-TestResult -TestName "Frontend Availability" -Passed $true -Data @{
        StatusCode = $frontendCheck.StatusCode
        ContentLength = "$($frontendCheck.Content.Length) bytes"
    }
}
catch {
    Write-TestResult -TestName "Frontend Availability" -Passed $false -Message $_.Exception.Message
    Write-Host "Frontend is not running. Please start it with: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 3: CORS Configuration
Write-Host "=== Test Suite 3: CORS Configuration ===" -ForegroundColor Cyan
Write-Host ""

try {
    $corsHeaders = @{
        "Origin" = $FrontendUrl
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $corsCheck = Invoke-WebRequest -Uri "$BackendUrl/listings" -Method OPTIONS -Headers $corsHeaders -UseBasicParsing -ErrorAction Stop
    
    $allowOrigin = $corsCheck.Headers["Access-Control-Allow-Origin"]
    $allowMethods = $corsCheck.Headers["Access-Control-Allow-Methods"]
    
    if ($allowOrigin -contains $FrontendUrl -or $allowOrigin -contains "*") {
        Write-TestResult -TestName "CORS Configuration" -Passed $true -Data @{
            AllowOrigin = $allowOrigin
            AllowMethods = $allowMethods
        }
    }
    else {
        Write-TestResult -TestName "CORS Configuration" -Passed $false -Message "Frontend origin not allowed"
    }
}
catch {
    Write-TestResult -TestName "CORS Configuration" -Passed $false -Message $_.Exception.Message
}

# Test 4: API Integration - Fetch Listings
Write-Host "=== Test Suite 4: Listings API Integration ===" -ForegroundColor Cyan
Write-Host ""

$listingsUrl = $BackendUrl + '/listings?category=vintage&limit=10'
$listingsCheck = Test-Endpoint -Name "Fetch Listings" -Url $listingsUrl
if ($listingsCheck.Success) {
    $listings = $listingsCheck.Content
    if ($listings -is [array]) {
        Write-TestResult -TestName "Fetch Listings API" -Passed $true -Data @{
            Count = $listings.Count
            StatusCode = $listingsCheck.StatusCode
        }
        
        if ($listings.Count -gt 0) {
            $firstListing = $listings[0]
            Write-Host "  Sample Listing:" -ForegroundColor Gray
            Write-Host "    ID: $($firstListing.id)" -ForegroundColor Gray
            Write-Host "    Title: $($firstListing.title)" -ForegroundColor Gray
            Write-Host "    Price: `$$($firstListing.price)" -ForegroundColor Gray
            Write-Host "    Category: $($firstListing.category)" -ForegroundColor Gray
        }
    }
    else {
        Write-TestResult -TestName "Fetch Listings API" -Passed $false -Message "Response is not an array"
    }
}
else {
    Write-TestResult -TestName "Fetch Listings API" -Passed $false -Message $listingsCheck.Error
}

# Test 5: API Integration - Create Listing
Write-Host "=== Test Suite 5: Create Listing Integration ===" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "HH:mm:ss"
$testListing = @{
    title = "Integration Test Card - $timestamp"
    description = "Created by frontend integration test"
    price = 99.99
    category = "vintage"
    images = @()
}

$createCheck = Test-Endpoint -Name "Create Listing" -Url "$BackendUrl/listings" -Method "POST" -Body $testListing
if ($createCheck.Success) {
    $createdListing = $createCheck.Content
    Write-TestResult -TestName "Create Listing API" -Passed $true -Data @{
        ListingID = $createdListing.id
        Title = $createdListing.title
        Price = "`$$($createdListing.price)"
        StatusCode = $createCheck.StatusCode
    }
    
    $script:createdListingId = $createdListing.id
}
else {
    Write-TestResult -TestName "Create Listing API" -Passed $false -Message $createCheck.Error
}

# Test 6: API Integration - Presigned URL Generation
Write-Host "=== Test Suite 6: Media Upload Integration ===" -ForegroundColor Cyan
Write-Host ""

$presignRequest = @{
    filename = "test-card-frontend.jpg"
    contentType = "image/jpeg"
}

$presignCheck = Test-Endpoint -Name "Generate Presigned URL" -Url "$BackendUrl/media/presign" -Method "POST" -Body $presignRequest
if ($presignCheck.Success) {
    $presignData = $presignCheck.Content
    if ($presignData.uploadUrl -and $presignData.key) {
        Write-TestResult -TestName "Presigned URL Generation" -Passed $true -Data @{
            Key = $presignData.key
            ExpiresIn = "$($presignData.expiresIn)s"
            HasUploadUrl = $true
        }
        
        $script:uploadUrl = $presignData.uploadUrl
        $script:imageKey = $presignData.key
    }
    else {
        Write-TestResult -TestName "Presigned URL Generation" -Passed $false -Message "Missing uploadUrl or key in response"
    }
}
else {
    Write-TestResult -TestName "Presigned URL Generation" -Passed $false -Message $presignCheck.Error
}

# Test 7: Image Upload Flow
$testImagePath = Join-Path $PSScriptRoot "test-card.jpg"
if (Test-Path $testImagePath) {
    Write-Host "Test: Image Upload Flow" -ForegroundColor Yellow
    
    if ($script:uploadUrl) {
        try {
            $imageBytes = [System.IO.File]::ReadAllBytes($testImagePath)
            $uploadResponse = Invoke-WebRequest -Uri $script:uploadUrl -Method PUT -Body $imageBytes -ContentType "image/jpeg" -UseBasicParsing -ErrorAction Stop
            
            if ($uploadResponse.StatusCode -eq 200) {
                Write-TestResult -TestName "Image Upload Flow" -Passed $true -Data @{
                    ImageKey = $script:imageKey
                    FileSize = "$([math]::Round($imageBytes.Length / 1KB, 2)) KB"
                    StatusCode = $uploadResponse.StatusCode
                }
            }
            else {
                Write-TestResult -TestName "Image Upload Flow" -Passed $false -Message "Upload returned status $($uploadResponse.StatusCode)"
            }
        }
        catch {
            Write-TestResult -TestName "Image Upload Flow" -Passed $false -Message $_.Exception.Message
        }
    }
    else {
        Write-TestResult -TestName "Image Upload Flow" -Passed $false -Message "No presigned URL available"
    }
}
else {
    Write-Host "Skipping image upload test - test-card.jpg not found" -ForegroundColor Yellow
    Write-Host ""
}

# Test 8: Query Created Listing
if ($script:createdListingId) {
    Write-Host "=== Test Suite 7: Verify Created Listing ===" -ForegroundColor Cyan
    Write-Host ""
    
    $verifyUrl = $BackendUrl + '/listings?category=vintage&limit=50'
    $verifyCheck = Test-Endpoint -Name "Query Created Listing" -Url $verifyUrl
    if ($verifyCheck.Success) {
        $allListings = $verifyCheck.Content
        $foundListing = $allListings | Where-Object { $_.id -eq $script:createdListingId }
        
        if ($foundListing) {
            Write-TestResult -TestName "Verify Created Listing in Query" -Passed $true -Data @{
                Found = "Yes"
                Title = $foundListing.title
                MatchesTestData = ($foundListing.price -eq 99.99)
            }
        }
        else {
            Write-TestResult -TestName "Verify Created Listing in Query" -Passed $false -Message "Created listing not found in query results"
        }
    }
    else {
        Write-TestResult -TestName "Verify Created Listing in Query" -Passed $false -Message $verifyCheck.Error
    }
}

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Host "  [FAIL] $($_.Name)" -ForegroundColor Red
        if ($_.Message) {
            Write-Host "    Error: $($_.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "Some tests failed. Check the output above for details." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend-Backend Integration Status: WORKING" -ForegroundColor Green
    exit 0
}
