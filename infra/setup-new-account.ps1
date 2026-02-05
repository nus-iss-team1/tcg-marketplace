# Setup TCG Marketplace in a new AWS account
# Automatically detects account ID and updates configurations

Write-Host "🚀 Setting up TCG Marketplace in new AWS account..." -ForegroundColor Yellow

# Get current AWS account ID
Write-Host "Detecting AWS account..." -ForegroundColor Blue
$accountId = aws sts get-caller-identity --query "Account" --output text

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to get AWS account ID. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Detected AWS Account: $accountId" -ForegroundColor Green

# Update backend environment variables
Write-Host "Updating backend configuration..." -ForegroundColor Blue
$envPath = "..\backend\.env"

if (Test-Path $envPath) {
    # Update account ID in .env file
    (Get-Content $envPath) -replace 'AWS_ACCOUNT_ID=\d+', "AWS_ACCOUNT_ID=$accountId" | Set-Content $envPath
    
    # Update bucket name (will be generated during deployment)
    (Get-Content $envPath) -replace 'BUCKET_NAME=tcg-marketplace-dev-storage-\d+', "BUCKET_NAME=tcg-marketplace-dev-storage-$accountId" | Set-Content $envPath
    
    Write-Host "✅ Updated backend/.env with new account ID" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env file not found at $envPath" -ForegroundColor Yellow
}

# Deploy infrastructure
Write-Host "Deploying infrastructure to new account..." -ForegroundColor Blue
Write-Host "This will take about 10-15 minutes..." -ForegroundColor Cyan

# Deploy base stack
Write-Host "1/3 Deploying base infrastructure..." -ForegroundColor Blue
aws cloudformation deploy --template-file base.yml --stack-name tcg-marketplace-dev-base --parameter-overrides Environment=dev ProjectName=tcg-marketplace --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy base stack" -ForegroundColor Red
    exit 1
}

# Deploy storage stack
Write-Host "2/3 Deploying storage infrastructure..." -ForegroundColor Blue
aws cloudformation deploy --template-file storage-simple.yml --stack-name tcg-marketplace-dev-storage-simple --parameter-overrides Environment=dev ProjectName=tcg-marketplace --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy storage stack" -ForegroundColor Red
    exit 1
}

# Deploy auth stack
Write-Host "3/3 Deploying authentication infrastructure..." -ForegroundColor Blue
aws cloudformation deploy --template-file auth-minimal.yml --stack-name tcg-marketplace-dev-auth-minimal --parameter-overrides Environment=dev ProjectName=tcg-marketplace --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy auth stack" -ForegroundColor Red
    exit 1
}

# Get final resource names
Write-Host "Getting deployed resource information..." -ForegroundColor Blue
$bucketName = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text
$tableName = aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='DynamoDBTableName'].OutputValue" --output text

# Update .env with actual deployed names
if ($bucketName -and $tableName) {
    (Get-Content $envPath) -replace 'BUCKET_NAME=.*', "BUCKET_NAME=$bucketName" | Set-Content $envPath
    (Get-Content $envPath) -replace 'TABLE_NAME=.*', "TABLE_NAME=$tableName" | Set-Content $envPath
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "📊 Account ID: $accountId" -ForegroundColor Cyan
Write-Host "🪣 S3 Bucket: $bucketName" -ForegroundColor Cyan
Write-Host "🗄️  DynamoDB Table: $tableName" -ForegroundColor Cyan
Write-Host "💰 Monthly cost: ~$47.45 (same as before)" -ForegroundColor Yellow
Write-Host "`n🚀 You can now run your backend and frontend!" -ForegroundColor Green
Write-Host "   Backend: cd ..\backend && npm run start:dev" -ForegroundColor White
Write-Host "   Frontend: cd ..\frontend && npm run dev" -ForegroundColor White