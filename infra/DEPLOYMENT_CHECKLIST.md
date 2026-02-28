# Deployment Checklist - Critical Items to Verify

This checklist ensures you won't face the "Failed to fetch" and localhost issues we just resolved.

## ✅ Pre-Deployment Verification

### 1. Frontend Configuration (CRITICAL)

**File: `frontend/next.config.ts`**

✅ **VERIFIED**: No hardcoded `NEXT_PUBLIC_API_URL` in the config
- The `env` section that was setting `http://localhost:3000` has been REMOVED
- Components use fallback: `process.env.NEXT_PUBLIC_API_URL || '/api'`
- This ensures relative `/api` path works with ALB routing

**Files to check:**
- `frontend/src/components/ListingsGrid.tsx` - Line 24: `const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'`
- `frontend/src/components/SellForm.tsx` - Line 56: `const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'`

### 2. Backend Configuration (CRITICAL)

**File: `backend/src/main.ts`**

✅ **VERIFIED**: Global API prefix is set
- Line 8: `app.setGlobalPrefix('api')` - This makes all backend routes start with `/api`
- Backend listens on port 3000
- Health check available at `/api/health`

### 3. Docker Build Configuration (CRITICAL)

**File: `.dockerignore`**

✅ **VERIFIED**: Excludes `.env.local` files
- Prevents local environment files from being baked into Docker images
- Pattern: `**/.env.local` and `**/.env*.local`

**File: `frontend/Dockerfile`**

✅ **VERIFIED**: Build argument for cache invalidation
- Line 5-6: `ARG BUILD_ID` forces Docker to rebuild when needed
- Uses standalone output for production deployment

### 4. Infrastructure Configuration (CRITICAL)

**File: `infra/compute-fullstack.yml`**

✅ **VERIFIED**: Path-based routing configured correctly
- Line 115-125: Backend listener rule routes `/api/*` to backend target group
- Line 108-112: Default action routes `/` to frontend target group
- Backend health check: `/api/health` (Line 48)
- Frontend health check: `/` (Line 68)

**File: `infra/parameters/dev-fullstack.json`**

⚠️ **ACTION REQUIRED**: Update account ID before deployment
```json
{
  "Parameters": {
    "Environment": "dev",
    "ProjectName": "tcg-marketplace",
    "BackendImageUri": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest",
    "FrontendImageUri": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest"
  }
}
```

---

## 🔍 What Was Fixed (Don't Repeat These Mistakes)

### Problem 1: Hardcoded localhost in next.config.ts
**Before (WRONG):**
```typescript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}
```

**After (CORRECT):**
```typescript
// Removed the env section entirely
// Components use: process.env.NEXT_PUBLIC_API_URL || '/api'
```

### Problem 2: .env.local files in Docker images
**Before (WRONG):**
- `.env.local` files were being included in Docker builds
- This overrode the correct `/api` configuration

**After (CORRECT):**
- `.dockerignore` excludes all `.env.local` files
- Docker images use environment variables from ECS task definition

### Problem 3: Docker cache not invalidating
**Before (WRONG):**
- Docker was using cached layers with old configuration
- Rebuilds didn't pick up changes

**After (CORRECT):**
- Added `BUILD_ID` argument to force cache invalidation
- Use `docker builder prune -af` before critical rebuilds

---

## 🚀 Deployment Steps (Safe Order)

### Step 1: Update Parameters
```powershell
cd tcg-marketplace/infra
# Edit parameters/dev-fullstack.json
# Replace YOUR_ACCOUNT_ID with actual AWS account ID
```

### Step 2: Deploy Infrastructure
```powershell
# Base stack (VPC, subnets, security groups)
aws cloudformation create-stack \
  --stack-name tcg-marketplace-dev-base \
  --template-body file://base.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region ap-southeast-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name tcg-marketplace-dev-base \
  --region ap-southeast-1

# Storage stack (S3, DynamoDB, IAM roles)
aws cloudformation create-stack \
  --stack-name tcg-marketplace-dev-storage \
  --template-body file://storage.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name tcg-marketplace-dev-storage \
  --region ap-southeast-1

# Create ECR repositories
aws ecr create-repository \
  --repository-name tcg-marketplace-dev-backend \
  --region ap-southeast-1

aws ecr create-repository \
  --repository-name tcg-marketplace-dev-frontend \
  --region ap-southeast-1
```

### Step 3: Build and Push Docker Images
```powershell
cd tcg-marketplace

# IMPORTANT: Clear Docker cache first
docker builder prune -af

# Build backend
docker build -t tcg-marketplace-dev-backend:latest -f backend/Dockerfile .

# Build frontend with BUILD_ID to force fresh build
docker build \
  --build-arg BUILD_ID=$(Get-Date -Format "yyyyMMddHHmmss") \
  -t tcg-marketplace-dev-frontend:latest \
  -f frontend/Dockerfile .

# Tag for ECR (replace YOUR_ACCOUNT_ID)
docker tag tcg-marketplace-dev-backend:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest

docker tag tcg-marketplace-dev-frontend:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest

# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Push images
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest
```

