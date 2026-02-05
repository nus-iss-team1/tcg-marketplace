# Start development infrastructure for daily development
# Rebuilds the base stack (VPC/Networking) for development work
# Storage and auth stacks should already be running

Write-Host "🚀 Starting TCG Marketplace development infrastructure..." -ForegroundColor Yellow

# Check if storage stack exists
Write-Host "Checking storage stack status..." -ForegroundColor Blue
$storageStatus = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text 2>$null

if ($storageStatus -ne "CREATE_COMPLETE" -and $storageStatus -ne "UPDATE_COMPLETE") {
    Write-Host "⚠️  Storage stack not found or not ready. Your data might not be available." -ForegroundColor Yellow
}

# Deploy base stack
Write-Host "Deploying base stack (VPC/Networking)..." -ForegroundColor Blue
aws cloudformation deploy --template-file base.yml --stack-name tcg-marketplace-dev-base --parameter-overrides Environment=dev ProjectName=tcg-marketplace --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base stack deployed successfully" -ForegroundColor Green
    
    # Get key outputs
    Write-Host "📋 Getting infrastructure details..." -ForegroundColor Blue
    $vpcId = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-base --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" --output text
    $s3Bucket = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text 2>$null
    $dynamoTable = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='DynamoDBTableName'].OutputValue" --output text 2>$null
    
    Write-Host "🌐 VPC ID: $vpcId" -ForegroundColor Cyan
    if ($s3Bucket) { Write-Host "🪣 S3 Bucket: $s3Bucket" -ForegroundColor Cyan }
    if ($dynamoTable) { Write-Host "🗄️  DynamoDB Table: $dynamoTable" -ForegroundColor Cyan }
    
    Write-Host "💰 Daily cost: ~$1.58 (remember to run dev-stop.ps1 tonight!)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to deploy base stack" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Development infrastructure ready! You can now run your backend and frontend." -ForegroundColor Green