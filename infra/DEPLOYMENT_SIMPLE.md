# Simplified Deployment Guide

> **Note:** This guide uses the current simplified architecture. The old complex architecture has been archived to **[archive/](./archive/)**. See **[archive/README.md](./archive/README.md)** if you need the full architecture with private subnets.

This guide covers the simplified architecture using ECS Fargate with public IP (no VPC complexity).

## Architecture Overview

```
Frontend (Next.js on Vercel/Amplify)
    ↓ HTTPS
Application Load Balancer (Public)
    ↓
ECS Fargate (Public IP)
    ↓ AWS SDK
S3 + DynamoDB
```

**What's removed:**
- ❌ Private subnets
- ❌ NAT Gateway ($32/month saved)
- ❌ VPC Link ($36/month saved)
- ❌ Network Load Balancer
- ❌ API Gateway complexity

**What's kept:**
- ✅ S3 for images
- ✅ DynamoDB for data
- ✅ ECS Fargate for backend
- ✅ Application Load Balancer
- ✅ IAM roles for security

## Complete Command Reference

For all manual commands with detailed explanations, see [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md). This guide provides the complete workflow including ECR setup, Docker build/push, and stack deployment with troubleshooting tips.

## Prerequisites

1. **AWS CLI configured**
   ```powershell
   aws configure
   aws sts get-caller-identity
   ```

2. **Docker installed** (for building backend image)
   ```powershell
   docker --version
   ```

3. **Backend Docker image built and pushed to ECR**
   
   See [../backend/DEPLOYMENT_GUIDE.md](../backend/DEPLOYMENT_GUIDE.md) for complete instructions, or quick start:
   
   ```powershell
   # Create ECR repository
   aws ecr create-repository --repository-name tcg-marketplace-backend --region ap-southeast-1
   
   # Build and push (see backend/DEPLOYMENT_GUIDE.md for details)
   cd tcg-marketplace/backend
   docker build -t tcg-marketplace-backend .
   
   # Tag and push to ECR
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
   docker tag tcg-marketplace-backend:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest
   docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest
   ```

## Deployment Steps

### Step 1: Deploy Storage (S3 + DynamoDB)

```powershell
cd tcg-marketplace/infra

aws cloudformation deploy `
  --template-file storage.yml `
  --stack-name tcg-marketplace-dev-storage `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1
```

**What this creates:**
- S3 bucket: `tcg-marketplace-dev-storage-<account-id>`
- DynamoDB table: `tcg-marketplace-dev-data`
- IAM roles for ECS tasks (task role and execution role)
- CloudFormation exports for cross-stack references

**Estimated cost:** ~$1-5/month (pay-per-use)

### Step 2: Deploy Base Infrastructure (VPC + Security Groups)

```powershell
aws cloudformation deploy `
  --template-file base.yml `
  --stack-name tcg-marketplace-dev-base `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --region ap-southeast-1
```

**What this creates:**
- VPC with 2 public subnets
- Internet Gateway
- Security groups for ALB and ECS
- Route tables

**Estimated cost:** ~$0/month (VPC is free, no NAT Gateway)

### Step 3: Deploy Compute (ECS + ALB)

```powershell
# Get your ECR image URI first
$ImageUri = "<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest"

aws cloudformation deploy `
  --template-file compute.yml `
  --stack-name tcg-marketplace-dev-compute `
  --parameter-overrides `
    Environment=dev `
    ProjectName=tcg-marketplace `
    ImageUri=$ImageUri `
  --region ap-southeast-1
```

**What this creates:**
- Application Load Balancer (public)
- ECS Cluster
- ECS Service with 1 Fargate task (auto-scales to 3 for dev, 10 for prod)
- Auto-scaling policies (CPU, memory, and request-based)
- Target Group
- CloudWatch Logs

**Estimated cost:** ~$15-25/month (base)
- ALB: ~$16/month
- Fargate (0.25 vCPU, 512MB): ~$8/month (1 task)
- Scales up to ~$24/month at max capacity (3 tasks for dev)

**Building and pushing your backend image:** See [../backend/DEPLOYMENT_GUIDE.md](../backend/DEPLOYMENT_GUIDE.md) for complete instructions on creating an ECR repository, building your Docker image, and pushing it to ECR.

### Step 4: Get Your Backend URL

```powershell
# Get the ALB DNS name
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' `
  --output text
```

Example output: `http://tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com`

### Step 5: Test Your Backend

```powershell
$BackendUrl = "http://tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com"

# Test health endpoint
Invoke-WebRequest -Uri "$BackendUrl/health"

# Test listings endpoint
Invoke-WebRequest -Uri "$BackendUrl/listings?category=vintage"
```

### Step 6: Configure Frontend

Update your frontend `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://tcg-marketplace-dev-alb-123456789.ap-southeast-1.elb.amazonaws.com
```

## Deployment Order

**Important:** Deploy in this order due to dependencies:

1. `storage.yml` - Creates IAM roles needed by compute
2. `base.yml` - Creates VPC/subnets needed by compute
3. `compute.yml` - Uses outputs from storage and base

