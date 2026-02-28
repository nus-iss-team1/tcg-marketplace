# Frontend ECS Fargate Deployment Guide

This guide shows you how to deploy both frontend and backend to ECS Fargate with path-based routing.

## Architecture

```
User Browser
    ↓
Application Load Balancer
    ├── /          → Frontend (Next.js on ECS)
    └── /api/*     → Backend (NestJS on ECS)
```

**Path-Based Routing:**
- `http://your-alb.com/` → Frontend
- `http://your-alb.com/api/*` → Backend

## Prerequisites

- ✅ Backend already deployed (compute stack)
- ✅ Docker Desktop running
- ✅ AWS CLI configured
- ✅ Base and storage stacks deployed

## Deployment Steps

### Step 1: Delete Existing Compute Stack

Since we're replacing the backend-only stack with a full-stack one:

```powershell
# Delete the existing compute stack
aws cloudformation delete-stack `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1

# Wait for deletion
aws cloudformation wait stack-delete-complete `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1
```

**Time:** 3-5 minutes

### Step 2: Create ECR Repository for Frontend

```powershell
# Create ECR repository
aws ecr create-repository `
  --repository-name tcg-marketplace-frontend `
  --region ap-southeast-1

# Get ECR URI
$FRONTEND_ECR_URI = aws ecr describe-repositories `
  --repository-names tcg-marketplace-frontend `
  --region ap-southeast-1 `
  --query 'repositories[0].repositoryUri' `
  --output text

Write-Host "Frontend ECR URI: $FRONTEND_ECR_URI" -ForegroundColor Green
```

**Expected Output:** `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-frontend`

### Step 3: Build Frontend Docker Image

```powershell
# Navigate to project root (important for workspace setup)
cd tcg-marketplace

# Build Docker image from root directory
docker build -f frontend/Dockerfile -t tcg-marketplace-frontend:latest .

# Verify image
docker images | Select-String "tcg-marketplace-frontend"
```

**Build Time:** 3-5 minutes

**Important Build Configuration:** 
- The Dockerfile includes curl for the Docker HEALTHCHECK instruction (used for local testing)
- ESLint and TypeScript checks are skipped during Docker builds for faster build times (configured in `next.config.ts`)
- Next.js is configured with `output: 'standalone'` for optimized Docker deployments (smaller image size, faster startup)
- Run `npm run lint` locally before building to catch issues early
- **Build from project root**: The Dockerfile expects to be run from the tcg-marketplace root directory to access workspace configuration

**Known Issues Fixed:**
- React 19 compatibility issues resolved by using React 18.3.1 with Next.js 15.0.3
- Removed `force-dynamic` from layout.tsx to prevent build failures
- Custom error pages added for proper error handling
- Simplified next.config.ts for reliable builds

**Test Build Locally First:**
```powershell
cd tcg-marketplace/frontend
npm run build
```
This validates the build before creating the Docker image.

### Step 4: Push Frontend Image to ECR

```powershell
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | `
  docker login --username AWS --password-stdin $FRONTEND_ECR_URI

# Tag image
docker tag tcg-marketplace-frontend:latest ${FRONTEND_ECR_URI}:latest

# Push to ECR
docker push ${FRONTEND_ECR_URI}:latest
```

**Push Time:** 2-4 minutes

### Step 5: Get Backend ECR URI

```powershell
# Get backend ECR URI
$BACKEND_ECR_URI = aws ecr describe-repositories `
  --repository-names tcg-marketplace-backend `
  --region ap-southeast-1 `
  --query 'repositories[0].repositoryUri' `
  --output text

Write-Host "Backend ECR URI: $BACKEND_ECR_URI" -ForegroundColor Green
```

### Step 6: Deploy Full Stack

```powershell
# Navigate to infra directory
cd ../infra

# Option 1: Using parameter file (recommended)
aws cloudformation deploy `
  --template-file compute-fullstack.yml `
  --stack-name tcg-marketplace-dev-compute `
  --parameter-overrides file://parameters/dev-fullstack.json `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1

# Option 2: Using inline parameters
aws cloudformation deploy `
  --template-file compute-fullstack.yml `
  --stack-name tcg-marketplace-dev-compute `
  --parameter-overrides `
    Environment=dev `
    ProjectName=tcg-marketplace `
    BackendImageUri="${BACKEND_ECR_URI}:latest" `
    FrontendImageUri="${FRONTEND_ECR_URI}:latest" `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-southeast-1
