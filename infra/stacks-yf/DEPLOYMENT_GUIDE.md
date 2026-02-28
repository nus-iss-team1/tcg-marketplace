# TCG Marketplace - Infrastructure Deployment Guide

This guide walks you through deploying the AWS infrastructure foundation for the TCG Marketplace application.

## 🎯 Purpose

This guide sets up the **infrastructure foundation only**. Frontend and backend engineers will implement the application logic on top of this infrastructure.

## 📦 What This Deploys

**3 CloudFormation Stacks:**
1. **base.yml** - VPC, public subnets, security groups
2. **storage.yml** - S3 bucket, DynamoDB table, IAM roles
3. **compute-fullstack.yml** - ECS Fargate cluster, ALB, container services

**What's NOT included:** Application code implementation (frontend/backend engineers will handle this)

## Prerequisites

### Required Tools
- **AWS CLI** - Configured with credentials for your AWS account
- **PowerShell** - For running deployment scripts (Windows)
- **Docker** - For building container images (when application code is ready)

### AWS Account Requirements
- AWS account with admin access
- Account ID (you'll need this for configuration)
- Region: `ap-southeast-1` (Singapore)

### Knowledge Requirements
- Basic understanding of AWS CloudFormation
- Familiarity with VPC, ECS, and ALB concepts

## Deployment Overview

The infrastructure deployment consists of 4 main steps:

1. **Configure Parameters** - Update account ID and settings
2. **Deploy Base Infrastructure** - VPC, subnets, security groups
3. **Deploy Storage** - S3 bucket and DynamoDB table
4. **Deploy Compute** - ECS Fargate cluster and ALB

**Estimated Time**: 15-20 minutes  
**Estimated Monthly Cost**: $25-35 USD

**Note:** Application deployment (Docker images) will be handled by frontend/backend engineers after infrastructure is ready.

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

## Step 2: Deploy Base Infrastructure

### 2.1 Deploy VPC, Subnets, and Security Groups

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

**What this creates:**
- VPC with public subnets (no NAT Gateway for cost savings)
- Security groups for ALB and ECS tasks
- Internet Gateway for public access

---

## Step 3: Deploy Storage Infrastructure

### 3.1 Deploy S3 Bucket and DynamoDB Table

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

**What this creates:**
- S3 bucket for card images
- DynamoDB table for listings data
- IAM roles for ECS tasks to access S3 and DynamoDB

---

## Step 4: Create ECR Repositories

### 4.1 Create Container Registries

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

**What this creates:**
- ECR repositories for Docker images
- Frontend and backend engineers will push their images here

---

## Step 5: Deploy Compute Infrastructure

### 5.1 Deploy ECS Cluster and ALB

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

**What this creates:**
- ECS Fargate cluster
- Application Load Balancer (ALB)
- Target groups for frontend and backend
- ECS services (will start once Docker images are available)
- Auto-scaling configuration
- CloudWatch log groups

### 5.2 Get Application URL

```powershell
# Get ALB DNS name
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
  --output text `
  --region ap-southeast-1
```

The output will be something like: `tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com`

**Save this URL** - frontend/backend engineers will need it for testing.

---

## Step 6: Verify Infrastructure Deployment

### 6.1 Check All Stacks

```powershell
aws cloudformation list-stacks `
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE `
  --region ap-southeast-1 `
  --query "StackSummaries[?contains(StackName, 'tcg-marketplace')].{Name:StackName, Status:StackStatus}" `
  --output table
```

**Expected output:**
```
tcg-marketplace-dev-base            CREATE_COMPLETE
tcg-marketplace-dev-storage         CREATE_COMPLETE
tcg-marketplace-dev-compute         CREATE_COMPLETE
```

### 6.2 Check ECS Cluster

```powershell
aws ecs describe-clusters `
  --clusters tcg-marketplace-dev-cluster `
  --region ap-southeast-1
```

### 6.3 Check ECR Repositories

```powershell
aws ecr describe-repositories `
  --region ap-southeast-1 `
  --query "repositories[?contains(repositoryName, 'tcg-marketplace')].repositoryUri" `
  --output table
```

---

## Next Steps for Engineers

### For Backend Engineers

**What's ready:**
- ✅ ECS Fargate cluster configured
- ✅ Backend ECS service created (waiting for Docker image)
- ✅ DynamoDB table: `tcg-marketplace-dev-listings`
- ✅ S3 bucket for image storage
- ✅ IAM roles with permissions to access DynamoDB and S3
- ✅ ALB routing: `/api/*` → backend service
- ✅ Health check endpoint: `/api/health`

**What to do:**
1. Build backend Docker image
2. Push to ECR: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest`
3. Update ECS service to deploy the image
4. Implement API endpoints using the provided adapter interfaces

**Environment variables available in ECS:**
- `AWS_REGION`: ap-southeast-1
- `BUCKET_NAME`: tcg-marketplace-dev-storage-xxxxx
- `TABLE_NAME`: tcg-marketplace-dev-listings
- `NODE_ENV`: dev
- `PORT`: 3000

### For Frontend Engineers

**What's ready:**
- ✅ ECS Fargate cluster configured
- ✅ Frontend ECS service created (waiting for Docker image)
- ✅ ALB routing: `/` → frontend service
- ✅ Backend API available at: `/api/*` (relative path)

**What to do:**
1. Build frontend Docker image
2. Push to ECR: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest`
3. Update ECS service to deploy the image
4. Configure API calls to use relative path `/api` (not hardcoded URLs)

**Important configuration:**
- Use `process.env.NEXT_PUBLIC_API_URL || '/api'` for API calls
- Do NOT hardcode `localhost:3000` in configuration
- ALB handles routing between frontend and backend

---

## Automated Deployment Script (Alternative)

Instead of manual steps, you can use the automated script:

```powershell
cd tcg-marketplace/infra

# Deploy all infrastructure stacks
.\deploy.ps1 -Environment dev -ParameterFile parameters/dev-fullstack.json
```

This script will:
- Deploy base, storage, and compute stacks in order
- Wait for each stack to complete
- Show you the ALB URL at the end

---

## Architecture Overview

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
    ├─→ / (root path) → Frontend ECS Service (port 3000)
    └─→ /api/* → Backend ECS Service (port 3000)
                     ↓
                     ├─→ DynamoDB (listings table)
                     └─→ S3 (images bucket)
```

**Infrastructure Components:**
- **VPC**: Public subnets in 2 availability zones
- **ALB**: Path-based routing (single load balancer for cost efficiency)
- **ECS Fargate**: Serverless containers for frontend and backend
- **DynamoDB**: NoSQL database for listings data
- **S3**: Object storage for card images
- **ECR**: Docker image registry
- **CloudWatch**: Logging and monitoring

**Key Design Decisions:**
- Public subnets (no NAT Gateway) - saves ~$35/month
- Single ALB with path-based routing - saves ~$16/month vs separate ALBs
- ECS Fargate - no EC2 instance management
- On-demand DynamoDB - pay per request, no provisioned capacity

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

### Issue: ECS services show 0 running tasks

**Cause**: No Docker images pushed to ECR yet (expected at this stage)

**Solution**: This is normal. ECS services will start once engineers push Docker images to ECR.

### Issue: Cannot access ALB URL

**Cause**: Security group or routing issue

**Solution**: 
1. Check security groups allow HTTP (port 80) from 0.0.0.0/0
2. Verify ALB is in "active" state
3. Check target groups have registered targets (will be empty until images are deployed)

### Issue: Stack deletion fails

**Cause**: Resources have dependencies or are not empty

**Solution**:
```powershell
# Empty S3 bucket first
aws s3 rm s3://tcg-marketplace-dev-storage-xxxxx --recursive --region ap-southeast-1

# Then delete stacks in reverse order
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-storage --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1
```

---

## Cleanup / Teardown

To delete all infrastructure and stop incurring costs:

```powershell
cd tcg-marketplace/infra

# Delete in reverse order (compute → storage → base)
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-compute --region ap-southeast-1

# Empty S3 bucket before deleting storage stack
aws s3 rm s3://BUCKET_NAME --recursive --region ap-southeast-1

aws cloudformation delete-stack --stack-name tcg-marketplace-dev-storage --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-storage --region ap-southeast-1

aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-base --region ap-southeast-1

# Delete ECR repositories (optional - will delete all images)
aws ecr delete-repository --repository-name tcg-marketplace-dev-backend --force --region ap-southeast-1
aws ecr delete-repository --repository-name tcg-marketplace-dev-frontend --force --region ap-southeast-1
```

**Note**: Get the S3 bucket name from CloudFormation outputs:
```powershell
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-storage `
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' `
  --output text `
  --region ap-southeast-1
```

---

## Additional Resources

**Infrastructure Documentation:**
- `infra/README.md` - Detailed infrastructure documentation
- `infra/ARCHITECTURE_CHANGES.md` - Architecture evolution and decisions
- `infra/base.yml` - VPC template with inline comments
- `infra/storage.yml` - Storage template with inline comments
- `infra/compute-fullstack.yml` - Compute template with inline comments

**For Engineers:**
- `backend/README.md` - Backend setup and development guide
- `frontend/README.md` - Frontend setup and development guide
- `DEVELOPER_SETUP.md` - Complete developer onboarding guide

---

## Summary

You've successfully deployed the infrastructure foundation:

✅ **3 CloudFormation stacks** (base, storage, compute)  
✅ **2 ECR repositories** (backend, frontend)  
✅ **Cost-optimized architecture** (~$25-35/month)  
✅ **Ready for application deployment** by engineering teams

**Next:** Share the ALB URL and ECR repository URIs with frontend/backend engineers to begin application deployment.
