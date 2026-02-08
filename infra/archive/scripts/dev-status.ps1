# Check status of development infrastructure and estimated costs

Write-Host "TCG Marketplace Infrastructure Status" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$totalCost = 0

# Check base stack (expensive one)
Write-Host "`nBase Stack (VPC/Networking):" -ForegroundColor Blue
$baseStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-base --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($baseStatus -eq "CREATE_COMPLETE" -or $baseStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: RUNNING" -ForegroundColor Green
    Write-Host "   Cost: approximately 1.58 dollars per day (47.45 dollars per month)" -ForegroundColor Yellow
    $totalCost += 1.58
} elseif ($baseStatus -eq "DELETE_COMPLETE" -or $baseStatus -eq $null) {
    Write-Host "   Status: STOPPED" -ForegroundColor Red
    Write-Host "   Cost: 0.00 dollars per day" -ForegroundColor Green
} else {
    Write-Host "   Status: $baseStatus" -ForegroundColor Yellow
}

# Check storage stack
Write-Host "`nStorage Stack (S3 + DynamoDB):" -ForegroundColor Blue
$storageStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($storageStatus -eq "CREATE_COMPLETE" -or $storageStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: RUNNING" -ForegroundColor Green
    Write-Host "   Cost: approximately 0.00 dollars per day (free tier)" -ForegroundColor Green
    
    # Get DynamoDB item count
    $itemCount = aws dynamodb scan --table-name tcg-marketplace-dev-data --region ap-southeast-1 --select COUNT --query "Count" --output text 2>$null
    if ($itemCount) {
        Write-Host "   DynamoDB Items: $itemCount listings" -ForegroundColor Cyan
    }
} else {
    Write-Host "   Status: NOT FOUND" -ForegroundColor Red
}

# Check auth stack
Write-Host "`nAuth Stack (Cognito):" -ForegroundColor Blue
$authStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-auth-minimal --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($authStatus -eq "CREATE_COMPLETE" -or $authStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: RUNNING" -ForegroundColor Green
    Write-Host "   Cost: approximately 0.00 dollars per day (free tier)" -ForegroundColor Green
} else {
    Write-Host "   Status: NOT FOUND" -ForegroundColor Red
}

# Summary
Write-Host "`nCost Summary:" -ForegroundColor Cyan
Write-Host "   Current daily cost: approximately " -NoNewline -ForegroundColor White
Write-Host $totalCost.ToString("F2") -NoNewline -ForegroundColor $(if ($totalCost -gt 0) { "Yellow" } else { "Green" })
Write-Host " dollars" -ForegroundColor White

if ($totalCost -gt 0) {
    Write-Host "   Monthly projection: approximately " -NoNewline -ForegroundColor White
    Write-Host ($totalCost * 30).ToString("F2") -NoNewline -ForegroundColor Yellow
    Write-Host " dollars" -ForegroundColor White
    Write-Host "   TIP: Run dev-stop.ps1 to save costs when not developing" -ForegroundColor Cyan
} else {
    Write-Host "   All expensive resources are stopped" -ForegroundColor Green
}

Write-Host "`nQuick Commands:" -ForegroundColor Cyan
Write-Host "   Start dev: .\dev-start.ps1" -ForegroundColor White
Write-Host "   Stop dev:  .\dev-stop.ps1" -ForegroundColor White