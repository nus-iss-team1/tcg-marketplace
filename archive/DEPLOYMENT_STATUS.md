# TCG Marketplace - Deployment Status

**Last Updated**: February 28, 2026  
**Environment**: Development (dev)  
**Region**: ap-southeast-1

## Current Deployment Status

✅ **FULLY OPERATIONAL**

### Infrastructure

| Component | Status | Details |
|-----------|--------|---------|
| VPC & Networking | ✅ Deployed | Public subnets, security groups configured |
| S3 Bucket | ✅ Deployed | `tcg-marketplace-dev-storage-274603886128` |
| DynamoDB Table | ✅ Deployed | `tcg-marketplace-dev-data` |
| Application Load Balancer | ✅ Deployed | `tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com` |
| ECS Cluster | ✅ Deployed | `tcg-marketplace-dev-cluster` |

### Services

| Service | Status | Container | Health Check |
|---------|--------|-----------|--------------|
| Backend API | ✅ Running | NestJS on port 3000 | `/api/health` |
| Frontend Web | ✅ Running | Next.js on port 3000 | `/` |

### Application URLs

- **Frontend**: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/
- **Backend API**: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/api
- **Health Check**: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/api/health

### Routing Configuration

The ALB uses path-based routing:
- `/` → Frontend (Next.js React app)
- `/api/*` → Backend (NestJS API)

## Recent Fixes Applied

### Frontend
- ✅ Downgraded to Next.js 15.0.3 and React 18.3.1 (React 19 compatibility)
- ✅ Removed all `export const dynamic = 'force-dynamic'` statements
- ✅ Updated API calls to use relative URLs (`/api`)
- ✅ Removed `NEXT_PUBLIC_API_URL` from next.config.ts (uses relative URLs only)
- ✅ Created custom error and not-found pages

### Backend
- ✅ Added `/api` global prefix for path-based routing
- ✅ Fixed CORS configuration to allow all origins
- ✅ Environment variables properly configured (TABLE_NAME, BUCKET_NAME, AWS_REGION)

### Infrastructure
- ✅ Removed container health checks (using ALB health checks only)
- ✅ Updated health check paths to `/api/health`
- ✅ Simplified frontend configuration (no environment variables needed, uses relative URLs)

## Docker Images

### Backend
- **Repository**: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend`
- **Tag**: `latest`
- **Digest**: `sha256:824cfd09347a66a54eef54b773c966355daa1b62fcc8c2c17ff754b90c24a9d8`

### Frontend
- **Repository**: `274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend`
- **Tag**: `latest`
- **Digest**: `sha256:661fa850ae8225369134e49104529a73384ec4ffd95608c90d9bbca8342bb439`

## Deployment Commands

### Full Deployment (Automated)
```powershell
cd tcg-marketplace/infra
./deploy-automated.ps1 -Environment dev
```

### Update Frontend Only
```powershell
# Rebuild and push
cd tcg-marketplace
docker build -t tcg-marketplace-frontend:latest -f frontend/Dockerfile .
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com
docker tag tcg-marketplace-frontend:latest 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest
docker push 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-frontend:latest

# Force new deployment
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-frontend --force-new-deployment --region ap-southeast-1
```

### Update Backend Only
```powershell
# Rebuild and push
cd tcg-marketplace/backend
docker build -t tcg-marketplace-backend:latest -f Dockerfile .
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com
docker tag tcg-marketplace-backend:latest 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest
docker push 274603886128.dkr.ecr.ap-southeast-1.amazonaws.com/tcg-marketplace-dev-backend:latest

# Force new deployment
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --force-new-deployment --region ap-southeast-1
```

## Cost Management

### Scale Down (Save Costs)
```powershell
# Stop both services
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 0 --region ap-southeast-1
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-frontend --desired-count 0 --region ap-southeast-1
```

### Scale Up (Resume)
```powershell
# Start both services
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-backend --desired-count 1 --region ap-southeast-1
aws ecs update-service --cluster tcg-marketplace-dev-cluster --service tcg-marketplace-dev-frontend --desired-count 1 --region ap-southeast-1
```

## Known Issues & Solutions

### Issue: "Failed to fetch" error in browser
**Solution**: Hard refresh browser (Ctrl+Shift+R) to clear cached JavaScript

### Issue: Container health checks failing
**Solution**: Removed container health checks, using ALB health checks only

### Issue: CORS errors
**Solution**: Backend configured with `origin: true` to allow all origins

## Next Steps

### Optional Enhancements
1. Deploy authentication stack (`auth.yml`) for user login
2. Add auto-scaling policies for high traffic
3. Set up CloudWatch dashboards for monitoring
4. Configure custom domain name
5. Add HTTPS with ACM certificate

### Testing
- ✅ Backend health check working
- ✅ Frontend loads successfully
- ✅ Listings API returns data from DynamoDB
- ⏳ Create listing functionality (test via Sell page)
- ⏳ Image upload to S3 (requires presigned URLs)

## Support

For issues or questions:
1. Check CloudWatch logs for backend/frontend containers
2. Verify ECS service status in AWS Console
3. Test API endpoints directly using curl/Postman
4. Review this document for common solutions
