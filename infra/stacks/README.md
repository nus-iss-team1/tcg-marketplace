# TCG Marketplace - Infrastructure Stacks

CloudFormation stacks for deploying the TCG Marketplace application to AWS.

## Stack Overview

The infrastructure is divided into numbered stacks that must be deployed in order:

| Stack | File | Description | Dependencies |
|-------|------|-------------|--------------|
| 02 | `02-security-and-registry.yaml` | GitHub OIDC, ECR repositories | None |
| 03 | `03-networking.yaml` | VPC, subnets, internet gateway | None |
| 04 | `04-cluster.yaml` | ECS cluster, ALB, security groups | Stack 03 |
| 05 | `05-storage.yaml` | S3 bucket, DynamoDB tables | None |
| 07 | `07-auth.yaml` | Cognito user pool (required for Stack 08) | None |
|    |                | **Exports**: `UserPoolId`, `UserPoolArn`, `UserPoolClientId`, `UserPoolDomainUrl` | |
| 08 | `08-compute-fullstack.yaml` | Full stack services (backend + frontend together) | Stacks 03, 04, 05, 07 |

**Note**: 
- Stack 06 (`06-services.yaml`) is deprecated and not used. Use Stack 08 for full-stack deployment.
- CloudFormation exports use PascalCase naming convention (e.g., `UserPoolId`) to match AWS CloudFormation standard output naming.

## Quick Start

### Prerequisites

- AWS CLI configured with credentials
- Docker installed
- PowerShell (for deployment script)

### Deploy Everything

```bash
cd tcg-marketplace/infra/stacks

# Deploy all stacks and build/push Docker images
./deploy-stacks.ps1 -GitHubOrg "your-org" -GitHubRepo "your-repo"

# Or deploy infrastructure only (no Docker build)
./deploy-stacks.ps1 -StacksOnly

# Note: The script deploys stacks 02, 03, 04, 05, 07, and 08 in order
# Stack 06 is skipped (deprecated)
```

### Manual Deployment

```bash
# 1. Deploy security and ECR
aws cloudformation deploy \
  --template-file 02-security-and-registry.yaml \
  --stack-name tcg-marketplace-security \
  --parameter-overrides GitHubOrg=your-org GitHubRepo=your-repo ProjectNamespace=tcg-marketplace \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1

# 2. Deploy networking
aws cloudformation deploy \
  --template-file 03-networking.yaml \
  --stack-name tcg-marketplace-networking \
  --parameter-overrides ProjectNamespace=tcg-marketplace \
  --region ap-southeast-1

# 3. Deploy cluster
aws cloudformation deploy \
  --template-file 04-cluster.yaml \
  --stack-name tcg-marketplace-cluster \
  --parameter-overrides ProjectNamespace=tcg-marketplace \
  --region ap-southeast-1

# 4. Deploy storage
aws cloudformation deploy \
  --template-file 05-storage.yaml \
  --stack-name tcg-marketplace-storage \
  --parameter-overrides ProjectNamespace=tcg-marketplace \
  --region ap-southeast-1

# 5. Deploy authentication (required for Stack 08)
aws cloudformation deploy \
  --template-file 07-auth.yaml \
  --stack-name tcg-marketplace-auth \
  --parameter-overrides ProjectNamespace=tcg-marketplace Environment=dev SuperAdminUsername=admin SuperAdminPassword=YourSecurePassword123 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1

# 6. Build and push Docker images
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

cd ../../backend
docker build -t tcg-marketplace/tcgm-app:latest .
docker tag tcg-marketplace/tcgm-app:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace/tcgm-app:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace/tcgm-app:latest

cd ../frontend
docker build -t tcg-marketplace/tcgm-web:latest .
docker tag tcg-marketplace/tcgm-web:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace/tcgm-web:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace/tcgm-web:latest

# 7. Deploy full stack services (requires Stack 07 to be deployed first)
cd ../infra/stacks
aws cloudformation deploy \
  --template-file 08-compute-fullstack.yaml \
  --stack-name tcg-marketplace-compute-fullstack \
  --parameter-overrides ProjectNamespace=tcg-marketplace AppImageTag=latest WebImageTag=latest \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1
```

**Important**: Stack 08 requires Stack 07 (Authentication) to be successfully deployed first, as it imports Cognito User Pool IDs.

## Architecture

### Networking (Stack 03)
- VPC with CIDR 10.0.0.0/16
- 2 public subnets across availability zones
- Internet gateway for public access
- No NAT gateway (cost optimization)

### Compute (Stack 04)
- ECS Fargate cluster
- Application Load Balancer (ALB)
- Path-based routing: `/api/*` → backend, `/` → frontend
- Security groups for ALB and ECS tasks

### Storage (Stack 05)
- **S3 Bucket**: Media storage with lifecycle policies
  - Temp uploads deleted after 1 day
  - Images moved to IA storage after 30 days
- **DynamoDB Tables**:
  - `GameCardLookup`: Card catalog with game/card name indexes
  - `MessagingPlatform`: User messaging with room/sender/receiver indexes
  - `TCGMarketplace`: Listings with seller/game/price/condition indexes

