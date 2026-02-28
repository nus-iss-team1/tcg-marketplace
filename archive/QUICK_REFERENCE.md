# TCG Marketplace - Quick Reference

One-page cheat sheet for common development tasks.

## 🚀 Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Deploy AWS resources
cd infra
aws cloudformation deploy --template-file storage.yml --stack-name tcg-marketplace-dev-storage --parameter-overrides Environment=dev ProjectName=tcg-marketplace --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1

# 3. Configure environment
cd ../backend
cp .env.example .env.local  # Edit with AWS resource names
cd ../frontend
cp .env.example .env.local  # Edit with backend URL

# 4. Start servers
cd ../backend && npm run start:dev  # Terminal 1
cd ../frontend && npm run dev       # Terminal 2
```

## 📍 Ports

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Backend  | 3000 | http://localhost:3000    |
| Frontend | 3001 | http://localhost:3001    |

## 🧪 Testing

```powershell
# Backend integration tests
cd backend/test
.\integration-local.ps1

# Frontend integration tests
cd frontend/test
.\integration-e2e.ps1

# Unit tests
cd backend && npm run test
cd frontend && npm run test  # (when added)
```

## 🔧 Common Commands

### Infrastructure Management
```powershell
# Deploy infrastructure
cd infra
.\deploy.ps1 -Environment dev

# Scale ECS to save costs
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1  # Stop (~$8/month savings)
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1  # Start
```

### Backend
```powershell
cd backend
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run lint           # Run linter
npm run format         # Format code
npm run test           # Run unit tests
npm run test:cov       # Run with coverage
```

### Frontend
```powershell
cd frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run linter
npm run type-check     # Check TypeScript
npm run test:e2e       # Run integration tests
```

## 🗄️ AWS Resources

### Get Resource Names
```powershell
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage --region ap-southeast-1 --query "Stacks[0].Outputs"
```

### Verify Resources
```powershell
# List S3 buckets
aws s3 ls

# List DynamoDB tables
aws dynamodb list-tables --region ap-southeast-1

# Check AWS credentials
aws sts get-caller-identity
```

### Clean Up Test Data
```powershell
# Scan DynamoDB table
aws dynamodb scan --table-name tcg-marketplace-dev-data --max-items 5

# Delete specific listing
aws dynamodb delete-item --table-name tcg-marketplace-dev-data --key '{"PK":{"S":"LISTING#<id>"},"SK":{"S":"METADATA"}}'
```

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check .env.local exists and has correct values
cat backend/.env.local

# Verify AWS resources exist
aws s3 ls
aws dynamodb list-tables
```

### Frontend can't connect
```powershell
# Test backend health
curl http://localhost:3000/health

# Check frontend .env.local
cat frontend/.env.local
```

### Port already in use
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <pid> /F
```

### Tests fail
```powershell
# Ensure both servers are running
curl http://localhost:3000/health  # Backend
curl http://localhost:3001         # Frontend

# Check AWS credentials
aws sts get-caller-identity
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/.env.local` | Backend configuration (AWS resources) |
| `frontend/.env.local` | Frontend configuration (API URL) |
| `backend/test/integration-local.ps1` | Backend integration tests |
| `frontend/test/integration-e2e.ps1` | Frontend integration tests |
| `infra/storage.yml` | AWS resources (S3 + DynamoDB) |
| `infra/base.yml` | VPC and networking |
| `infra/compute.yml` | ECS Fargate with ALB |

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/listings?category=X&limit=Y` | Get listings |
| POST | `/listings` | Create listing |
| POST | `/media/presign` | Get S3 upload URL |

## 📊 Test Data

### Create Test Listing
```powershell
curl -X POST http://localhost:3000/listings `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Card","price":100,"category":"vintage","images":[]}'
```

### Query Listings
```powershell
curl "http://localhost:3000/listings?category=vintage&limit=10"
```

### Generate Presigned URL
```powershell
curl -X POST http://localhost:3000/media/presign `
  -H "Content-Type: application/json" `
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}'
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md) | Complete setup guide |
| [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md) | Testing overview |
| [backend/test/README.md](./backend/test/README.md) | Backend testing |
| [frontend/test/README.md](./frontend/test/README.md) | Frontend testing |
| [infra/README.md](./infra/README.md) | Infrastructure guide |
| [infra/INFRASTRUCTURE_REVIEW.md](./infra/INFRASTRUCTURE_REVIEW.md) | Comprehensive template review |
| [infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md) | AWS deployment guide |
| [infra/ARCHITECTURE_CHANGES.md](./infra/ARCHITECTURE_CHANGES.md) | Architecture overview |
| [HANDOFF_CHECKLIST.md](./HANDOFF_CHECKLIST.md) | Team onboarding guide |

## 🎯 Before Committing

- [ ] Backend tests pass: `cd backend/test && .\integration-local.ps1`
- [ ] Frontend tests pass: `cd frontend/test && .\integration-e2e.ps1`
- [ ] Linters pass: `npm run lint` (both backend and frontend)
- [ ] TypeScript compiles: `npm run build` (both backend and frontend)
- [ ] Manual browser test: Create and view a listing
- [ ] No console errors in browser DevTools

## 🆘 Getting Help

1. Check documentation in project root
2. Search existing issues in repository
3. Ask in team Slack channel: `#tcg-marketplace-dev`
4. Contact platform engineer for infrastructure issues