```

**Deployment Time:** 8-12 minutes

### Step 7: Get URLs

```powershell
# Get ALB DNS
$ALB_DNS = aws cloudformation describe-stacks `
  --stack-name tcg-marketplace-dev-compute `
  --region ap-southeast-1 `
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
  --output text

Write-Host "Frontend URL: http://${ALB_DNS}/" -ForegroundColor Green
Write-Host "Backend URL: http://${ALB_DNS}/api" -ForegroundColor Cyan
```

### Step 8: Test Deployment

```powershell
# Test frontend
Invoke-WebRequest -Uri "http://${ALB_DNS}/" -UseBasicParsing

# Test backend
Invoke-WebRequest -Uri "http://${ALB_DNS}/api/health" -UseBasicParsing

# Test backend listings
Invoke-WebRequest -Uri "http://${ALB_DNS}/api/listings" -UseBasicParsing
```

**Expected Results:**
- Frontend: HTML page (status 200)
- Backend health: JSON with status "ok"
- Backend listings: JSON array

**Note**: All backend endpoints are prefixed with `/api` for path-based routing.

## URL Structure

### Frontend URLs:
- `http://your-alb.com/` - Home page
- `http://your-alb.com/sell` - Sell page
- `http://your-alb.com/listings` - Listings page (if you create it)

### Backend URLs:
- `http://your-alb.com/api/health` - Health check
- `http://your-alb.com/api/listings` - Get listings
- `http://your-alb.com/api/media/presign` - Get presigned URL

**Note**: All backend endpoints are prefixed with `/api`.

## Frontend Configuration

The frontend automatically gets the correct API URL through environment variables set by CloudFormation:

**Automatic Configuration:**
- `NEXT_PUBLIC_API_URL` is set to `http://<ALB-DNS>/api` by the CloudFormation template
- No manual configuration needed when using `compute-fullstack.yml`
- The frontend makes requests to `/api/*` endpoints which are routed to the backend service

```typescript
// Frontend calls backend like this:
fetch('/api/listings')  // Automatically routes to backend

// ALB handles the routing:
// /api/* → Backend ECS service
// /* → Frontend ECS service
```

## Update Frontend Code

If you need to update the frontend:

```powershell
# 1. Make changes to frontend code
cd tcg-marketplace/frontend

# 2. Run linting and type checks locally (skipped in Docker build)
npm run lint

# 3. Test build locally
npm run build

# 4. Rebuild Docker image (from project root)
cd ..
docker build -f frontend/Dockerfile -t tcg-marketplace-frontend:latest .

# 5. Login to ECR
$FRONTEND_ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-frontend"
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $FRONTEND_ECR_URI

# 6. Tag and push
docker tag tcg-marketplace-frontend:latest ${FRONTEND_ECR_URI}:latest
docker push ${FRONTEND_ECR_URI}:latest

# 7. Force ECS to redeploy
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-frontend `
  --force-new-deployment `
  --region ap-southeast-1
```

**Note:** ESLint and TypeScript checks are skipped during Docker builds for faster deployment. Next.js uses `output: 'standalone'` mode for optimized containerized deployments with smaller image sizes and faster startup times. Always run `npm run lint` and `npm run build` locally before pushing to catch issues early.

**Troubleshooting Build Issues:**
If the Docker build fails, see [DEPLOYMENT_FIX.md](../frontend/DEPLOYMENT_FIX.md) for common issues and solutions including:
- React 19 compatibility issues
- Force dynamic rendering problems
- Error page pre-rendering failures

## Update Backend Code

Same process as before:

```powershell
cd tcg-marketplace/backend
docker build -t tcg-marketplace-backend:latest .
$BACKEND_ECR_URI = "274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend"
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $BACKEND_ECR_URI
docker tag tcg-marketplace-backend:latest ${BACKEND_ECR_URI}:latest
docker push ${BACKEND_ECR_URI}:latest
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --force-new-deployment --region ap-southeast-1
```

## Monitoring

### View Logs

```powershell
# Frontend logs
aws logs tail /ecs/tcg-marketplace-dev-frontend --follow --region ap-southeast-1

# Backend logs
aws logs tail /ecs/tcg-marketplace-dev-backend --follow --region ap-southeast-1
```

### Check Service Status

```powershell
# Frontend service
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-frontend `
  --region ap-southeast-1 `
  --query 'services[0].[serviceName,status,runningCount,desiredCount]'

# Backend service
aws ecs describe-services `
  --cluster tcg-marketplace-dev-cluster `
  --services tcg-marketplace-dev-backend `
  --region ap-southeast-1 `
  --query 'services[0].[serviceName,status,runningCount,desiredCount]'
```

## Cost Management

### Stop Both Services

