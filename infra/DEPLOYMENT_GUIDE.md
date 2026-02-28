# TCG Marketplace - Complete Deployment Guide

This guide walks you through deploying the TCG Marketplace application to a new AWS account from scratch.

## ⚠️ CRITICAL: Read This First

**Before deploying, review `DEPLOYMENT_CHECKLIST.md` to avoid common issues:**
- Frontend calling `localhost:3000` instead of `/api`
- `.env.local` files being baked into Docker images
- Docker cache preventing configuration updates

The checklist contains verification steps and troubleshooting for issues we've already resolved.

## Prerequisites

### Required Tools
- **AWS CLI** - Configured with credentials for your AWS account
- **Docker** - For building container images
- **Node.js** - Version 18+ (for local development/testing)
- **PowerShell** - For running deployment scripts (Windows)

### AWS Account Requirements
- AWS account with admin access
- Account ID (you'll need this for configuration)
- Choose a region (default: `ap-southeast-1`)

## Deployment Overview

The deployment consists of 4 main steps:

1. **Configure Parameters** - Update account ID and settings
2. **Deploy Infrastructure** - VPC, S3, DynamoDB, ECS, ALB
3. **Build & Push Docker Images** - Backend and Frontend containers
4. **Deploy Application** - Update ECS services with new images

**Estimated Time**: 30-45 minutes  
**Estimated Monthly Cost**: $25-35 USD

---

## Step 1: Configure Parameters

### 1.1 Update Parameter File

Edit `infra/parameters/dev-fullstack.json`:

```json
{
  "Parameters": {
    "Environment": "dev",
    "ProjectName": "tcg-marketplace",
    "BackendImageUri": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest",
    "FrontendImageUri": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest"
  }
}
```

**Replace `YOUR_ACCOUNT_ID`** with your AWS account ID.

### 1.2 Verify AWS CLI Configuration

```powershell
# Check your AWS account ID
aws sts get-caller-identity --query Account --output text

# Check your region
aws configure get region

# If region is not set, configure it
aws configure set region ap-southeast-1
```

---

## Step 2: Deploy Infrastructure

### 2.1 Deploy Base Infrastructure (VPC, Subnets, Security Groups)

```powershell
cd tcg-marketplace/infra

aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-base `
  --template-body file://base.yml `
  --parameters ParameterKey=Environment,ParameterValue=dev `
  --region ap-southeast-1

# Wait for completion (2-3 minutes)
aws cloudformation wait stack-create-complete `
  --stack-name tcg-marketplace-dev-base `
  --region ap-southeast-1
```

### 2.2 Deploy Storage (S3, DynamoDB, IAM Roles)

```powershell
aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-storage `
  --template-body file://storage.yml `
  --parameters ParameterKey=Environment,ParameterValue=dev `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1

# Wait for completion (2-3 minutes)
aws cloudformation wait stack-create-complete `
  --stack-name tcg-marketplace-dev-storage `
  --region ap-southeast-1
```

### 2.3 Create ECR Repositories

```powershell
# Create backend repository
aws ecr create-repository `
  --repository-name tcg-marketplace-dev-backend `
  --region ap-southeast-1

# Create frontend repository
aws ecr create-repository `
  --repository-name tcg-marketplace-dev-frontend `
  --region ap-southeast-1
```

---

## Step 3: Build & Push Docker Images

**⚠️ IMPORTANT**: Clear Docker cache first to ensure fresh builds with correct configuration:

```powershell
cd tcg-marketplace

# Clear Docker build cache (CRITICAL for config changes)
docker builder prune -af

# Build backend
docker build -t tcg-marketplace-dev-backend:latest -f backend/Dockerfile .

# Tag for ECR
docker tag tcg-marketplace-dev-backend:latest `
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest
```

### 3.2 Build Frontend Image

```powershell
# Build frontend with BUILD_ID to force cache invalidation
docker build `
  --build-arg BUILD_ID=$(Get-Date -Format "yyyyMMddHHmmss") `
  -t tcg-marketplace-dev-frontend:latest `
  -f frontend/Dockerfile .

# Tag for ECR
docker tag tcg-marketplace-dev-frontend:latest `
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest
```

### 3.3 Push Images to ECR

```powershell
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | `
  docker login --username AWS --password-stdin `
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Push backend
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest

# Push frontend
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest
```

**Replace `YOUR_ACCOUNT_ID`** in all commands above.

---

## Step 4: Deploy Application (ECS, ALB)

### 4.1 Deploy Compute Stack

```powershell
cd tcg-marketplace/infra

aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-compute `
  --template-body file://compute-fullstack.yml `
  --parameters file://parameters/dev-fullstack.json `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1

# Wait for completion (5-7 minutes)
aws cloudformation wait stack-create-complete `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1
```

### 4.2 Get Application URL

```powershell
# Get ALB DNS name
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
  --output text `
  --region ap-southeast-1
```

The output will be something like: `tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com`

---

## Step 5: Verify Deployment

### 5.1 Check Backend Health

```powershell
# Replace with your ALB DNS
$ALB_DNS = "tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com"

# Test backend health endpoint
curl "http://$ALB_DNS/api/health"
```

Expected response: `{"status":"ok","timestamp":"..."}`

### 5.2 Check Frontend

Open in browser: `http://YOUR_ALB_DNS/`

You should see the TCG Marketplace homepage.

### 5.3 Test Full Flow

1. Click "Sell Card" button
2. Fill out the form:
   - Title: "Test Card"
   - Description: "Test listing"
   - Price: 100
   - Category: Vintage
3. Click "Create Listing"
4. Go back to homepage
5. Verify the new listing appears

---

## Automated Deployment Script (Alternative)

Instead of manual steps, you can use the automated script:

```powershell
cd tcg-marketplace/infra

# Deploy all infrastructure
.\deploy.ps1 -Environment dev -ParameterFile parameters/dev-fullstack.json
```

This script will:
- Deploy base, storage, and compute stacks in order
- Wait for each stack to complete
- Show you the ALB URL at the end

**Note**: You still need to build and push Docker images manually (Step 3).

---

## Architecture Overview

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
    ├─→ / (root path) → Frontend (Next.js on ECS Fargate)
    └─→ /api/* → Backend (NestJS on ECS Fargate)
                     ↓
                     ├─→ DynamoDB (listings data)
                     └─→ S3 (card images)
```

**Key Features:**
- Path-based routing: Frontend at `/`, Backend at `/api/*`
- Single ALB for both services (cost-effective)
- Public subnets (no NAT Gateway needed)
- ECS Fargate (serverless containers)
- Auto-scaling enabled (1-3 tasks per service)

---

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| ALB | ~$16 |
| ECS Fargate (2 tasks) | ~$8 |
| DynamoDB (on-demand) | ~$1-5 |
| S3 | ~$1-5 |
| Data Transfer | ~$1-5 |
| **Total** | **~$25-35** |

---

## Troubleshooting

### Issue: Stack creation fails

**Solution**: Check CloudFormation events:
```powershell
aws cloudformation describe-stack-events `
  --stack-name tcg-marketplace-dev-STACK_NAME `
  --region ap-southeast-1 `
  --max-items 10
```

### Issue: ECS tasks not starting

**Solution**: Check ECS service events:
```powershell
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend tcg-marketplace-dev-frontend `
  --region ap-southeast-1 `
  --query 'services[*].events[0:3]'
```

### Issue: Frontend shows "Failed to fetch"

**Possible causes:**
1. Backend not healthy - check `/api/health` endpoint
2. Browser cache - clear cache and hard refresh (Ctrl+Shift+R)
3. CORS issues - check backend logs

**Check backend logs:**
```powershell
aws logs tail /ecs/tcg-marketplace-dev-backend `
  --follow `
  --region ap-southeast-1
```

### Issue: Docker build fails

**Solution**: Clear Docker cache and rebuild:
```powershell
docker builder prune -af
docker build --no-cache -t IMAGE_NAME -f Dockerfile .
```

---

## Cleanup / Teardown

To delete all resources and stop incurring costs:

```powershell
cd tcg-marketplace/infra

# Delete in reverse order
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-compute --region ap-southeast-1

aws cloudformation delete-stack --stack-name tcg-marketplace-dev-storage --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-storage --region ap-southeast-1

aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-base --region ap-southeast-1

# Delete ECR repositories (optional - will delete images)
aws ecr delete-repository --repository-name tcg-marketplace-dev-backend --force --region ap-southeast-1
aws ecr delete-repository --repository-name tcg-marketplace-dev-frontend --force --region ap-southeast-1
```

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional) - Use Route 53 and ACM for HTTPS
2. **Enable authentication** (optional) - Deploy `auth.yml` for Cognito
3. **Set up monitoring** (optional) - Deploy `monitoring.yml` for CloudWatch dashboards
4. **Configure CI/CD** - Automate deployments with GitHub Actions or AWS CodePipeline

---

## Support

For issues or questions:
- Check `infra/README.md` for infrastructure details
- Check `backend/README.md` for backend documentation
- Check `frontend/README.md` for frontend documentation
- Review CloudFormation stack events for deployment errors
- Check ECS service logs for runtime errors
