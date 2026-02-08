# Developer Setup Guide

Quick guide to get the TCG Marketplace running locally for development.

## Prerequisites

Before you start, ensure you have:

- ✅ **Node.js 18+** - Check with `node --version`
- ✅ **npm 9+** - Check with `npm --version`
- ✅ **AWS CLI** - Check with `aws --version`
- ✅ **AWS Credentials** - Check with `aws sts get-caller-identity`
- ✅ **Git** - Check with `git --version`
- ✅ **PowerShell** (Windows) - Built-in on Windows 10+

## Quick Start (10 Minutes)

### 1. Clone and Install Dependencies

```powershell
# Clone repository
git clone <repository-url>
cd tcg-marketplace

# Install all dependencies (backend + frontend)
npm install
```

### 2. Deploy AWS Resources for Local Testing

```powershell
cd infra

# Deploy storage stack (S3 + DynamoDB + IAM roles)
aws cloudformation deploy `
  --template-file storage.yml `
  --stack-name tcg-marketplace-dev-storage `
  --parameter-overrides Environment=dev ProjectName=tcg-marketplace `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1

# Get resource names
aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-storage `
  --region ap-southeast-1 `
  --query "Stacks[0].Outputs"
```

**Note the output values:**
- `BucketName`: Your S3 bucket name (e.g., `tcg-marketplace-dev-storage-274603886128`)
- `TableName`: Your DynamoDB table name (e.g., `tcg-marketplace-dev-data`)

### 3. Configure Backend

```powershell
cd ../backend

# Create .env.local file
@"
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# AWS Configuration
AWS_REGION=ap-southeast-1

# AWS Resources (from CloudFormation outputs above)
BUCKET_NAME=tcg-marketplace-dev-storage-XXXXXX
TABLE_NAME=tcg-marketplace-dev-data

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

**Replace `XXXXXX` with your actual bucket name from Step 2!**

**Note:** The backend loads `.env.local` first, then falls back to `.env`. This allows you to keep local configuration separate from committed defaults.

### 4. Configure Frontend

```powershell
cd ../frontend

# Create .env.local file
@"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

### 5. Start Development Servers

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```powershell
cd tcg-marketplace/backend
npm run start:dev
```
Wait for: `🚀 TCG Marketplace Backend running on port 3000`

**Terminal 2 - Frontend:**
```powershell
cd tcg-marketplace/frontend
npm run dev
```
Wait for: `✓ Ready on http://localhost:3001`

**Terminal 3 - Run Tests:**
```powershell
# Test backend
cd tcg-marketplace/backend/test
.\integration-local.ps1

# Test frontend
cd tcg-marketplace/frontend/test
.\integration-e2e.ps1
```

### 6. Verify in Browser

1. Open http://localhost:3001
2. You should see the TCG Marketplace home page
3. Click "Sell" to create a test listing
4. Fill out the form and submit
5. Return to home page and see your listing

## Development Workflow

### Daily Development

```powershell
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
npm install

# 3. Start backend (Terminal 1)
cd backend
npm run start:dev

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Make your changes
# Edit files in backend/src or frontend/src

# 6. Test your changes
cd backend/test
.\integration-local.ps1
```

**Cost Tip:** For AWS deployments, scale ECS to 0 tasks when not in use to save ~$8/month. See [infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md) for details.

### Before Committing

```powershell
# 1. Run linters
cd backend
npm run lint

cd ../frontend
npm run lint

# 2. Run tests
cd ../backend/test
.\integration-local.ps1

cd ../../frontend/test
.\integration-e2e.ps1

# 3. Check for TypeScript errors
cd ../backend
npm run build

cd ../frontend
npm run build

# 4. Commit if all pass
git add .
git commit -m "Your commit message"
git push
```

## Common Issues

### Backend won't start

**Error:** `BUCKET_NAME environment variable is required`

**Solution:** Check your `backend/.env.local` file has the correct AWS resource names from CloudFormation.

### Frontend can't connect to backend

**Error:** `Failed to fetch listings`

**Solution:** 
1. Verify backend is running on port 3000: `curl http://localhost:3000/health`
2. Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Check backend CORS allows frontend origin

### Tests fail with AWS errors

**Error:** `AccessDenied` or `ResourceNotFoundException`

**Solution:**
1. Verify AWS credentials: `aws sts get-caller-identity`
2. Verify CloudFormation stack exists: `aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple`
3. Verify resources exist:
   ```powershell
   aws s3 ls
   aws dynamodb list-tables
   ```

### Port already in use

**Error:** `Port 3000 is already in use`

**Solution:**
```powershell
# Windows - find and kill process
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

## Project Structure

```
tcg-marketplace/
├── backend/              # NestJS API server
│   ├── src/             # Source code
│   ├── test/            # Integration tests
│   └── .env.local       # Local configuration (create this)
├── frontend/            # Next.js React app
│   ├── src/             # Source code
│   ├── test/            # Integration tests
│   └── .env.local       # Local configuration (create this)
└── infra/               # AWS CloudFormation templates
    └── storage-simple.yml  # Simplified storage for local dev
```

## Testing Documentation

- **Backend Tests**: See [backend/test/README.md](./backend/test/README.md)
- **Frontend Tests**: See [frontend/test/README.md](./frontend/test/README.md)
- **Quick Start**: See [frontend/test/QUICK_START.md](./frontend/test/QUICK_START.md)
- **Browser Testing**: See [frontend/test/BROWSER_TESTING.md](./frontend/test/BROWSER_TESTING.md)

## Architecture Overview

- **Backend**: NestJS (TypeScript) on port 3000
- **Frontend**: Next.js (React) on port 3001
- **Database**: DynamoDB (AWS)
- **Storage**: S3 (AWS)
- **Region**: ap-southeast-1 (Singapore)

### Deployment Options

For deploying to AWS, see:

- **[infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md)** - Complete deployment guide
- **[infra/README.md](./infra/README.md)** - Infrastructure overview
- **[infra/ARCHITECTURE_CHANGES.md](./infra/ARCHITECTURE_CHANGES.md)** - Architecture details

**Architecture:**
- ECS Fargate with Application Load Balancer
- Public subnets (no NAT Gateway)
- Direct AWS SDK access to S3/DynamoDB
- **Cost**: ~$25-35/month

## Getting Help

### Documentation
- Project README: [README.md](./README.md)
- Backend README: [backend/README.md](./backend/README.md)
- Frontend README: [frontend/README.md](./frontend/README.md)
- Infrastructure README: [infra/README.md](./infra/README.md)

### Testing Guides
- Local Testing: [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)
- Backend Tests: [backend/test/README.md](./backend/test/README.md)
- Frontend Tests: [frontend/test/README.md](./frontend/test/README.md)

### Common Commands
```powershell
# Backend
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run lint           # Run linter
npm run test           # Run unit tests

# Frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run lint           # Run linter

# Tests
cd backend/test && .\integration-local.ps1    # Backend integration tests
cd frontend/test && .\integration-e2e.ps1     # Frontend integration tests
```

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Run all tests successfully
3. ✅ Make a small change and test it
4. ✅ Read the architecture documentation
5. ✅ Join the team Slack channel
6. ✅ Pick up your first ticket

Welcome to the team! 🎉

## Team Handoff

If you're onboarding team members to this project, see **[HANDOFF_CHECKLIST.md](./HANDOFF_CHECKLIST.md)** for a comprehensive guide including:
- Pre-handoff verification checklist
- 30-minute handoff meeting agenda
- Success criteria for new team members
- Common issues and troubleshooting
- Post-handoff goals and milestones