```powershell
# Stop frontend
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-frontend `
  --desired-count 0 `
  --region ap-southeast-1

# Stop backend
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 0 `
  --region ap-southeast-1
```

**Savings:** ~$16/month (Fargate costs)
**Note:** ALB still costs ~$16/month even when services are stopped

### Start Both Services

```powershell
# Start frontend
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-frontend `
  --desired-count 1 `
  --region ap-southeast-1

# Start backend
aws ecs update-service `
  --cluster tcg-marketplace-dev-cluster `
  --service tcg-marketplace-dev-backend `
  --desired-count 1 `
  --region ap-southeast-1
```

## Cost Breakdown

**Monthly Costs:**
- ALB: ~$16/month
- Backend ECS (0.25 vCPU, 512MB): ~$8/month
- Frontend ECS (0.25 vCPU, 512MB): ~$8/month
- Data transfer: ~$1-3/month
- **Total: ~$33-35/month**

**Comparison:**
- Vercel Pro (2 users): $40/month
- ECS Fargate: $33-35/month
- **Savings: $5-7/month** (plus unlimited team members)

## Troubleshooting

### Frontend Not Loading

```powershell
# Check frontend service
aws ecs describe-services --cluster tcg-marketplace-dev-cluster --services tcg-marketplace-dev-frontend --region ap-southeast-1

# Check frontend logs
aws logs tail /ecs/tcg-marketplace-dev-frontend --region ap-southeast-1

# Check frontend task health
aws ecs list-tasks --cluster tcg-marketplace-dev-cluster --service-name tcg-marketplace-dev-frontend --region ap-southeast-1
```

### Backend API Not Working

```powershell
# Test backend directly
Invoke-WebRequest -Uri "http://${ALB_DNS}/api/health" -UseBasicParsing

# Check listener rules
aws elbv2 describe-rules --listener-arn <listener-arn> --region ap-southeast-1
```

**Note**: Backend endpoints are prefixed with `/api`.

### Health Checks Failing

**Frontend Health Check:**
- Path: `/`
- Expected: 200 or 304
- Performed by: ALB Target Group

**Backend Health Check:**
- Path: `/api/health`
- Expected: 200
- Performed by: ALB Target Group

**Note:** ECS relies on ALB health checks. The Dockerfile HEALTHCHECK is for local Docker testing only.

### Docker Build Failures

If the frontend Docker build fails with React or Next.js errors:

1. **Check package versions** - Ensure using React 18.3.1 (not 19.x) with Next.js 15.0.3
2. **Test local build first** - Run `npm run build` in frontend directory before Docker build
3. **Review configuration** - Check next.config.ts for proper standalone output configuration
4. **Clear build cache** - Delete `.next` directory and node_modules, then reinstall

See [DEPLOYMENT_FIX.md](../frontend/DEPLOYMENT_FIX.md) for detailed troubleshooting of:
- React 19 compatibility issues with Next.js 15.5.x
- Force dynamic rendering causing build failures
- Error page pre-rendering problems

### CORS Issues

If frontend can't call backend, check backend CORS configuration:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || true, // Allow all origins in dev, or use same-origin since behind ALB
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

**Note**: When deployed behind an ALB with path-based routing (frontend and backend on same domain), CORS is automatically handled as same-origin requests. For production with separate domains, set the `CORS_ORIGINS` environment variable in the ECS task definition.

## Architecture Diagram

```
Internet
    ↓
Application Load Balancer (Port 80)
    ├── Listener Rule: /api/* → Backend Target Group
    │       ↓
    │   Backend ECS Service (Port 3000)
    │       ↓
    │   NestJS Container
    │       ↓
    │   S3 + DynamoDB
    │
    └── Default Rule: /* → Frontend Target Group
            ↓
        Frontend ECS Service (Port 3000)
            ↓
        Next.js Container
```

## Next Steps

1. ✅ Both frontend and backend deployed
2. ⏭️ Test all features end-to-end
3. ⏭️ Add custom domain (optional)
4. ⏭️ Add HTTPS with ACM certificate (optional)
5. ⏭️ Set up CI/CD pipeline (optional)

## Quick Reference

**Your URLs:**
- Frontend: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com/`
- Backend: `http://tcg-marketplace-dev-alb-911708205.ap-southeast-1.elb.amazonaws.com/api`

**ECR Repositories:**
- Backend: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-backend`
- Frontend: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-frontend`

**ECS Services:**
- Cluster: `tcg-marketplace-dev-cluster`
- Backend Service: `tcg-marketplace-dev-backend`
- Frontend Service: `tcg-marketplace-dev-frontend`
