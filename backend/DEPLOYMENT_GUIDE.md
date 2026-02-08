# Backend Deployment Guide

## Prerequisites

- AWS CLI configured
- Docker installed
- Backend code with `/health` endpoint

## Step 1: Create ECR Repository

```powershell
aws ecr create-repository --repository-name tcg-marketplace-backend --region ap-southeast-1
```

## Step 2: Build Docker Image

```powershell
cd tcg-marketplace/backend

# Build the image
docker build -t tcg-marketplace-backend:latest .

# Test locally (optional)
docker run -p 3000:3000 -e AWS_REGION=ap-southeast-1 tcg-marketplace-backend:latest
```

## Step 3: Push to ECR

```powershell
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag the image
docker tag tcg-marketplace-backend:latest 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest

# Push to ECR
docker push 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest
```

## Step 4: Deploy to ECS

```powershell
cd tcg-marketplace/infra

# Deploy compute stack with your image
./deploy.ps1 -Environment dev -Template compute -ImageUri "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest"
```

## Step 5: Get Backend URL

```powershell
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-compute --region ap-southeast-1 --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerURL'].OutputValue" --output text
```

## Step 6: Test Backend

```powershell
# Replace with your actual ALB URL
curl http://YOUR-ALB-DNS-NAME/health
```

## Environment Variables

Your backend will automatically receive these from ECS:

- `NODE_ENV`: dev/staging/prod
- `PORT`: 3000
- `AWS_REGION`: ap-southeast-1
- `BUCKET_NAME`: tcg-marketplace-dev-storage-274603886128
- `TABLE_NAME`: tcg-marketplace-dev-data

IAM roles are already configured - no AWS credentials needed in code!

## Troubleshooting

### Health Check Failing

Make sure your backend has a `/health` endpoint that returns 200 OK:

```typescript
@Get('health')
health() {
  return { status: 'ok' };
}
```

### Can't Connect to S3/DynamoDB

Check that you're using AWS SDK v3 and not hardcoding credentials:

```typescript
// Good - uses IAM role automatically
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Bad - don't do this
const s3Client = new S3Client({ 
  credentials: { accessKeyId: '...', secretAccessKey: '...' }
});
```

### Container Crashes

Check ECS logs:

```powershell
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1
```
