# Archive - Troubleshooting and Temporary Files

This folder contains files that were used during development and troubleshooting but are not needed for redeployment to a new AWS account.

## Archived Files

### Troubleshooting Scripts
- `absolute-clean-deploy.ps1` - Script to completely clean Docker cache and deploy (used to fix build cache issues)
- `deploy-frontend-to-aws.ps1` - Early deployment script (superseded by infra deployment scripts)
- `nuclear-rebuild.ps1` - Aggressive Docker rebuild script
- `rebuild-frontend-clean.ps1` - Clean rebuild script
- `test-frontend-local.ps1` - Local Docker testing script
- `test-frontend-with-aws.ps1` - AWS backend connection testing script

### Documentation
- `DEPLOYMENT_STATUS.md` - Temporary deployment status tracking document
- `LOCAL_TESTING_GUIDE.md` - Local testing guide (information now in test folders)
- `QUICK_REFERENCE.md` - Quick reference guide (if redundant with README)

## What You Need for Redeployment

All essential files remain in the main project structure:

### Source Code
- `backend/src/` - Backend application code
- `frontend/src/` - Frontend application code

### Configuration
- `backend/package.json`, `tsconfig.json`, `nest-cli.json`
- `frontend/package.json`, `tsconfig.json`, `next.config.ts`
- `backend/Dockerfile`, `frontend/Dockerfile`
- `.dockerignore` (root level)

### Infrastructure
- `infra/*.yml` - CloudFormation templates
- `infra/parameters/*.json` - Environment-specific parameters
- `infra/deploy.ps1` - Main deployment script

### Documentation
- `README.md` - Main project documentation
- `DEVELOPER_SETUP.md` - Developer setup guide
- `HANDOFF_CHECKLIST.md` - Deployment checklist
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
- `infra/DEPLOYMENT_SIMPLE.md` - Deployment guide

### Testing
- `backend/test/` - Backend tests
- `frontend/test/` - Frontend tests

## Notes

These archived files can be safely deleted if you want to clean up the repository further. They were primarily used to troubleshoot Docker build caching issues during the initial deployment.
