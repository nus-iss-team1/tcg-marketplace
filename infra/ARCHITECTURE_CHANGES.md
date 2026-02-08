# Architecture Changes - Simplified Design

> **Note:** The complex architecture with private subnets, NAT Gateway, API Gateway, and VPC Link has been archived to the **[archive/](./archive/)** directory. This document describes the transition to the simplified architecture. For information about the archived files, see **[archive/README.md](./archive/README.md)**.

## Summary

The TCG Marketplace infrastructure has been updated to use a **simplified, cost-effective architecture** that eliminates unnecessary complexity while maintaining security and functionality.

**Comprehensive Review:** See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for detailed analysis of all templates, deployment order, security model, cost optimization features, and validation checklist.

## What Changed

### Old Architecture (Complex)
```
Frontend → API Gateway → VPC Link → NLB → ECS (Private Subnets) → NAT Gateway → S3/DynamoDB
```

**Components:**
- VPC with private subnets
- NAT Gateway ($32/month)
- API Gateway ($3.50/million requests)
- VPC Link ($36/month)
- Network Load Balancer ($16/month)
- ECS Fargate in private subnets

**Cost:** ~$90-120/month

### New Architecture (Simplified)
```
Frontend → Application Load Balancer → ECS (Public Subnets) → S3/DynamoDB
```

**Components:**
- VPC with public subnets only
- Application Load Balancer ($16/month)
- ECS Fargate with public IP ($8/month)
- S3 + DynamoDB (pay-per-use, ~$1-5/month)

**Cost:** ~$25-35/month

**Savings:** ~$60-85/month (65-70% reduction)

## New Files

### Infrastructure Templates
1. **`storage.yml`** - S3 + DynamoDB (updated with IAM roles)
2. **`base.yml`** - VPC with public subnets, security groups (no NAT Gateway)
3. **`compute.yml`** - ECS Fargate with ALB (no API Gateway)

### Deployment Scripts
1. **`deploy.ps1`** - Automated deployment for simplified architecture
2. **`DEPLOYMENT_SIMPLE.md`** - Complete deployment guide

### Archived Files
The old complex architecture has been moved to **`archive/`** directory:
- `archive/base-full.yml` - VPC with private subnets and NAT Gateway
- `archive/compute-full.yml` - ECS in private subnets with NLB
- `archive/storage-full.yml` - S3 + DynamoDB with VPC policies
- `archive/api.yml` - API Gateway with VPC Link
- `archive/deploy-full.ps1` - Full architecture deployment
- `archive/scripts/` - NAT Gateway cost management scripts

See **[archive/README.md](./archive/README.md)** for details on archived files and restoration instructions.

## Updated Files

### Documentation
- **`README.md`** - Updated architecture overview with archive references
- **`infra/README.md`** - Added simplified architecture section and archive links
- **`DEVELOPER_SETUP.md`** - Updated deployment steps
- **`QUICK_REFERENCE.md`** - Updated commands

### Archived Files
- **`archive/README.md`** - Documentation for archived complex architecture

### Steering Files
- **`.kiro/steering/tech.md`** - Updated infrastructure section
- **`.kiro/steering/structure.md`** - Updated infra structure

## What Stayed the Same

### Backend Code
- ✅ No changes to NestJS application code
- ✅ Same AWS SDK usage for S3 and DynamoDB
- ✅ Same adapters and controllers
- ✅ Same environment variables

### Frontend Code
- ✅ No changes to Next.js application
- ✅ Same API calls (just different URL)
- ✅ Same components and pages

### AWS Resources
- ✅ S3 bucket (same configuration)
- ✅ DynamoDB table (same schema)
- ✅ IAM roles (same permissions)

### Testing
- ✅ All existing tests work unchanged
- ✅ Same integration test scripts
- ✅ Same test data and workflows

## Migration Path

### For New Deployments
Use the simplified architecture by default:
```powershell
cd tcg-marketplace/infra
.\deploy.ps1 -Environment dev
```

### For Existing Full Architecture Deployments
You can continue using the archived full architecture, or migrate:

1. **Deploy new simplified stacks** (with different stack names)
2. **Test the new deployment**
3. **Update frontend to point to new ALB URL**
4. **Delete old stacks** when ready

No data migration needed - S3 and DynamoDB are independent.

### Restoring Archived Full Architecture
If you need the complex architecture with private subnets:

1. See **[archive/README.md](./archive/README.md)** for restoration instructions
2. Copy archived templates back to infra directory
3. Follow archived deployment guide

## When to Use Each Architecture

### Use Simplified Architecture When:
- ✅ Development and testing
- ✅ Cost is a primary concern (~$25-35/month)
- ✅ Supporting up to 100 concurrent users
- ✅ Don't need private subnet isolation
- ✅ Learning and prototyping

### Use Full Architecture When:
- ✅ Production with strict security requirements
- ✅ Need private subnet isolation
- ✅ Compliance requirements (PCI, HIPAA)
- ✅ Large-scale production (1000+ users)
- ✅ Need API Gateway features (caching, throttling)

## Security Comparison