### Step 4: Deploy Compute Stack
```powershell
cd tcg-marketplace/infra

# Deploy compute stack (ECS, ALB, services)
aws cloudformation create-stack \
  --stack-name tcg-marketplace-dev-compute \
  --template-body file://compute-fullstack.yml \
  --parameters file://parameters/dev-fullstack.json \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1

# Wait for completion (5-7 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name tcg-marketplace-dev-compute \
  --region ap-southeast-1

# Get ALB URL
aws cloudformation describe-stacks \
  --stack-name tcg-marketplace-dev-compute \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
  --output text \
  --region ap-southeast-1
```

---

## ✅ Post-Deployment Verification

### 1. Check Backend Health
```powershell
# Replace with your ALB DNS
$ALB_DNS = "tcg-marketplace-dev-alb-XXXXXXXXX.ap-southeast-1.elb.amazonaws.com"

# Test backend health
curl "http://$ALB_DNS/api/health"
```

**Expected response:**
```json
{"status":"ok","timestamp":"2024-XX-XXTXX:XX:XX.XXXZ"}
```

### 2. Check Frontend
Open browser: `http://YOUR_ALB_DNS/`

**Expected:**
- Homepage loads with "Featured Trading Cards" section
- No console errors about "Failed to fetch"
- No requests to `localhost:3000`

### 3. Test Full End-to-End Flow

**Create a listing:**
1. Click "Sell Card" button
2. Fill form:
   - Title: "Test Card"
   - Description: "Test listing"
   - Price: 100
   - Category: Vintage
3. Click "Create Listing"
4. Should see success message

**Verify listing appears:**
1. Go back to homepage
2. Refresh page
3. New listing should appear in "Featured Trading Cards"

### 4. Check Browser Console
Open browser DevTools (F12) → Console tab

**Should NOT see:**
- ❌ `GET http://localhost:3000/api/listings` (WRONG - hardcoded localhost)
- ❌ `Failed to fetch` errors

**Should see:**
- ✅ `API URL: /api` (console log from components)
- ✅ `GET http://YOUR_ALB_DNS/api/listings` (correct relative path)

---

## 🔧 Troubleshooting

### Issue: Frontend still calling localhost

**Diagnosis:**
```powershell
# Check if .env.local exists (it shouldn't)
Get-ChildItem -Path frontend -Filter ".env.local" -Recurse

# Check Docker image environment
docker run --rm tcg-marketplace-dev-frontend:latest env | grep API
```

**Solution:**
1. Delete any `.env.local` files
2. Clear Docker cache: `docker builder prune -af`
3. Rebuild with BUILD_ID: `docker build --build-arg BUILD_ID=$(Get-Date -Format "yyyyMMddHHmmss") ...`

### Issue: Backend returns 404 for /api/health

**Diagnosis:**
```powershell
# Check backend logs
aws logs tail /ecs/tcg-marketplace-dev-backend --follow --region ap-southeast-1
```

**Solution:**
- Verify `app.setGlobalPrefix('api')` is in `backend/src/main.ts`
- Rebuild backend image
- Update ECS service to use new image

### Issue: ALB returns 503 Service Unavailable

**Diagnosis:**
```powershell
# Check ECS service status
aws ecs describe-services \
  --cluster tcg-marketplace-dev-cluster \
  --services tcg-marketplace-dev-backend tcg-marketplace-dev-frontend \
  --region ap-southeast-1
```

**Solution:**
- Wait 2-3 minutes for ECS tasks to become healthy
- Check target group health in AWS Console
- Verify security groups allow traffic

---

## 📋 Final Checklist Before Going Live

- [ ] Updated `infra/parameters/dev-fullstack.json` with correct account ID
- [ ] Verified `frontend/next.config.ts` has NO hardcoded localhost
- [ ] Verified `backend/src/main.ts` has `app.setGlobalPrefix('api')`
- [ ] Verified `.dockerignore` excludes `.env.local` files
- [ ] Cleared Docker cache before building images
- [ ] Built frontend with BUILD_ID argument
- [ ] Pushed both images to ECR
- [ ] Deployed all CloudFormation stacks in order
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without console errors
- [ ] Can create listing via Sell Card form
- [ ] New listing appears on homepage
- [ ] Browser console shows `/api` (not `localhost:3000`)

---

## 🎯 Key Takeaways

1. **Never hardcode localhost** in production configuration files
2. **Always use relative paths** (`/api`) for ALB path-based routing
3. **Exclude .env files** from Docker images via `.dockerignore`
4. **Clear Docker cache** when making critical configuration changes
5. **Use BUILD_ID** argument to force Docker cache invalidation
6. **Verify in browser console** that API calls use correct URLs
7. **Test end-to-end** before considering deployment complete

---

## 📞 Support

If you encounter issues:
1. Check this checklist first
2. Review `DEPLOYMENT_GUIDE.md` for detailed steps
3. Check CloudFormation events for infrastructure errors
4. Check ECS logs for application errors
5. Verify browser console for frontend errors