**Detailed template review:** See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for comprehensive analysis of all templates including:
- Resource-by-resource breakdown and status (✅ ready or ⚠️ needs update)
- Deployment order with dependency validation
- Security review across all layers
- Cost breakdown and optimization strategies
- Known issues (monitoring.yml contains API Gateway references to be removed)

## Updating Your Application

### Update Backend Code (Manual Method)

For the complete workflow with all commands and troubleshooting, see [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md).

**Quick update:**

```powershell
# 1. Build new Docker image
cd tcg-marketplace/backend
docker build -t tcg-marketplace-backend .

# 2. Push to ECR
docker tag tcg-marketplace-backend:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest

# 3. Force new deployment
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --force-new-deployment `
  --region ap-southeast-1
```

ECS will automatically:
- Pull the new image
- Start a new task
- Wait for health checks
- Stop the old task (zero-downtime deployment)

## Monitoring

### Auto-scaling Metrics

Check current task count and scaling activity:
```powershell
# View current task count
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --query 'services[0].[desiredCount,runningCount]' `
  --output table `
  --region ap-southeast-1

# View scaling activities
aws application-autoscaling describe-scaling-activities `
  --service-namespace ecs `
  --resource-id service/tcg-marketplace-dev-cluster/tcg-marketplace-dev-backend `
  --region ap-southeast-1

# View current scaling policies
aws application-autoscaling describe-scaling-policies `
  --service-namespace ecs `
  --resource-id service/tcg-marketplace-dev-cluster/tcg-marketplace-dev-backend `
  --region ap-southeast-1
```

**Auto-scaling triggers:**
- CPU utilization > 70% (scales out in 1 minute, scales in after 5 minutes)
- Memory utilization > 80% (scales out in 1 minute, scales in after 5 minutes)
- Request count > 1000 requests/target/minute (scales out in 1 minute, scales in after 5 minutes)

**Capacity limits:**
- Development: 1-3 tasks
- Production: 1-10 tasks

### View Logs

```powershell
# Get recent logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1
```

### Check ECS Service Status

```powershell
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --region ap-southeast-1
```

### Check Task Status

```powershell
aws ecs list-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --service-name tcg-marketplace-dev-backend `
  --region ap-southeast-1
```

## Cost Management

### Daily Costs (Approximate)

- **Storage**: $0.10/day (S3 + DynamoDB with minimal usage)
- **Compute**: $0.50-1.50/day (1-3 Fargate tasks with auto-scaling)
- **Load Balancer**: $0.53/day (ALB)
- **Total**: ~$1.13-2.13/day or ~$34-64/month (depending on traffic)

**Auto-scaling behavior:**
- Minimum: 1 task (always running)
- Maximum: 3 tasks for dev, 10 tasks for prod
- Scales up when: CPU > 70%, Memory > 80%, or > 1000 requests/target/minute
- Scales down after 5 minutes of low utilization

### Stop Infrastructure (Save Costs)

```powershell
# Scale ECS service to 0 tasks (disables auto-scaling)
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 0 `
  --region ap-southeast-1
```

**Savings:** ~$0.50-1.50/day (Fargate costs, depending on current scale)
**Note:** ALB still costs $0.53/day even when idle. Auto-scaling will be disabled until you manually restart.

### Start Infrastructure

```powershell
# Scale ECS service back to 1 task (re-enables auto-scaling)
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 1 `
  --region ap-southeast-1
```

**Note:** Auto-scaling will automatically manage task count based on CPU, memory, and request metrics.

## Cleanup (Delete Everything)

```powershell
# Delete in reverse order
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-base --region ap-southeast-1

# Empty S3 bucket first
aws s3 rm s3://tcg-marketplace-dev-storage-<account-id> --recursive

# Then delete storage stack
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-storage --region ap-southeast-1
```

## Troubleshooting

### ECS Task Fails to Start

```powershell
# Check task logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1

# Check task stopped reason
aws ecs describe-tasks `
  --cluster tcg-marketplace-dev-cluster `
  --tasks <task-id> `
  --region ap-southeast-1
```

Common issues:
- Image not found in ECR
- Environment variables missing
- Health check failing (check /health endpoint)

### ALB Health Checks Failing

```powershell
# Check target health
aws elbv2 describe-target-health `
  --target-group-arn <target-group-arn> `
  --region ap-southeast-1
```

Common issues:
- Backend not responding on port 3000
- /health endpoint not implemented
- Security group blocking traffic

### Can't Access Backend URL

1. Check ECS service is running:
   ```powershell
   aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1
   ```

2. Check ALB is active:
   ```powershell
   aws elbv2 describe-load-balancers --region ap-southeast-1
   ```

3. Check security groups allow traffic on port 80

### Auto-scaling Not Working

```powershell
# Check if auto-scaling is configured
aws application-autoscaling describe-scalable-targets `
  --service-namespace ecs `
  --resource-ids service/tcg-marketplace-dev-cluster/tcg-marketplace-dev-backend `
  --region ap-southeast-1

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics `
  --namespace AWS/ECS `
  --metric-name CPUUtilization `
  --dimensions Name=ServiceName,Value=tcg-marketplace-dev-backend Name=ClusterName,Value=tcg-marketplace-dev-cluster `
  --start-time 2024-01-01T00:00:00Z `
  --end-time 2024-01-01T23:59:59Z `
  --period 300 `
  --statistics Average `
  --region ap-southeast-1
```

