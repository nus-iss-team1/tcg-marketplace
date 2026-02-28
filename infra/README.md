# TCG Marketplace Infrastructure

This directory contains CloudFormation templates and deployment scripts for the TCG Marketplace AWS infrastructure.

## Architecture Overview

The infrastructure uses a simplified, cost-effective approach optimized for up to 100 users:

**Simplified Architecture (Recommended):**
- **VPC**: Public subnets only (no NAT Gateway)
- **ECS Fargate**: Containerized NestJS backend with public IP (0.25 vCPU, 512MB RAM)
- **Application Load Balancer**: HTTPS termination and routing
- **DynamoDB**: On-demand billing for listings data
- **S3**: File storage with lifecycle policies and presigned URLs
- **CloudWatch**: Monitoring and logging
- **Cost**: ~$25-35/month

**Full Architecture (Advanced):**
- Adds private subnets, NAT Gateway, API Gateway, VPC Link
- Enhanced security isolation
- **Cost**: ~$90-120/month
- See templates: base.yml, api.yml, compute.yml

**Comprehensive Review:** See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for a complete review of all templates including:
- Detailed analysis of each YAML template (base.yml, storage.yml, compute.yml, auth.yml, monitoring.yml)
- Deployment order with dependency mapping
- Import/export validation across stacks
- Security review (network, IAM, data, application)
- Cost breakdown and optimization strategies
- Documentation status verification
- Action items and verification checklist

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials for ap-southeast-1 region
3. **PowerShell** (Windows) or **Bash** (Linux/Mac)

## Quick Start

### Manual Deployment (Recommended)

The complete deployment workflow with all commands:

```powershell
cd tcg-marketplace/infra
```

**See [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md) for complete step-by-step instructions.**

This includes:
- Docker image build and push to ECR
- CloudFormation stack deployment
- Health check verification
- Troubleshooting common issues (especially health check failures)

**Quick deploy compute stack:**
```powershell
.\deploy.ps1 -Environment dev -Template compute -ImageUri "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend:latest"
```

**Getting Started:** 
- [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md) - Complete manual command reference (START HERE)
- [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) - Step-by-step deployment guide
- [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md) - Architecture and deployment flow visualization
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command cheat sheet

**What you get:**
- S3 bucket for images
- DynamoDB table for listings
- ECS Fargate with Application Load Balancer
- Public backend URL: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`
- **Cost**: ~$25-35/month

**Current Deployment:**
- AWS Account: 274603886128
- Region: ap-southeast-1
- Backend URL: http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com
- Private IP: 10.0.1.87 (current task - changes on redeploy)

## Access Patterns

The deployed backend can be accessed in two ways:

### Public Access (Recommended)
Use the Application Load Balancer DNS name for external access:
- **URL**: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com`
- **Use for**: Frontend-backend communication, external API access, general usage
- **Benefits**: Works from anywhere, automatic load balancing, health check routing

### Internal VPC Access
Use the private IP for internal microservice communication:
- **URL**: `http://10.0.1.87:3000` (current task)
- **Use for**: Internal microservice communication, access from other ECS tasks/EC2/Lambda within VPC
- **Benefits**: Lower latency, no ALB charges for internal traffic
- **Important**: Private IP changes when tasks restart. For stable internal access, use AWS Service Discovery or the ALB DNS name.

**Get current private IP**:
```powershell
$TASK_ARN = aws ecs list-tasks --cluster tcg-marketplace-dev-cluster --service-name tcg-marketplace-dev-backend --region ap-southeast-1 --query 'taskArns[0]' --output text
aws ecs describe-tasks --cluster tcg-marketplace-dev-cluster --tasks $TASK_ARN --region ap-southeast-1 --query 'tasks[0].attachments[0].details[?name==`privateIPv4Address`].value' --output text
```

See [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md) for complete details on both access methods.

### Cost Management

**Simplified Architecture:**
- Scale ECS service to 0 tasks when not in use
- Saves ~$0.50/day (Fargate costs)
- ALB costs $0.53/day even when idle
- S3 and DynamoDB are pay-per-use

```powershell
# Stop ECS tasks (save ~$15/month)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1

# Start ECS tasks
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
```

