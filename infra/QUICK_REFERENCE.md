# Quick Reference Card

## Documentation

- **[MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md)** - Complete manual command reference (START HERE)
- **[DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)** - Step-by-step workflow
- **[DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md)** - Visual diagrams
- **[README.md](./README.md)** - Infrastructure overview

## One-Command Deploy

```powershell
# Manual deployment recommended - see MANUAL_DEPLOYMENT_GUIDE.md
cd tcg-marketplace/infra
./deploy.ps1 -Environment dev -Template compute -ImageUri "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest"
```

## Common Commands

### Deploy & Update
```powershell
# Build and push Docker image
cd tcg-marketplace/backend
docker build -t tcg-marketplace-backend:latest .
$ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $ECR_URI
docker tag tcg-marketplace-backend:latest ${ECR_URI}:latest
docker push ${ECR_URI}:latest

# Deploy compute stack
cd ../infra
./deploy.ps1 -Environment dev -Template compute -ImageUri "${ECR_URI}:latest"

# Force redeploy (without rebuilding)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --force-new-deployment --region ap-southeast-1
```

### Monitor
```powershell
# View logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1

# Service status
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1
```

### Scale
```powershell
# Stop (save costs)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1

# Start
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
```

### Test
```powershell
# Get backend URL
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-compute --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' --output text --region ap-southeast-1

# Current backend URL
$BACKEND_URL = "http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com"

# Test health
Invoke-WebRequest -Uri "$BACKEND_URL/health" -UseBasicParsing

# Test listings
Invoke-WebRequest -Uri "$BACKEND_URL/listings?category=vintage" -UseBasicParsing
```

## Access Methods

### Public Access (Recommended)
Use ALB DNS name: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`

**Use for**: External access, frontend-backend communication, general API access

### Internal Access (Within VPC)
Use private IP: `http://10.0.1.87:3000` (current task - changes on redeploy)

**Use for**: 
- Internal microservice communication
- Access from other ECS tasks, EC2 instances, or Lambda functions within the VPC
- Cost optimization (bypasses ALB charges)

**Important**: Private IP changes when tasks restart. For stable internal access, use AWS Service Discovery or the ALB DNS name.

**Get current private IP**:
```powershell
$TASK_ARN = aws ecs list-tasks --cluster tcg-marketplace-dev-cluster --service-name tcg-marketplace-dev-backend --region ap-southeast-1 --query 'taskArns[0]' --output text
aws ecs describe-tasks --cluster tcg-marketplace-dev-cluster --tasks $TASK_ARN --region ap-southeast-1 --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' --output text
```

**Testing internal access** (requires VPC access):
```bash
# From within VPC (another ECS task, EC2 instance, etc.)
curl http://10.0.1.87:3000/health
```

## Costs

- **Running**: ~$1.13-2.13/day ($34-64/month)
- **Stopped tasks**: ~$0.53/day ($16/month - ALB only)

## Troubleshooting

```powershell
# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name tcg-marketplace-dev-compute --region ap-southeast-1 --max-items 20

# Check task health
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1 --query 'services[0].[runningCount,desiredCount,deployments[0].rolloutState]'

# Check task failures
$TASK_ARN = aws ecs list-tasks --cluster tcg-marketplace-dev-cluster --service-name tcg-marketplace-dev-backend --region ap-southeast-1 --query 'taskArns[0]' --output text
aws ecs describe-tasks --cluster tcg-marketplace-dev-cluster --tasks $TASK_ARN --region ap-southeast-1

# Force redeploy
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --force-new-deployment --region ap-southeast-1
```

### Common Issues

**Health checks failing**: Ensure Dockerfile includes `RUN apk add --no-cache curl` for Alpine-based images.

**Stack stuck in ROLLBACK_COMPLETE**: Delete stack and redeploy:
```powershell
aws cloudformation delete-stack --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name tcg-marketplace-dev-compute --region ap-southeast-1
# Then redeploy
```
