# Deploy Frontend to AWS ECS
$ErrorActionPreference = "Stop"

$REGION = "ap-southeast-1"
$ACCOUNT_ID = "274603886128"
$ECR_REPO = "tcg-marketplace-dev-frontend"
$IMAGE_TAG = "latest"
$CLUSTER = "tcg-marketplace-dev-cluster"
$SERVICE = "tcg-marketplace-dev-frontend"

Write-Output "=== DEPLOYING FRONTEND TO AWS ==="
Write-Output ""

# Step 1: Build Docker image
Write-Output "1. Building Docker image..."
docker build --no-cache -t $ECR_REPO`:$IMAGE_TAG -f frontend/Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: Docker build failed!"
    exit 1
}

Write-Output "   OK Build successful"
Write-Output ""

# Step 2: Login to ECR
Write-Output "2. Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: ECR login failed!"
    exit 1
}

Write-Output "   OK Logged in"
Write-Output ""

# Step 3: Tag image for ECR
Write-Output "3. Tagging image for ECR..."
docker tag "$ECR_REPO`:$IMAGE_TAG" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO`:$IMAGE_TAG"

Write-Output "   OK Tagged"
Write-Output ""

# Step 4: Push to ECR
Write-Output "4. Pushing image to ECR..."
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO`:$IMAGE_TAG"

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: Docker push failed!"
    exit 1
}

Write-Output "   OK Pushed to ECR"
Write-Output ""

# Step 5: Force new deployment
Write-Output "5. Forcing new ECS deployment..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION --no-cli-pager

if ($LASTEXITCODE -ne 0) {
    Write-Output "ERROR: ECS update failed!"
    exit 1
}

Write-Output "   OK Deployment initiated"
Write-Output ""

# Step 6: Wait for deployment
Write-Output "6. Waiting for deployment to complete..."
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
        Write-Output ""
        Write-Output "   Checking recent events..."
        aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION --query 'services[0].events[0:3].[createdAt,message]' --output table
        exit 1
    }
    
    Start-Sleep -Seconds 10
}

if ($attempt -eq $maxAttempts) {
    Write-Output ""
    Write-Output "   WARNING: Deployment still in progress after 5 minutes"
    Write-Output "   Check status manually with:"
    Write-Output "   aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
}

Write-Output ""
Write-Output "=== DEPLOYMENT COMPLETE ==="
Write-Output ""
Write-Output "Frontend URL: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/"
Write-Output ""
Write-Output "Test the deployment:"
Write-Output "1. Open the URL above in your browser"
Write-Output "2. Open DevTools Console (F12)"
Write-Output "3. Look for 'API URL: /api' in the console"
Write-Output "4. Check Network tab - should see requests to /api/listings"
Write-Output ""
Write-Output "If you see errors, check ECS logs:"
Write-Output "aws logs tail /ecs/tcg-marketplace-dev-frontend --follow --region $REGION"