**Full Architecture (Archived):**
- The complex architecture with NAT Gateway has been archived
- See [archive/README.md](./archive/README.md) for cost management scripts
- Archived scripts can save ~$1.58/day (~$47/month) on NAT Gateway costs

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

## CloudFormation Templates

### Current Infrastructure Templates (Simplified Architecture)

The project uses a simplified, cost-effective architecture optimized for development and small-scale production:

1. **storage.yml** - S3 bucket, DynamoDB table, IAM roles (no VPC dependencies)
2. **base.yml** - VPC with public subnets only, security groups (no NAT Gateway)
3. **compute.yml** - ECS Fargate with Application Load Balancer (no API Gateway)
4. **auth.yml** - Cognito User Pool and Identity Pool (optional)
5. **monitoring.yml** - CloudWatch dashboards and alarms (optional)

**Benefits:**
- 65-70% cost reduction (~$60-85/month savings)
- Simpler architecture and faster deployment
- Easier troubleshooting and maintenance
- Suitable for development and small-scale production

**Documentation:**
- **[DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)** - Complete deployment guide
- **[INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md)** - Comprehensive template review and validation

### Archived Full Architecture Templates

The original complex architecture with private subnets, NAT Gateway, API Gateway, and VPC Link has been archived to the **[archive/](./archive/)** directory. These templates are preserved for reference and can be restored if needed for:

- Private subnet isolation for compliance (PCI, HIPAA)
- API Gateway features (caching, throttling, API keys)
- Large-scale production (1000+ concurrent users)

See **[archive/README.md](./archive/README.md)** for details on the archived architecture and restoration instructions.

## Deployment Order

Deploy the infrastructure in this order due to dependencies:

1. **storage.yml** - S3 bucket, DynamoDB table, IAM roles
2. **base.yml** - VPC with public subnets, security groups
3. **compute.yml** - ECS Fargate with Application Load Balancer
4. **auth.yml** - Cognito User Pool (optional)
5. **monitoring.yml** - CloudWatch dashboards (optional)

**Complete guide:** [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)

**Template details:** [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md)

### Monitoring and Alerting

The optional `monitoring.yml` template provides comprehensive CloudWatch monitoring for the simplified architecture:

**Status:** ⚠️ Needs update - Currently contains API Gateway references that should be removed for simplified architecture. See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for details.

**CloudWatch Dashboard:**
- ECS service metrics (CPU, memory utilization)
- Application Load Balancer metrics (request count, response time, error rates)
- DynamoDB metrics (capacity units, throttling)
- S3 storage metrics (bucket size, object count)

**CloudWatch Alarms:**
- ECS service health (unhealthy tasks)
- ECS high CPU/memory utilization
- ALB high error rates (5XX errors)
- ALB high latency (response time)
- DynamoDB throttling
- Application error rates (from logs)

**Cost Monitoring:**
- Cost anomaly detection for ECS, ALB, DynamoDB, S3, and ECR
- Email alerts for cost anomalies > $100

Deploy monitoring:
```powershell
aws cloudformation deploy `
  --template-file monitoring.yml `
  --stack-name tcg-marketplace-dev-monitoring `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace AlertEmail=your-email@example.com `
  --region ap-southeast-1
```

**Note:** The monitoring template is functional but contains legacy API Gateway references. It will be updated in a future revision to fully align with the simplified architecture.

### Template Features

**storage.yml:**
- S3 bucket with lifecycle policies and CORS configuration
- DynamoDB table with GSI1 and GSI2 indexes
- IAM roles for ECS tasks (task role and execution role)
- DynamoDB Streams enabled
- No VPC dependencies
- Exports: BucketName, BucketArn, TableName, TableArn, ECSTaskRoleArn, ECSTaskExecutionRoleArn

**base.yml:**
- VPC with public subnets only (no NAT Gateway)
- Two availability zones for high availability
- Security groups for ECS and ALB
- Internet Gateway for direct internet access
- Saves ~$32/month vs private subnets with NAT Gateway

**compute.yml:**
- ECS Fargate cluster
- Application Load Balancer (public)
- ECS service with public IP
- Auto-scaling configuration (CPU, memory, and request-based)
- CloudWatch Logs integration

