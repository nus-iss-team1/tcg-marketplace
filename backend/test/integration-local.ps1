# Local Integration Test Script for TCG Marketplace Backend
# Tests S3 and DynamoDB integration locally

param(
    [Parameter(Mandatory=$false)]
    [string]$BackendUrl = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [string]$TestImagePath = "$PSScriptRoot\test-card.jpg"
)

$ErrorActionPreference = "Stop"

Write-Host "TCG Marketplace Local Integration Tests" -ForegroundColor Cyan
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Yellow
Write-Host ""

# Test results tracking
$testResults = @{
    Passed = 0
    Failed = 0
    Tests = @()
}

function Test-Endpoint {
    param($Name, $ScriptBlock)
    
    Write-Host "Test: $Name" -ForegroundColor Blue
    try {
        & $ScriptBlock
        Write-Host "[PASSED] $Name" -ForegroundColor Green
        $testResults.Passed++
        $testResults.Tests += @{ Name = $Name; Status = "PASSED" }
    } catch {
        Write-Host "[FAILED] $Name" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $testResults.Failed++
        $testResults.Tests += @{ Name = $Name; Status = "FAILED"; Error = $_.Exception.Message }
    }
    Write-Host ""
}

# Test 1: Health Check
Test-Endpoint "Health Check" {
    $response = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get
    if ($response.status -ne "ok") {
        throw "Health check failed: $($response.status)"
    }
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
}

# Test 2: Generate Presigned URL for Upload
$presignedData = $null
Test-Endpoint "S3 Presigned URL Generation" {
    $body = @{
        filename = "test-card-$(Get-Date -Format 'yyyyMMddHHmmss').jpg"
        contentType = "image/jpeg"
    } | ConvertTo-Json

    $script:presignedData = Invoke-RestMethod -Uri "$BackendUrl/media/presign" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $presignedData.uploadUrl) {
        throw "No uploadUrl in response"
    }
    if (-not $presignedData.key) {
        throw "No key in response"
    }
    
    Write-Host "  Upload URL: $($presignedData.uploadUrl.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "  Key: $($presignedData.key)" -ForegroundColor Gray
    Write-Host "  Expires In: $($presignedData.expiresIn)s" -ForegroundColor Gray
}

# Test 3: Upload Image to S3
Test-Endpoint "S3 Image Upload" {
    if (-not $presignedData) {
        throw "Presigned data not available from previous test"
    }

    # Check if test image exists
    if (-not (Test-Path $TestImagePath)) {
        throw "Test image not found: $TestImagePath. Please ensure test-card.jpg is in the test folder."
    }

    $imageBytes = [System.IO.File]::ReadAllBytes($TestImagePath)
    
    $response = Invoke-WebRequest -Uri $presignedData.uploadUrl -Method Put -Body $imageBytes -ContentType "image/jpeg"
    
    if ($response.StatusCode -ne 200) {
        throw "Upload failed with status code: $($response.StatusCode)"
    }
    
    Write-Host "  Uploaded: $TestImagePath to $($presignedData.key)" -ForegroundColor Gray
}

# Test 4: Create Listing in DynamoDB
$listingId = $null
Test-Endpoint "DynamoDB Create Listing" {
    if (-not $presignedData) {
        throw "Presigned data not available"
    }

    $body = @{
        title = "Test Card - $(Get-Date -Format 'HH:mm:ss')"
        description = "Automated test listing"
        price = 100
        category = "vintage"
        images = @($presignedData.key)
    } | ConvertTo-Json

    $listing = Invoke-RestMethod -Uri "$BackendUrl/listings" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $listing.id) {
        throw "No listing ID in response"
    }
    
    $script:listingId = $listing.id
    
    Write-Host "  Listing ID: $($listing.id)" -ForegroundColor Gray
    Write-Host "  Title: $($listing.title)" -ForegroundColor Gray
    Write-Host "  Price: `$$($listing.price)" -ForegroundColor Gray
    Write-Host "  Category: $($listing.category)" -ForegroundColor Gray
}

# Test 5: Query Listings from DynamoDB
Test-Endpoint "DynamoDB Query Listings by Category" {
    $listings = Invoke-RestMethod -Uri "$BackendUrl/listings?category=vintage&limit=10" -Method Get
    
    if ($listings.Count -eq 0) {
        throw "No listings returned"
    }
    
    Write-Host "  Found $($listings.Count) listing(s)" -ForegroundColor Gray
    
    # Verify our test listing is in the results
    $found = $false
    foreach ($listing in $listings) {
        if ($listing.id -eq $listingId) {
            $found = $true
            Write-Host "  [OK] Test listing found in query results" -ForegroundColor Gray
            break
        }
    }
    
    if (-not $found -and $listingId) {
        Write-Host "  [WARNING] Test listing not found in results (may take a moment to appear)" -ForegroundColor Yellow
    }
}

# Test 6: Verify S3 Object Exists
Test-Endpoint "S3 Object Verification" {
    if (-not $presignedData) {
        throw "Presigned data not available"
    }

    # Extract bucket name from upload URL
    $uploadUrl = $presignedData.uploadUrl
    $bucketName = ($uploadUrl -split '//')[1].Split('.')[0]
    $key = $presignedData.key

    Write-Host "  Checking S3 object: s3://$bucketName/$key" -ForegroundColor Gray
    
    $result = aws s3 ls "s3://$bucketName/$key" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "S3 object not found or AWS CLI error"
    }
    
    Write-Host "  [OK] Object exists in S3" -ForegroundColor Gray
}

# Summary
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Passed + $testResults.Failed)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red
Write-Host ""

foreach ($test in $testResults.Tests) {
    $color = if ($test.Status -eq "PASSED") { "Green" } else { "Red" }
    $symbol = if ($test.Status -eq "PASSED") { "[OK]" } else { "[FAIL]" }
    Write-Host "$symbol $($test.Name)" -ForegroundColor $color
    if ($test.Error) {
        Write-Host "  Error: $($test.Error)" -ForegroundColor Red
    }
}

Write-Host ""
if ($testResults.Failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed. Check the output above for details." -ForegroundColor Red
    exit 1
}
