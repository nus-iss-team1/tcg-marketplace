# Manual Deployment Guide - Complete Command Reference

This guide contains all the commands used to manually deploy the TCG Marketplace backend to ECS Fargate.

## Overview

This guide shows you how to:
1. **Build a Docker image** from your NestJS backend
2. **Push the image to AWS ECR** (Elastic Container Registry)
3. **Deploy to ECS Fargate** using CloudFormation
4. **Access your backend** via public ALB URL or private IP

**Two Access Methods:**
- **Public Access**: Via Application Load Balancer (ALB) - `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`
- **Internal Access**: Via Private IP within VPC - `http://10.0.1.87:3000` (for microservices)

**Time Required**: 15-30 minutes for first deployment

## Complete Deployment Workflow

### Step 1: Prerequisites

```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to start (30-60 seconds)
Start-Sleep -Seconds 60

# Verify Docker is running
docker ps

# Verify AWS CLI is configured
aws sts get-caller-identity
```

### Step 2: Create ECR Repository

```powershell
# Create ECR repository for backend images
aws ecr create-repository `
  --repository-name tcg-marketplace-backend `
  --region ap-southeast-1

# Get ECR URI and save to variable
$ECR_URI = aws ecr describe-repositories `
  --repository-names tcg-marketplace-backend `
  --region ap-southeast-1 `
  --query 'repositories[0].repositoryUri' `
  --output text

# Display ECR URI
Write-Host "ECR Repository URI: $ECR_URI" -ForegroundColor Green
```

**Expected Output**: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend`

### Step 3: Build Docker Image

```powershell
# Navigate to backend directory
cd tcg-marketplace/backend

# Build Docker image
docker build -t tcg-marketplace-backend:latest .

# Verify image was created
docker images | Select-String "tcg-marketplace"
```

**Build Time**: 2-5 minutes (first time)

**Important**: The Dockerfile includes `RUN apk add --no-cache curl` to install curl for health checks. Without this, ECS health checks will fail and the deployment will be stuck.

### Step 4: Push Image to ECR

```powershell
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | `
  docker login --username AWS --password-stdin $ECR_URI

# Tag image with ECR URI
docker tag tcg-marketplace-backend:latest ${ECR_URI}:latest

# Push to ECR
docker push ${ECR_URI}:latest
```

**Push Time**: 1-3 minutes depending on image size

### Step 5: Deploy Base Infrastructure (If Not Already Deployed)

```powershell
# Navigate to infra directory
cd ../infra

# Deploy base stack (VPC + Security Groups)
aws cloudformation deploy `
  --template-file base.yml `
  --stack-name tcg-marketplace-dev-base `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --region ap-southeast-1

# Deploy storage stack (S3 + DynamoDB + IAM)
aws cloudformation deploy `
  --template-file storage.yml `
  --stack-name tcg-marketplace-dev-storage `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1
```

**Deployment Time**: 2-3 minutes per stack

### Step 6: Handle Failed Stack (If Needed)

If the compute stack is in `ROLLBACK_COMPLETE` state:

```powershell
# Delete the failed stack
aws cloudformation delete-stack `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1
```

**Deletion Time**: 2-5 minutes

### Step 7: Deploy Compute Stack (ECS + ALB)

```powershell
# Deploy compute stack with your Docker image
./deploy.ps1 -Environment dev -Template compute -ImageUri "${ECR_URI}:latest"
```

**Deployment Time**: 5-10 minutes (ECS service creation is slow)

### Step 8: Get Backend URL

```powershell
# Option 1: Get from CloudFormation outputs (after stack completes)
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1 `
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' `
  --output text

# Option 2: Get ALB DNS directly
aws elbv2 describe-load-balancers `
  --region ap-southeast-1 `
  --query 'LoadBalancers[?contains(LoadBalancerName, `tcg-marketplace-dev`)].DNSName' `
  --output text
```