**Detailed review:** See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for comprehensive template analysis including:
- Resource-by-resource breakdown of each template
- Export/import dependency validation
- Security model review (network, IAM, data, application layers)
- Cost optimization features and monthly cost estimates
- Auto-scaling configuration analysis
- Known issues and recommended updates (monitoring.yml needs API Gateway references removed)

**Outputs:**
- Storage: `BucketName`, `BucketArn`, `TableName`, `TableArn`, `ECSTaskRoleArn`, `ECSTaskExecutionRoleArn`
- Base: `VPCId`, `PublicSubnet1Id`, `PublicSubnet2Id`, `ECSSecurityGroupId`, `ALBSecurityGroupId`
- Compute: `LoadBalancerURL`, `ECSClusterName`, `ECSServiceName`, `TargetGroupArn`

## Cost Optimization

The simplified architecture provides significant cost savings:

**Simplified Architecture (~$25-35/month):**
- Application Load Balancer: ~$16/month
- ECS Fargate (0.25 vCPU, 512MB): ~$8/month
- S3 + DynamoDB: ~$1-5/month (pay-per-use)
- No NAT Gateway, no API Gateway, no VPC Link

**Additional Savings:**
- Scale ECS to 0 tasks when not in use (saves ~$8/month)
- Use S3 lifecycle policies (automatic)
- DynamoDB on-demand billing (pay only for what you use)

**Full Architecture (~$90-120/month):**
- All simplified costs plus:
- NAT Gateway: ~$32/month
- API Gateway: ~$3.50/million requests
- VPC Link: ~$36/month
- Network Load Balancer: ~$16/month

### Cost Management Scripts

**For Simplified Architecture:**
The simplified architecture doesn't require daily start/stop scripts since there's no NAT Gateway. Simply scale ECS to 0 tasks when not in use:

```powershell
# Stop ECS tasks (save ~$8/month)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1

# Start ECS tasks
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
```

**For Archived Full Architecture:**
If using the archived full architecture with NAT Gateway, cost management scripts are available in the **[archive/scripts/](./archive/scripts/)** directory. See **[archive/README.md](./archive/README.md)** for details.

## Environment Configuration

### Development (dev)
- 1-3 ECS tasks (auto-scaling enabled), 0.25 vCPU, 512MB RAM
- Auto-scaling triggers: CPU > 70%, Memory > 80%, or 1000 requests/target/minute
- Public subnets (simplified architecture)
- Minimal monitoring retention
- **Cost**: ~$25-35/month (base), scales up to ~$50/month at max capacity

### Production (prod)
- 1-10 ECS tasks (auto-scaling enabled), 0.5 vCPU, 1GB RAM
- Auto-scaling triggers: CPU > 70%, Memory > 80%, or 1000 requests/target/minute
- Multi-AZ deployment for high availability
- Enhanced monitoring and alerting
- Longer log retention
- Consider full architecture for enhanced security
- **Cost**: ~$50-70/month (simplified) or ~$120-150/month (full)

### Environment Variables

The following environment variables are automatically configured through CloudFormation outputs:

- `BUCKET_NAME` - S3 bucket for file storage
- `TABLE_NAME` - DynamoDB table name
- `USER_POOL_ID` - Cognito User Pool ID (when auth.yml is deployed)
- `USER_POOL_CLIENT_ID` - Cognito App Client ID (when auth.yml is deployed)
- `USER_POOL_GROUPS` - Available user groups: Sellers, Viewers, Admins (when auth.yml is deployed)
- `AWS_REGION` - AWS region (ap-southeast-1)
- `NODE_ENV` - Environment name (dev/prod)

## User Roles and Authentication

The system supports three distinct user roles managed through Cognito User Groups:

- **Admins** (Precedence: 0): Users with administrative privileges for content moderation and system management
- **Sellers** (Precedence: 1): Users who can create and manage trading card listings
- **Viewers** (Precedence: 2): Users who can browse and view listings (read-only access)

User group membership is included in JWT tokens and can be used for role-based authorization at the application level. Groups are automatically created when deploying the `auth.yml` CloudFormation template.

**Group Precedence**: Lower numbers have higher priority. When a user belongs to multiple groups, the group with the lowest precedence value takes effect.

## API Endpoints

The deployed Application Load Balancer exposes these endpoints:

**Simplified Architecture (No Authentication):**
- `GET /health` - Health check
- `POST /media/presign` - Generate S3 presigned URLs
- `GET /listings` - Retrieve trading card listings
- `POST /listings` - Create new listings