### Simplified Architecture Security
- ✅ IAM roles control S3/DynamoDB access
- ✅ Security groups restrict network traffic
- ✅ HTTPS via ALB (with ACM certificate)
- ✅ S3 bucket blocks public access
- ✅ DynamoDB encryption at rest
- ✅ Optional: Add Cognito for authentication

### Full Architecture Additional Security
- ✅ All simplified security features
- ✅ Private subnets (no direct internet access)
- ✅ NAT Gateway for outbound traffic only
- ✅ VPC endpoints for AWS services
- ✅ API Gateway request validation
- ✅ Network isolation layers

## Cost Breakdown

### Simplified Architecture (~$25-35/month)
| Service | Cost/Month |
|---------|------------|
| Application Load Balancer | ~$16 |
| ECS Fargate (0.25 vCPU, 512MB, 24/7) | ~$8 |
| S3 (10GB storage, 1000 requests) | ~$0.50 |
| DynamoDB (on-demand, light usage) | ~$1-5 |
| CloudWatch Logs (1GB) | ~$0.50 |
| **Total** | **~$26-30** |

**With Auto-scaling (peak traffic):**
- ECS Fargate (3 tasks for dev): ~$24/month
- **Peak Total**: ~$42-48/month

### Full Architecture (~$90-120/month)
| Service | Cost/Month |
|---------|------------|
| All simplified costs | ~$26-30 |
| NAT Gateway (data + hourly) | ~$32 |
| API Gateway (1M requests) | ~$3.50 |
| VPC Link | ~$36 |
| Network Load Balancer | ~$16 |
| **Total** | **~$113-118** |

## Additional Cost Savings

### Scale ECS to 0 Tasks
Save ~$8-24/month when not in use (depending on current scale):
```powershell
# Stop (disables auto-scaling)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1

# Start (re-enables auto-scaling)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
```

**Note:** ALB still costs $16/month even when idle. Auto-scaling will automatically manage task count once restarted.

### Use Fargate Spot
Save ~50% on compute costs (not recommended for production):
```yaml
CapacityProviders:
  - FARGATE_SPOT
```

## Deployment Commands

### Simplified Architecture (Current)
```powershell
# Deploy everything
cd tcg-marketplace/infra
.\deploy.ps1 -Environment dev

# Deploy with custom image
.\deploy.ps1 -Environment dev -ImageUri "<your-ecr-image-uri>"

# Deploy individual stacks
aws cloudformation deploy --template-file storage.yml --stack-name tcg-marketplace-dev-storage --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1
aws cloudformation deploy --template-file base.yml --stack-name tcg-marketplace-dev-base --region ap-southeast-1
aws cloudformation deploy --template-file compute.yml --stack-name tcg-marketplace-dev-compute --parameter-overrides ImageUri=<uri> --region ap-southeast-1
```

### Full Architecture (Archived)
See **[archive/README.md](./archive/README.md)** for archived deployment commands.

## Testing

All existing tests work with both architectures:

```powershell
# Backend integration tests (local)
cd tcg-marketplace/backend/test
.\integration-local.ps1

# Frontend integration tests
cd tcg-marketplace/frontend/test
.\integration-e2e.ps1
```

The only difference is the backend URL:
- **Simplified:** `http://your-alb-dns.ap-southeast-1.elb.amazonaws.com`
- **Full:** `https://your-api-id.execute-api.ap-southeast-1.amazonaws.com/dev`

## Monitoring

### Simplified Architecture
```powershell
# View ECS logs
aws logs tail /ecs/tcg-marketplace-dev --follow --region ap-southeast-1

# Check service status
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-backend --region ap-southeast-1

# Check ALB health
aws elbv2 describe-target-health --target-group-arn <arn> --region ap-southeast-1
```

### Full Architecture
- All simplified monitoring
- Plus: API Gateway logs and metrics (archived)
- Plus: VPC Flow Logs (archived)
- Plus: CloudWatch dashboards (monitoring.yml)
- See **[archive/README.md](./archive/README.md)** for archived monitoring features

## Troubleshooting

### Common Issues

**ECS tasks not starting:**
- Check security group allows traffic from ALB
- Verify Docker image exists in ECR
- Check ECS task logs

**ALB health checks failing:**
- Verify backend responds on port 3000
- Check /health endpoint works
- Verify security group rules

**Can't access backend:**
- Get ALB DNS: `aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-compute --query 'Stacks[0].Outputs[?OutputKey==\`LoadBalancerURL\`].OutputValue' --output text`
- Test: `curl http://<alb-dns>/health`

## Next Steps

1. ✅ Review this document
2. ✅ Choose architecture (simplified recommended)
3. ✅ Follow [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) for deployment
4. ✅ Update frontend with backend URL
5. ✅ Test all endpoints
6. ✅ Optional: Add Cognito authentication (auth.yml)
7. ✅ Optional: Add custom domain with Route53

## Questions?

- **Deployment Guide:** [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)
- **Infrastructure Overview:** [README.md](./README.md)
- **Developer Setup:** [../DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)
- **Quick Reference:** [../QUICK_REFERENCE.md](../QUICK_REFERENCE.md)
