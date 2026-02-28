# Infrastructure Cleanup Summary

## What Was Done

The TCG Marketplace infrastructure has been cleaned up and simplified. All old complex architecture files have been archived, and the simplified architecture is now the default.

**Comprehensive Review:** See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md) for a complete review of all current templates, their resources, deployment order, security model, cost optimization features, and validation checklist.

## File Changes

### Replaced Files (Simplified → Main)
The simplified templates replaced the old complex templates:
- `base-simple.yml` replaced old `base.yml` (complex VPC) → now just `base.yml` (simplified VPC)
- `compute-simple.yml` replaced old `compute.yml` (complex ECS) → now just `compute.yml` (simplified ECS)
- `storage-simple.yml` replaced old `storage.yml` (complex storage) → now just `storage.yml` (simplified storage)
- `deploy-simple.ps1` replaced old `deploy.ps1` (complex deployment) → now just `deploy.ps1` (simplified deployment)

**Result:** No more `-simple` suffix. The simplified architecture is now the default.

### Archived Files (Moved to `archive/`)
- `base.yml` → `archive/base-full.yml` (old complex VPC with NAT Gateway)
- `compute.yml` → `archive/compute-full.yml` (old ECS with private subnets)
- `storage.yml` → `archive/storage-full.yml` (old storage with VPC dependencies)
- `api.yml` → `archive/api.yml` (API Gateway with VPC Link)
- `deploy.ps1` → `archive/deploy-full.ps1` (old deployment script)
- `scripts/` → `archive/scripts/` (NAT Gateway cost management scripts)

### Kept Files (No Changes)
- `auth.yml` - Cognito authentication (optional)
- `monitoring.yml` - CloudWatch dashboards (optional)
- `validate.ps1` - Validation script
- `validate-manual.md` - Manual validation guide
- `setup-new-account.ps1` - AWS account setup
- `parameters/` - Environment configuration files

### New Files
- `DEPLOYMENT_SIMPLE.md` - Complete deployment guide
- `ARCHITECTURE_CHANGES.md` - Migration and comparison guide
- `INFRASTRUCTURE_REVIEW.md` - Comprehensive template review and validation
- `archive/README.md` - Archive documentation
- `CLEANUP_SUMMARY.md` - This file

## Final Clean Structure

```
infra/
├── parameters/                 # Environment configs
│   ├── dev.json
│   └── prod.json
├── archive/                    # Old complex architecture (preserved)
│   ├── base-full.yml          # VPC with NAT Gateway
│   ├── compute-full.yml       # ECS with private subnets
│   ├── storage-full.yml       # Storage with VPC dependencies
│   ├── api.yml                # API Gateway with VPC Link
│   ├── deploy-full.ps1        # Complex deployment script
│   ├── scripts/               # NAT Gateway cost management
│   └── README.md              # Archive documentation
├── base.yml                    # VPC with public subnets
├── storage.yml                 # S3 + DynamoDB
├── compute.yml                 # ECS Fargate + ALB
├── auth.yml                    # Cognito (optional)
├── monitoring.yml              # CloudWatch (optional)
├── deploy.ps1                  # Deployment script
├── validate.ps1                # Validation script
├── setup-new-account.ps1       # AWS account setup
├── validate-manual.md          # Manual validation guide
├── DEPLOYMENT_SIMPLE.md        # Deployment guide
├── ARCHITECTURE_CHANGES.md     # Migration guide
├── INFRASTRUCTURE_REVIEW.md    # Template review and validation
├── CLEANUP_SUMMARY.md          # This file
└── README.md                   # Infrastructure overview
```

**Key Points:**
- ✅ No more `-simple` suffix on any files
- ✅ Simplified architecture is now the default
- ✅ Old complex architecture preserved in `archive/`
- ✅ Clean, unambiguous file structure
- ✅ Comprehensive template review available

## Documentation Updates

All documentation has been updated to reflect the simplified architecture:

### Updated Files
1. **README.md** - Main project overview
2. **DEVELOPER_SETUP.md** - Developer setup guide
3. **QUICK_REFERENCE.md** - Quick reference cheat sheet
4. **infra/README.md** - Infrastructure documentation
5. **.kiro/steering/tech.md** - Technology stack steering
6. **.kiro/steering/structure.md** - Project structure steering

### Key Changes in Documentation
- Removed references to "simplified" vs "full" architecture
- Updated all file paths (removed `-simple` suffix)
- Updated deployment commands
- Removed NAT Gateway cost management scripts references
- Simplified cost management to just ECS scaling

## How to Use

### Deploy Infrastructure
```powershell
cd tcg-marketplace/infra

# Deploy all stacks
.\deploy.ps1 -Environment dev

# Or with custom image
.\deploy.ps1 -Environment dev -ImageUri "<your-ecr-image>"
```

### Deploy Individual Stacks
```powershell
# Storage (S3 + DynamoDB)
aws cloudformation deploy --template-file storage.yml --stack-name tcg-marketplace-dev-storage --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1

# Base (VPC + Security Groups)
aws cloudformation deploy --template-file base.yml --stack-name tcg-marketplace-dev-base --region ap-southeast-1

# Compute (ECS + ALB)
aws cloudformation deploy --template-file compute.yml --stack-name tcg-marketplace-dev-compute --parameter-overrides ImageUri=<uri> --region ap-southeast-1
```

### Cost Management
```powershell
# Stop ECS tasks (save ~$8/month)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1

# Start ECS tasks
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
```

## Architecture Comparison

### Current (Simplified)
- **Cost**: ~$25-35/month
- **Components**: VPC (public subnets), ALB, ECS Fargate, S3, DynamoDB
- **Use Case**: Development, testing, small-scale production (up to 100 users)

### Archived (Complex)
- **Cost**: ~$90-120/month
- **Components**: VPC (private subnets), NAT Gateway, API Gateway, VPC Link, NLB, ALB, ECS Fargate, S3, DynamoDB
- **Use Case**: Production with strict security requirements, compliance needs

## Migration Notes

### If You Have Existing Deployments

**Using Old Complex Architecture:**
1. Your existing stacks continue to work
2. No immediate action required
3. To migrate: Deploy new simplified stacks, test, then delete old stacks
4. See [ARCHITECTURE_CHANGES.md](./ARCHITECTURE_CHANGES.md) for migration guide

**Using Old Simplified Architecture:**
1. Stack names remain the same
2. Template file names changed (removed `-simple` suffix)
3. Update your deployment scripts to use new file names
4. No infrastructure changes needed

### Breaking Changes

**None!** The infrastructure resources are identical:
- The simplified templates are now the main templates
- Old complex templates moved to `archive/`
- All `-simple` suffixes removed for clarity
- Stack names and resource names unchanged

## Restoring Old Architecture

If you need the old complex architecture:

1. Copy files from `archive/` back to `infra/`
2. Rename: `base-full.yml` → `base.yml`, etc.
3. Use `archive/deploy-full.ps1` for deployment
4. See `archive/README.md` for details

## Benefits of Cleanup

1. **Simpler Structure**: One architecture, not two
2. **Clearer Documentation**: No confusion about which files to use
3. **Easier Onboarding**: New developers see one clear path
4. **Maintained History**: Old architecture preserved in archive
5. **Cost Savings**: Default architecture is cost-effective

## Questions?

- **Deployment**: See [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)
- **Architecture**: See [ARCHITECTURE_CHANGES.md](./ARCHITECTURE_CHANGES.md)
- **Template Review**: See [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md)
- **Infrastructure**: See [README.md](./README.md)
- **Archive**: See [archive/README.md](./archive/README.md)