**With Cognito (Optional):**
- Add authentication to protect endpoints
- Deploy auth.yml stack
- Configure API Gateway for role-based access
- See full architecture documentation

## Monitoring

### Simplified Architecture

View ECS logs:
```powershell
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1
```

Check service health:
```powershell
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1
```

### Full Architecture

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

# Check ECS task logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1
```

For archived full architecture cost management, see [archive/README.md](./archive/README.md).

## Deployment Options

### Manual Deployment (Recommended)

For complete control and understanding of the deployment process:

**See [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md) for complete instructions.**

Key steps:
1. Build Docker image with health check support (includes curl)
2. Push to ECR
3. Deploy CloudFormation stacks in order
4. Verify health checks pass
5. Test endpoints

**Important**: Ensure Dockerfile includes `RUN apk add --no-cache curl` for health checks to work properly.

**Documentation:** 
- [MANUAL_DEPLOYMENT_GUIDE.md](./MANUAL_DEPLOYMENT_GUIDE.md) - Complete manual command reference (START HERE)
- [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) - Step-by-step deployment workflow
- [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md) - Visual deployment flow and architecture diagrams
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command cheat sheet

## Next Steps

After infrastructure deployment:

1. **Test your endpoints** using the provided curl commands
2. **Test locally** using the [backend/test/LOCAL_TESTING.md](../backend/test/LOCAL_TESTING.md) guide
3. **Configure frontend** with ALB URL and Cognito settings (if using auth)
4. **Set up monitoring** (optional: deploy `monitoring.yml`)
5. **Set up CI/CD pipeline** for automated deployments (Phase 2)

## Local Development Testing

Before deploying to AWS, you can test the backend locally against deployed AWS resources. The project provides comprehensive testing documentation:

- **[../DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)** - Complete setup guide for new developers (start here)
- **[../LOCAL_TESTING_GUIDE.md](../LOCAL_TESTING_GUIDE.md)** - Complete guide for testing locally before AWS deployment (recommended starting point)
- **[backend/LOCAL_TESTING.md](../backend/LOCAL_TESTING.md)** - Detailed backend testing guide with AWS resource setup
- **[backend/TESTING_CHECKLIST.md](../backend/TESTING_CHECKLIST.md)** - Quick reference checklist

These guides cover:
- Setting up local environment with AWS resources
- Testing S3 presigned URL generation and uploads
- Testing DynamoDB operations (create/read listings)
- Full integration workflow testing
- Frontend-backend integration testing
- Troubleshooting common issues

Quick start:
```bash
# 1. Deploy storage stack (simplified version for local testing)
cd tcg-marketplace/infra
aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-storage-simple `
  --template-body file://storage-simple.yml `
  --parameters ParameterKey=Environment,ParameterValue=dev ParameterKey=ProjectName,ParameterValue=tcg-marketplace `
  --region ap-southeast-1

# 2. Get CloudFormation outputs
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --query "Stacks[0].Outputs"

# 3. Configure backend
cd ../backend
# Create .env.local with CloudFormation outputs (BucketName and TableName)
# See DEVELOPER_SETUP.md for detailed instructions

# 4. Run automated tests
cd test
.\integration-local.ps1          # Windows
```

### Storage Template Features

The `storage-simple.yml` template includes:

**S3 Bucket Configuration:**
- CORS enabled for direct browser uploads
- Lifecycle policy: Temp uploads deleted after 1 day
- Lifecycle policy: Standard images transition to IA after 30 days
- Versioning enabled for data protection
- Public access blocked (presigned URLs only)

**DynamoDB Table Configuration:**
- On-demand billing for cost optimization
- Primary key: PK (partition) and SK (sort)
- GSI1: Category-based queries (GSI1PK/GSI1SK)
- GSI2: User-based queries (GSI2PK/GSI2SK)
- DynamoDB Streams enabled for future event processing
- Server-side encryption enabled
- Point-in-time recovery disabled (dev environment)

## Security Notes

- All resources use least-privilege IAM policies
- ECS tasks run in private subnets with no direct internet access
- S3 bucket blocks public access, uses presigned URLs only
- API Gateway enforces rate limiting and request validation
- Cognito handles all authentication with JWT tokens