Common issues:
- Desired count manually set to 0 (disables auto-scaling)
- Insufficient IAM permissions for auto-scaling role
- Metrics not reaching thresholds (check CloudWatch)
- Cooldown periods preventing scale actions

## Optional: Add Monitoring (CloudWatch Dashboards and Alarms)

Deploy the monitoring stack to enable comprehensive CloudWatch monitoring and alerting:

```powershell
aws cloudformation deploy `
  --template-file monitoring.yml `
  --stack-name tcg-marketplace-dev-monitoring `
  --parameter-overrides `
    Environment=dev `
    ProjectName=tcg-marketplace `
    AlertEmail=your-email@example.com `
  --region ap-southeast-1
```

**What this creates:**
- CloudWatch Dashboard with ECS, ALB, DynamoDB, and S3 metrics
- CloudWatch Alarms for service health, high CPU/memory, error rates, and latency
- SNS Topic for email alerts
- Cost anomaly detection for infrastructure services
- Metric filters for application logs (errors and warnings)

**Access the dashboard:**
```powershell
# Get dashboard URL
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-monitoring `
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' `
  --output text
```

**Monitored metrics:**
- ECS: CPU utilization, memory utilization, running task count
- ALB: Request count, response time, 4XX/5XX errors
- DynamoDB: Read/write capacity, throttled requests
- S3: Bucket size, object count
- Application: Error and warning log counts

**Alarm thresholds:**
- ECS unhealthy: < 1 running task
- ECS high CPU: > 80% for 15 minutes
- ECS high memory: > 85% for 15 minutes
- ALB high errors: > 10 5XX errors in 10 minutes
- ALB high latency: > 5 seconds for 15 minutes
- DynamoDB throttling: Any throttled requests
- Application errors: > 5 errors in 10 minutes

## Optional: Add Authentication (Cognito)

Deploy the authentication stack to enable user registration, login, and role-based access control:

```powershell
aws cloudformation deploy `
  --template-file auth.yml `
  --stack-name tcg-marketplace-dev-auth `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1
```

**What this creates:**
- Cognito User Pool for user management
- User Pool Client for frontend authentication
- Identity Pool for AWS resource access
- Three user groups: Admins (precedence 0), Sellers (precedence 1), Viewers (precedence 2)
- IAM roles for authenticated and unauthenticated users

**Get authentication details:**
```powershell
# Get User Pool ID
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-auth `
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' `
  --output text

# Get User Pool Client ID
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-auth `
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' `
  --output text

# Get User Pool Domain
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-auth `
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolDomain`].OutputValue' `
  --output text
```

**Configure frontend** with these values in `.env.local`:
```bash
NEXT_PUBLIC_USER_POOL_ID=<user-pool-id>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<client-id>
NEXT_PUBLIC_USER_POOL_DOMAIN=<domain-url>
```

**User Groups:**
- **Admins**: Full system access, content moderation
- **Sellers**: Can create and manage listings
- **Viewers**: Read-only access to browse listings

Users can be assigned to groups via AWS Console or CLI:
```powershell
aws cognito-idp admin-add-user-to-group `
  --user-pool-id <user-pool-id> `
  --username <username> `
  --group-name Sellers `
  --region ap-southeast-1
```

## Next Steps

1. **Add HTTPS**: Configure ACM certificate and HTTPS listener on ALB
2. **Add Custom Domain**: Route53 + ACM for custom domain
3. **Add Monitoring**: Deploy monitoring.yml for CloudWatch dashboards and alarms
4. **Monitor Auto-scaling**: Watch CloudWatch metrics to tune scaling thresholds
5. **Production Setup**: Review auto-scaling limits (max 10 tasks for prod)
6. **Implement Authorization**: Use Cognito groups in backend for role-based access control

## Related Documentation

- **[MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md)** - Complete manual command reference (START HERE)
- **[DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md)** - Visual deployment flow and architecture diagrams
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - One-page command cheat sheet
- **[INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md)** - Comprehensive template review
- **[../backend/DEPLOYMENT_GUIDE.md](../backend/DEPLOYMENT_GUIDE.md)** - Backend Docker build guide

## Comparison: Old vs New Architecture

### Old (Complex)
- VPC with private subnets
- NAT Gateway: $32/month
- VPC Link: $36/month
- Network Load Balancer: $16/month
- API Gateway: $3.50/million requests
- **Total**: ~$90-120/month

### New (Simple)
- VPC with public subnets only
- Application Load Balancer: $16/month
- ECS Fargate: $8-24/month (1-3 tasks with auto-scaling)
- S3 + DynamoDB: $1-5/month
- **Total**: ~$25-45/month (scales with traffic)

**Savings: ~$45-75/month (50-65% reduction)**
