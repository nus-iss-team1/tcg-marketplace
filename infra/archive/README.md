# Archived Infrastructure Files

This directory contains the old complex architecture files that have been replaced by the simplified architecture.

## Archived Files

### Backend-Only Deployment (Not Needed)
- **compute.yml** - Backend-only ECS deployment (use `compute-fullstack.yml` instead)
- **dev.json** - Parameters for backend-only deployment (use `dev-fullstack.json` instead)

These files deploy only the backend service. Since you need both frontend and backend with path-based routing through a single ALB, use `compute-fullstack.yml` instead.

### Full Architecture Templates (Advanced)
- **base-full.yml** - VPC with private subnets, NAT Gateway, VPC endpoints
- **compute-full.yml** - ECS Fargate in private subnets with Network Load Balancer
- **storage-full.yml** - S3 and DynamoDB with VPC-specific IAM policies
- **api.yml** - API Gateway with VPC Link and Cognito authorization
- **deploy-full.ps1** - Deployment script for full architecture

### Cost Management Scripts
- **scripts/** - Daily start/stop scripts for NAT Gateway management
  - `dev-start.ps1` - Start NAT Gateway (~$1.58/day)
  - `dev-stop.ps1` - Stop NAT Gateway (saves ~$47/month)
  - `dev-status.ps1` - Check infrastructure status and costs
  - `README.md` - Cost management documentation

## Why These Were Archived

The full architecture was replaced with a simplified design because:

1. **Cost Reduction**: Simplified architecture costs ~$25-35/month vs ~$90-120/month (70% savings)
2. **Unnecessary Complexity**: NAT Gateway, VPC Link, and API Gateway not needed for 100-user scale
3. **Easier Maintenance**: Fewer moving parts, simpler troubleshooting
4. **Same Security**: IAM roles and security groups provide adequate security
5. **Same Functionality**: Backend code unchanged, same AWS SDK access to S3/DynamoDB

## When to Use Full Architecture

Consider using these archived templates if you need:

- **Private subnet isolation** for compliance (PCI, HIPAA)
- **API Gateway features** like caching, throttling, API keys
- **VPC endpoints** for AWS service access without internet
- **Network isolation** between application tiers
- **Large-scale production** (1000+ concurrent users)

## Cost Comparison

| Component | Simplified | Full (Archived) |
|-----------|-----------|-----------------|
| VPC | Public subnets only | Private + public subnets |
| NAT Gateway | None | $32/month |
| Load Balancer | ALB ($16/month) | ALB + NLB ($32/month) |
| API Gateway | None | $3.50/million requests |
| VPC Link | None | $36/month |
| ECS Fargate | $8/month | $8/month |
| S3 + DynamoDB | $1-5/month | $1-5/month |
| **Total** | **~$25-35/month** | **~$90-120/month** |

## Migration from Full to Simplified

If you have the full architecture deployed and want to migrate:

1. Deploy simplified stacks with different names
2. Test the new deployment thoroughly
3. Update frontend to point to new ALB URL
4. Verify all functionality works
5. Delete old full architecture stacks
6. No data migration needed (S3 and DynamoDB are independent)

## Restoring Full Architecture

To restore and use the full architecture:

1. Copy files from archive back to infra directory
2. Rename: `base-full.yml` → `base.yml`, etc.
3. Follow deployment order: base → storage → auth → compute → api
4. Use `deploy-full.ps1` for automated deployment

## Current Simplified Architecture

The current simplified architecture uses:

- **base.yml** - VPC with public subnets
- **storage.yml** - S3 + DynamoDB
- **compute-fullstack.yml** - ECS Fargate with ALB (frontend + backend) ✅ Use this
- **deploy.ps1** - Deployment script

Parameter files:
- **parameters/dev-fullstack.json** - For full-stack deployment ✅ Use this
- **parameters/prod.json** - For production deployment

See [../README.md](../README.md) for current architecture documentation.

## Questions?

For questions about the simplified architecture or migration:
- See [../README.md](../README.md) - Infrastructure overview
- See [../DEPLOYMENT_SIMPLE.md](../DEPLOYMENT_SIMPLE.md) - Deployment guide
- See [../ARCHITECTURE_CHANGES.md](../ARCHITECTURE_CHANGES.md) - Migration guide