**Your Backend URL**: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`

### Step 9: Get Private IP for Internal VPC Access

The ECS Fargate tasks have both public and private IP addresses. The private IP is useful for:
- Accessing the backend from other services within the same VPC
- Internal microservice communication
- Cost optimization (no ALB charges for internal traffic)

```powershell
# Get task ARN
$TASK_ARN = aws ecs list-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --service-name tcg-marketplace-dev-backend `
  --region ap-southeast-1 `
  --query 'taskArns[0]' `
  --output text

# Get private IP
$PRIVATE_IP = aws ecs describe-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --tasks $TASK_ARN `
  --region ap-southeast-1 `
  --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' `
  --output text

# Display results
Write-Host "Private IP: $PRIVATE_IP" -ForegroundColor Green
Write-Host "Port: 3000" -ForegroundColor Yellow
Write-Host "Internal URL: http://${PRIVATE_IP}:3000" -ForegroundColor Cyan
```

**Private IP Range**: `10.0.x.x` (only accessible within VPC)

**Important Notes:**
- Private IP changes when tasks are redeployed or restarted
- Only accessible from resources within the same VPC (e.g., other ECS tasks, EC2 instances, Lambda functions with VPC access)
- For stable internal access, use AWS Service Discovery or the ALB DNS name
- Current private IP: `10.0.1.87`

**Testing Internal Access:**
To test internal access, you need to be inside the VPC. Options:
1. From another ECS task in the same VPC
2. From an EC2 instance in the same VPC
3. From a Lambda function with VPC configuration
4. Via AWS Systems Manager Session Manager on an EC2 instance

Example from within VPC:
```bash
curl http://10.0.1.87:3000/health
```

### Step 10: Test Backend

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com/health" -UseBasicParsing

# Test listings endpoint
Invoke-WebRequest -Uri "http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com/listings?category=vintage" -UseBasicParsing

# Or use curl (if available)
curl http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com/health
```

**Expected Response**: Status 200 OK with JSON data

## Quick Reference - Future Updates

### Update Backend Code

```powershell
# 1. Navigate to backend
cd tcg-marketplace/backend

# 2. Make your code changes
# ... edit files ...

# 3. Rebuild image
docker build -t tcg-marketplace-backend:latest .

# 4. Set ECR URI variable
$ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"

# 5. Login to ECR
aws ecr get-login-password --region ap-southeast-1 | `
  docker login --username AWS --password-stdin $ECR_URI

# 6. Tag and push
docker tag tcg-marketplace-backend:latest ${ECR_URI}:latest
docker push ${ECR_URI}:latest

# 7. Force ECS to deploy new version
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --force-new-deployment `
  --region ap-southeast-1
```

### One-Line Update (After Initial Setup)

```powershell
$ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"; cd tcg-marketplace/backend; docker build -t tcg-marketplace-backend:latest .; aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $ECR_URI; docker tag tcg-marketplace-backend:latest ${ECR_URI}:latest; docker push ${ECR_URI}:latest; aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --force-new-deployment --region ap-southeast-1
```

## Monitoring Commands

### View Logs
```powershell
# Real-time logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1

# Last 100 lines
aws logs tail /ecs/tcg-marketplace-dev --region ap-southeast-1
```

### Check Service Status
```powershell
# Service details
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --region ap-southeast-1

# Task count
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --region ap-southeast-1 `
  --query 'services[0].[desiredCount,runningCount]' `
  --output table
```

### Check Stack Status
```powershell
# Stack status
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1 `
  --query 'Stacks[0].StackStatus' `
  --output text

# Recent stack events
aws cloudformation describe-stack-events `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1 `
  --max-items 10 `
  --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' `
  --output table
```

## Cost Management

### Stop Tasks (Save ~$8-24/month)
```powershell
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 0 `
  --region ap-southeast-1
```

### Start Tasks
```powershell
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 1 `
  --region ap-southeast-1
```

### Scale Tasks
```powershell
# Scale to 3 tasks
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 3 `
  --region ap-southeast-1
```

