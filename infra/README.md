# TCG Marketplace Infrastructure

This directory contains CloudFormation templates and deployment scripts for the TCG Marketplace AWS infrastructure.

## Architecture Overview

The infrastructure follows a serverless-first approach optimized for cost and supporting up to 100 users:

- **VPC**: Multi-AZ setup with public/private subnets and VPC endpoints for cost optimization
- **ECS Fargate**: Containerized NestJS backend (0.25-0.5 vCPU, 512MB-1GB RAM)
- **API Gateway**: REST API with Cognito authentication and rate limiting
- **DynamoDB**: On-demand billing for metadata storage
- **S3**: File storage with lifecycle policies and presigned URLs
- **Cognito**: User authentication and authorization
- **CloudWatch**: Monitoring, logging, and alerting

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials for ap-southeast-1 region
3. **PowerShell** (Windows) or **Bash** (Linux/Mac)

## Quick Start

### 1. Validate Setup
```powershell
# Windows
.\validate.ps1

# Linux/Mac
./validate.sh
```

### 2. Deploy Infrastructure
```powershell
# Deploy all stacks for development
.\deploy.ps1 -Environment dev -Template all

# Deploy specific stack
.\deploy.ps1 -Environment dev -Template base
```

### 3. Verify Deployment
Check the AWS Console for:
- CloudFormation stacks are CREATE_COMPLETE
- ECS cluster is running
- API Gateway endpoints are accessible

## Deployment Order

The infrastructure must be deployed in this order due to dependencies:

1. **base.yml** - VPC, networking, security groups
2. **storage.yml** - S3 bucket, DynamoDB table, IAM roles
3. **auth.yml** - Cognito User Pool and Identity Pool
4. **compute.yml** - ECS cluster, task definition, service
5. **api.yml** - API Gateway, VPC Link, Network Load Balancer
6. **monitoring.yml** - CloudWatch dashboards and alarms

## Cost Optimization Features

- **Single NAT Gateway** for dev/staging (dual for production)
- **VPC Endpoints** to avoid NAT Gateway charges for AWS services
- **Fargate Spot** for non-production workloads
- **On-demand DynamoDB** billing for low traffic
- **S3 Lifecycle policies** for automatic cost optimization
- **Minimal resource sizing** for 100-user capacity

## Environment Configuration

### Development (dev)
- 1 ECS task, 0.25 vCPU, 512MB RAM
- Single AZ deployment where possible
- Fargate Spot for cost savings
- Minimal monitoring retention

### Production (prod)
- 2+ ECS tasks, 0.5 vCPU, 1GB RAM
- Multi-AZ deployment for high availability
- Enhanced monitoring and alerting
- Longer log retention

### Environment Variables

The following environment variables are automatically configured through CloudFormation outputs:

- `BUCKET_NAME` - S3 bucket for file storage
- `TABLE_NAME` - DynamoDB table name
- `USER_POOL_ID` - Cognito User Pool ID
- `USER_POOL_CLIENT_ID` - Cognito App Client ID
- `USER_POOL_GROUPS` - Available user groups (Sellers, Viewers, Admins)
- `AWS_REGION` - AWS region (ap-southeast-1)
- `NODE_ENV` - Environment name (dev/prod)

## User Roles and Authentication

The system supports three distinct user roles managed through Cognito User Groups:

- **Sellers**: Users who can create and manage trading card listings
- **Viewers**: Users who can browse and view listings (read-only access)  
- **Admins**: Users with administrative privileges for content moderation

User group membership is included in JWT tokens and used for role-based authorization at the API Gateway level.

## API Endpoints

The deployed API Gateway exposes these endpoints with role-based access control:

- `GET /health` - Health check (public)
- `POST /media/presign` - Generate S3 presigned URLs (Sellers, Admins)
- `GET /listings` - Retrieve trading card listings (all authenticated users)
- `POST /listings` - Create new listings (Sellers, Admins)

## Monitoring

Access the CloudWatch dashboard at:
```
https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=tcg-marketplace-{environment}-overview
```

## Troubleshooting

### Common Issues

1. **Stack deployment fails**
   - Check CloudFormation events in AWS Console
   - Verify parameter files exist and are valid JSON
   - Ensure AWS CLI has sufficient permissions

2. **ECS tasks not starting**
   - Check ECS service events
   - Verify Docker image exists and is accessible
   - Check security group rules allow traffic

3. **API Gateway returns 502/503**
   - Verify VPC Link is active
   - Check Network Load Balancer health checks
   - Ensure ECS tasks are healthy

### Useful Commands

```powershell
# Check stack status
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-base --region ap-southeast-1

# View ECS service status
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1

# Check API Gateway
aws apigateway get-rest-apis --region ap-southeast-1
```

## Next Steps

After infrastructure deployment:

1. **Build and push Docker image** for the NestJS backend
2. **Update ECS task definition** with the real image URI
3. **Configure frontend** with API Gateway URL and Cognito settings
4. **Set up CI/CD pipeline** for automated deployments (Phase 2)

## Security Notes

- All resources use least-privilege IAM policies
- ECS tasks run in private subnets with no direct internet access
- S3 bucket blocks public access, uses presigned URLs only
- API Gateway enforces rate limiting and request validation
- Cognito handles all authentication with JWT tokens