# Check status of development infrastructure and estimated costs

Write-Host "📊 TCG Marketplace Infrastructure Status" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$totalCost = 0

# Check base stack (expensive one)
Write-Host "`n🌐 Base Stack (VPC/Networking):" -ForegroundColor Blue
$baseStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-base --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($baseStatus -eq "CREATE_COMPLETE" -or $baseStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: ✅ RUNNING" -ForegroundColor Green
    Write-Host "   Cost: ~$1.58/day (~$47.45/month)" -ForegroundColor Yellow
    $totalCost += 1.58
} elseif ($baseStatus -eq "DELETE_COMPLETE" -or $baseStatus -eq $null) {
    Write-Host "   Status: 🛑 STOPPED" -ForegroundColor Red
    Write-Host "   Cost: $0.00/day" -ForegroundColor Green
} else {
    Write-Host "   Status: ⚠️  $baseStatus" -ForegroundColor Yellow
}

# Check storage stack
Write-Host "`n🪣 Storage Stack (S3 + DynamoDB):" -ForegroundColor Blue
$storageStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($storageStatus -eq "CREATE_COMPLETE" -or $storageStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: ✅ RUNNING" -ForegroundColor Green
    Write-Host "   Cost: ~$0.00/day (free tier)" -ForegroundColor Green
    
    # Get DynamoDB item count
    $itemCount = aws dynamodb scan --table-name tcg-marketplace-dev-data --region ap-southeast-1 --select COUNT --query "Count" --output text 2>$null
    if ($itemCount) {
        Write-Host "   DynamoDB Items: $itemCount listings" -ForegroundColor Cyan
    }
} else {
    Write-Host "   Status: ❌ NOT FOUND" -ForegroundColor Red
}

# Check auth stack
Write-Host "`n🔐 Auth Stack (Cognito):" -ForegroundColor Blue
$authStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-auth-minimal --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($authStatus -eq "CREATE_COMPLETE" -or $authStatus -eq "UPDATE_COMPLETE") {
    Write-Host "   Status: ✅ RUNNING" -ForegroundColor Green
    Write-Host "   Cost: ~$0.00/day (free tier)" -ForegroundColor Green
} else {
    Write-Host "   Status: ❌ NOT FOUND" -ForegroundColor Red
}

# Summary
Write-Host "`n💰 Cost Summary:" -ForegroundColor Cyan
Write-Host "   Current daily cost: ~$" -NoNewline -ForegroundColor White
Write-Host $totalCost.ToString("F2") -ForegroundColor $(if ($totalCost -gt 0) { "Yellow" } else { "Green" })

if ($totalCost -gt 0) {
    Write-Host "   Monthly projection: ~$" -NoNewline -ForegroundColor White
    Write-Host ($totalCost * 30).ToString("F2") -ForegroundColor Yellow
    Write-Host "   💡 Run dev-stop.ps1 to save costs when not developing" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ All expensive resources are stopped" -ForegroundColor Green
}

Write-Host "`n🔄 Quick Commands:" -ForegroundColor Cyan
Write-Host "   Start dev: .\dev-start.ps1" -ForegroundColor White
Write-Host "   Stop dev:  .\dev-stop.ps1" -ForegroundColor White