**Note**: ALB costs ~$16/month even when tasks are stopped.

## Troubleshooting

### Docker Build Fails
```powershell
# Check Docker is running
docker ps

# Check Dockerfile syntax
Get-Content tcg-marketplace/backend/Dockerfile

# Build with verbose output
docker build -t tcg-marketplace-backend:latest . --progress=plain
```

### ECR Push Fails
```powershell
# Re-authenticate
$ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"
aws ecr get-login-password --region ap-southeast-1 | `
  docker login --username AWS --password-stdin $ECR_URI

# Check image exists locally
docker images | Select-String "tcg-marketplace"
```

### Stack Deployment Fails
```powershell
# Check stack events for errors
aws cloudformation describe-stack-events `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1 `
  --max-items 20

# Check if dependencies are deployed
aws cloudformation list-stacks `
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE `
  --region ap-southeast-1 `
  --query 'StackSummaries[?contains(StackName, `tcg-marketplace`)].StackName'
```

### Health Checks Fail (CRITICAL)

**Problem**: ECS tasks fail health checks and deployment gets stuck in CREATE_IN_PROGRESS or triggers Circuit Breaker.

**Root Cause**: The Docker HEALTHCHECK uses `curl`, but Alpine Linux doesn't include curl by default.

**Solution**: Ensure Dockerfile includes curl installation:
```dockerfile
# In Dockerfile (already fixed)
RUN apk add --no-cache curl
```

**If Already Deployed Without Curl**:
```powershell
# 1. Fix Dockerfile (add curl installation)
# 2. Rebuild image
cd tcg-marketplace/backend
docker build -t tcg-marketplace-backend:latest .

# 3. Push to ECR
$ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $ECR_URI
docker tag tcg-marketplace-backend:latest ${ECR_URI}:latest
docker push ${ECR_URI}:latest

# 4. If stack is in ROLLBACK_COMPLETE, delete it
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-compute --region ap-southeast-1

# 5. Redeploy compute stack
cd ../infra
./deploy.ps1 -Environment dev -Template compute -ImageUri "${ECR_URI}:latest"
```

**Verification**:
```powershell
# Check task health status
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --region ap-southeast-1 `
  --query 'services[0].deployments[0].rolloutState'

# Should show: IN_PROGRESS (initially) then COMPLETED
# If shows: FAILED - check logs for health check errors
```

### Deployment Takes Too Long
```powershell
# Wait 2-3 minutes for service to start
Start-Sleep -Seconds 180

# Check logs for errors
aws logs tail /ecs/tcg-marketplace-dev --region ap-southeast-1

# Check task status
aws ecs list-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --service-name tcg-marketplace-dev-backend `
  --region ap-southeast-1
```

## Your Deployment Details

**AWS Account**: 274603886128  
**Region**: ap-southeast-1  
**ECR Repository**: 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend  
**Backend URL**: http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com  
**ECS Cluster**: tcg-marketplace-dev-cluster  
**ECS Service**: tcg-marketplace-dev-backend  
**Private IP**: 10.0.1.87 (current task - changes on redeploy)  

## Architecture Summary

```
Internet
    ↓
Application Load Balancer (Public)
  URL: http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com
  Port: 80
    ↓
ECS Fargate Tasks (Public Subnet with Public IP)
  Private IP: 10.0.1.87 (current)
  Public IP: Auto-assigned
  Port: 3000
    ↓
AWS Services
  S3: tcg-marketplace-dev-storage-274603886128
  DynamoDB: tcg-marketplace-dev-data
```

## Next Steps

1. ✅ Backend deployed and accessible
2. ⏭️ Deploy frontend (see options in main README)
3. ⏭️ Configure HTTPS with ACM certificate
4. ⏭️ Set up monitoring (deploy monitoring.yml)
5. ⏭️ Configure CI/CD pipeline

## Internal VPC Access Patterns

### Understanding Access Methods

Your Fargate tasks have two ways to be accessed:

