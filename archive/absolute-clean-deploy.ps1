# Absolute clean deployment - removes ALL Docker cache
$ErrorActionPreference = "Stop"

$REGION = "ap-southeast-1"
$ACCOUNT_ID = "274603886128"
$ECR_REPO = "tcg-marketplace-dev-frontend"
$IMAGE_TAG = "latest"
$CLUSTER = "tcg-marketplace-dev-cluster"
$SERVICE = "tcg-marketplace-dev-frontend"

Write-Output "=== ABSOLUTE CLEAN DEPLOYMENT ==="
Write-Output ""

# Step 0: Verify no .env files
Write-Output "0. Verifying no .env files..."
$envFiles = Get-ChildItem -Path frontend -Filter ".env*" -File -Force | Where-Object { $_.Name -ne ".env.example" }
if ($envFiles) {
    Write-Output "ERROR: Found .env files that should not exist:"
    $envFiles | ForEach-Object { Write-Output "  - $($_.Name)" }
    exit 1
}
Write-Output "   OK No .env files found"
Write-Output ""

# Step 1: Remove ALL Docker build cache
Write-Output "1. Removing ALL Docker build cache..."
docker builder prune -af --filter "label!=keep"
Write-Output "   OK Cache cleared"
Write-Output ""

# Step 2: Remove old images
Write-Output "2. Removing old images..."
docker images | Select-String "$ECR_REPO" | ForEach-Object {
    $imageId = ($_ -split '\s+')[2]
    docker rmi -f $imageId 2>$null | Out-Null
}
Write-Output "   OK Old images removed"
Write-Output ""

# Step 3: Build with timestamp to force new build
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
Write-Output "3. Building Docker image (build ID: $timestamp)..."
Write-Output "   This will take 3-5 minutes..."

# Add a build arg to force cache invalidation
docker build --no-cache --pull --build-arg BUILD_ID=$timestamp -t $ECR_REPO`:$IMAGE_TAG -f frontend/Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: Docker build failed!"
    exit 1
}

Write-Output "   OK Build successful"
Write-Output ""

# Step 4: Verify the image doesn't have localhost:3000
Write-Output "4. Verifying image contents..."
$checkResult = docker run --rm $ECR_REPO`:$IMAGE_TAG sh -c "cat /app/frontend/.next/static/chunks/app/page-*.js 2>/dev/null | grep -o 'localhost:3000' | head -1" 2>$null

if ($checkResult -match "localhost:3000") {
    Write-Output "ERROR: Image still contains localhost:3000!"
    Write-Output "   This should not happen. Please check the source code."
    exit 1
}
Write-Output "   OK Image does not contain localhost:3000"
Write-Output ""

# Step 5: Login to ECR
Write-Output "5. Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: ECR login failed!"
    exit 1
}

Write-Output "   OK Logged in"
Write-Output ""

# Step 6: Tag image for ECR
Write-Output "6. Tagging image for ECR..."
docker tag "$ECR_REPO`:$IMAGE_TAG" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO`:$IMAGE_TAG"
Write-Output "   OK Tagged"
Write-Output ""

# Step 7: Push to ECR
Write-Output "7. Pushing image to ECR..."
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO`:$IMAGE_TAG"

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: Docker push failed!"
    exit 1
}

Write-Output "   OK Pushed to ECR"
Write-Output ""

# Step 8: Force new deployment
Write-Output "8. Forcing new ECS deployment..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION --no-cli-pager

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: ECS update failed!"
    exit 1
}

Write-Output "   OK Deployment initiated"
Write-Output ""

# Step 9: Wait for deployment
Write-Output "9. Waiting for deployment to complete..."
Write-Output "   This may take 2-3 minutes..."
Write-Output ""

$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    $rolloutState = aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION --query 'services[0].deployments[0].rolloutState' --output text
    
    Write-Output "   Attempt $attempt/$maxAttempts - Status: $rolloutState"
    
    if ($rolloutState -eq "COMPLETED") {
        Write-Output ""
        Write-Output "   OK Deployment completed successfully!"
        break
    }
    
    if ($rolloutState -eq "FAILED") {
        Write-Output ""
        Write-Output "   ERROR: Deployment failed!"
        exit 1
    }
    
    Start-Sleep -Seconds 10
}

Write-Output ""
Write-Output "=== DEPLOYMENT COMPLETE ==="
Write-Output ""
Write-Output "Frontend URL: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/"
Write-Output ""
Write-Output "IMPORTANT: Clear your browser cache completely before testing!"
Write-Output "In Chrome: Ctrl+Shift+Delete > Clear all cached images and files"
Write-Output ""
Write-Output "Then check Console for: API URL: /api"