### Authentication (Stack 07)
- **Cognito User Pool**: User authentication and authorization
- **User Groups**: Admin and user roles with different access levels
- **Super Admin**: Automatically created admin user on stack deployment
- **Hosted UI Domain**: Cognito hosted authentication UI available at `https://{ProjectNamespace}-{Environment}.auth.{Region}.amazoncognito.com`
- **Password Policy**: Minimum 8 characters, requires uppercase, lowercase, and numbers

### Services (Stack 06 or 08)
- Backend: NestJS API on port 3000
- Frontend: Next.js web app on port 3000
- Auto-configured environment variables
- CloudWatch logs with 14-day retention
- Cognito authentication integration (requires Stack 07)

## Environment Variables

**Important**: Stack 08 (Full Stack Services) requires Stack 07 (Authentication) to be deployed first, as it imports Cognito User Pool IDs. Stack 07 must be successfully deployed before deploying Stack 08.

Backend containers automatically receive:
- `GAME_CARD_LOOKUP_TABLE`: DynamoDB table name
- `MESSAGING_PLATFORM_TABLE`: DynamoDB table name
- `TCG_MARKETPLACE_TABLE`: DynamoDB table name
- `MEDIA_BUCKET_NAME`: S3 bucket name
- `AWS_REGION`: AWS region
- `NODE_ENV`: production
- `PORT`: 3000
- `TZ`: Asia/Singapore
- `LOG_DIR`: /tmp/logs

Frontend containers automatically receive:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_USER_POOL_ID`: Cognito User Pool ID (exported as `${ProjectNamespace}-${Environment}-UserPoolId` from Stack 07)
- `NEXT_PUBLIC_CLIENT_ID`: Cognito User Pool Client ID (exported as `${ProjectNamespace}-${Environment}-UserPoolClientId` from Stack 07)
- `NEXT_PUBLIC_AWS_REGION`: AWS region
- `NODE_ENV`: production
- `PORT`: 3000

## Cost Management

### Stop Services (Save ~$12/day)
```bash
aws ecs update-service --cluster tcg-marketplace-cluster --service tcg-marketplace-app-fullstack --desired-count 0 --region ap-southeast-1
aws ecs update-service --cluster tcg-marketplace-cluster --service tcg-marketplace-web-fullstack --desired-count 0 --region ap-southeast-1
```

### Start Services
```bash
aws ecs update-service --cluster tcg-marketplace-cluster --service tcg-marketplace-app-fullstack --desired-count 1 --region ap-southeast-1
aws ecs update-service --cluster tcg-marketplace-cluster --service tcg-marketplace-web-fullstack --desired-count 1 --region ap-southeast-1
```

### Monthly Cost Estimate
- ECS Fargate (2 tasks, 0.25 vCPU, 0.5 GB): ~$12/month
- ALB: ~$16/month
- DynamoDB (on-demand): ~$1-5/month
- S3: ~$1-3/month
- CloudWatch Logs: ~$1/month
- Cognito (up to 50,000 MAUs free): ~$0/month
- **Total**: ~$31-37/month (running 24/7)

## Outputs

After deployment, get your application URL:

```bash
aws cloudformation describe-stacks \
  --stack-name tcg-marketplace-compute-fullstack \
  --query 'Stacks[0].Outputs' \
  --region ap-southeast-1
```

To get Cognito authentication details:

```bash
aws cloudformation describe-stacks \
  --stack-name tcg-marketplace-auth \
  --query 'Stacks[0].Outputs' \
  --region ap-southeast-1
```

The authentication stack exports the following outputs:
- `UserPoolId`: Cognito User Pool identifier
- `UserPoolArn`: ARN of the User Pool
- `UserPoolClientId`: Client ID for application integration
- `UserPoolDomainUrl`: Hosted UI domain URL for authentication flows

## Troubleshooting

### Check ECS Service Status
```bash
aws ecs describe-services \
  --cluster tcg-marketplace-cluster \
  --services tcg-marketplace-app-fullstack tcg-marketplace-web-fullstack \
  --region ap-southeast-1
```

### View Logs
```bash
# Backend logs
aws logs tail /ecs/tcg-marketplace/app-fullstack --follow --region ap-southeast-1

# Frontend logs
aws logs tail /ecs/tcg-marketplace/web-fullstack --follow --region ap-southeast-1
```

### Check ALB Health
```bash
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region ap-southeast-1
```

## Cleanup

Delete stacks in reverse order:

```bash
# Delete compute stack first
aws cloudformation delete-stack --stack-name tcg-marketplace-compute-fullstack --region ap-southeast-1

# Wait for compute stack to delete, then delete auth
aws cloudformation delete-stack --stack-name tcg-marketplace-auth --region ap-southeast-1

# Delete remaining infrastructure
aws cloudformation delete-stack --stack-name tcg-marketplace-storage --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-cluster --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-networking --region ap-southeast-1
aws cloudformation delete-stack --stack-name tcg-marketplace-security --region ap-southeast-1
```

**Important:** 
- Empty the S3 bucket before deleting the storage stack
- Delete ECR repositories manually or empty them before deleting the security stack
- Cognito domains may take up to 60 minutes to fully release after user pool deletion