**1. Public Access via ALB (Recommended for external traffic)**
- URL: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`
- Accessible from anywhere on the internet
- Load balanced across multiple tasks
- Health checks and auto-scaling
- Cost: ~$16/month for ALB

**2. Internal Access via Private IP (For VPC-internal services)**
- URL: `http://10.0.1.87:3000` (current task)
- Only accessible from within the VPC
- Direct connection to specific task
- No ALB overhead
- Cost: Free (no additional charges)

### When to Use Internal IP Access

Use internal/private IP access when:
- Connecting from another ECS service in the same VPC
- Connecting from EC2 instances in the same VPC
- Connecting from Lambda functions with VPC configuration
- Building microservices that communicate internally
- Reducing costs by avoiding ALB for internal traffic

### How to Access via Internal IP

#### From Another ECS Task

1. Ensure both tasks are in the same VPC
2. Ensure security groups allow traffic between tasks
3. Use the private IP directly:

```typescript
// In your other ECS service
const backendUrl = 'http://10.0.1.87:3000';
const response = await fetch(`${backendUrl}/listings`);
```

#### From EC2 Instance

1. Launch EC2 instance in the same VPC
2. Ensure security group allows outbound traffic to ECS security group
3. SSH into EC2 and test:

```bash
curl http://10.0.1.87:3000/health
```

#### From Lambda Function

1. Configure Lambda with VPC access (same VPC as ECS)
2. Attach security group that allows outbound to ECS
3. Use private IP in Lambda code:

```javascript
const response = await fetch('http://10.0.1.87:3000/listings');
```

### Security Group Configuration for Internal Access

The ECS security group must allow inbound traffic from your source:

```powershell
# Allow traffic from another security group (e.g., Lambda or EC2)
aws ec2 authorize-security-group-ingress `
  --group-id <ecs-security-group-id> `
  --protocol tcp `
  --port 3000 `
  --source-group <source-security-group-id> `
  --region ap-southeast-1
```

### Getting Current Private IP Programmatically

If you need to discover the private IP dynamically:

```powershell
# PowerShell script to get current private IP
$TASK_ARN = aws ecs list-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --service-name tcg-marketplace-dev-backend `
  --region ap-southeast-1 `
  --query 'taskArns[0]' `
  --output text

$PRIVATE_IP = aws ecs describe-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --tasks $TASK_ARN `
  --region ap-southeast-1 `
  --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' `
  --output text

Write-Output $PRIVATE_IP
```

```bash
# Bash script to get current private IP
TASK_ARN=$(aws ecs list-tasks \
  --cluster tcg-marketplace-dev-cluster \
  --service-name tcg-marketplace-dev-backend \
  --region ap-southeast-1 \
  --query 'taskArns[0]' \
  --output text)

PRIVATE_IP=$(aws ecs describe-tasks \
  --cluster tcg-marketplace-dev-cluster \
  --tasks $TASK_ARN \
  --region ap-southeast-1 \
  --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' \
  --output text)

echo $PRIVATE_IP
```

### Alternative: AWS Service Discovery

For production use, consider AWS Service Discovery instead of hardcoding IPs:

**Benefits:**
- Automatic DNS-based service discovery
- No need to track changing IPs
- Built-in health checks
- Supports multiple tasks

**Setup:**
1. Create a private DNS namespace
2. Register ECS service with Service Discovery
3. Access via DNS name: `backend.local`

See AWS documentation for Service Discovery setup.

### Important Limitations

**Private IP Limitations:**
- Changes when task is redeployed or restarted
- Only one IP per task (not load balanced)
- Requires manual tracking or service discovery
- Not suitable for high-availability scenarios

**Recommendations:**
- Use ALB for external traffic and high availability
- Use private IP only for trusted internal services
- Consider Service Discovery for production microservices
- Always use security groups to restrict access

## Related Documentation

- [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) - Full deployment guide
- [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md) - Visual diagrams
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command cheat sheet
- [README.md](./README.md) - Infrastructure overview
