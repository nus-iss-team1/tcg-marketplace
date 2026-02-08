# Stop development infrastructure to save costs
# Only tears down the expensive base stack (NAT Gateway + VPC Endpoints)
# Keeps storage and auth stacks running (they're free)

Write-Host "Stop Stopping TCG Marketplace development infrastructure..." -ForegroundColor Yellow

# Delete base stack (contains NAT Gateway - the expensive part)
Write-Host "Deleting base stack (VPC/Networking)..." -ForegroundColor Blue
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Base stack deletion initiated" -ForegroundColor Green
    Write-Host "This will save approximately 1.58 dollars per day in AWS costs" -ForegroundColor Green
    Write-Host "Your data in S3 and DynamoDB is preserved" -ForegroundColor Cyan
    Write-Host "Run dev-start.ps1 tomorrow to resume development" -ForegroundColor Cyan
} else {
    Write-Host "Failed to delete base stack" -ForegroundColor Red
    exit 1
}

Write-Host "Development infrastructure stopped successfully!" -ForegroundColor Green