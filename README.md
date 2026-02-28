# TCG Marketplace

A full-stack trading card marketplace built with Next.js, NestJS, and AWS.

## 🚀 Quick Start

**Application is live at:**
- Frontend: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/
- Backend API: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/api
- Health Check: http://tcg-marketplace-dev-alb-521671472.ap-southeast-1.elb.amazonaws.com/api/health

## 📋 Current Status

✅ **Fully Deployed and Operational**
- Backend API serving requests
- Frontend connected to backend
- DynamoDB storing listings
- S3 ready for image uploads
- CORS configured correctly

See [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) for detailed status (✅ Fully Operational).

## 🏗️ Architecture

```
Browser
  ↓
Application Load Balancer
  ├── /          → Frontend (Next.js on ECS Fargate)
  └── /api/*     → Backend (NestJS on ECS Fargate)
                      ↓
                   DynamoDB + S3
```

- **Frontend**: Next.js 15.0.3 + React 18.3.1 + Tailwind CSS
- **Backend**: NestJS 10 + TypeScript
- **Database**: DynamoDB (NoSQL)
- **Storage**: S3 (images)
- **Hosting**: AWS ECS Fargate
- **Load Balancer**: Application Load Balancer with path-based routing

## 📁 Project Structure

```
tcg-marketplace/
├── frontend/          # Next.js React application
├── backend/           # NestJS API server
├── infra/             # AWS CloudFormation templates
│   ├── base.yml       # VPC and networking
│   ├── storage.yml    # S3 and DynamoDB
│   ├── compute-fullstack.yml  # ECS services (backend + frontend)
│   └── deploy-automated.ps1   # Automated deployment script
└── README.md
```

## 🚢 Deployment

### Automated Deployment (Recommended)

```powershell
cd tcg-marketplace/infra
./deploy-automated.ps1 -Environment dev
```

This will:
1. Build Docker images for backend and frontend
2. Push images to ECR
3. Deploy all CloudFormation stacks
4. Output the application URL

### Manual Deployment

See [infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md) for step-by-step instructions.

## 💻 Local Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3001

## 🔧 Configuration

### Backend Environment Variables

```bash
NODE_ENV=development
PORT=3000
AWS_REGION=ap-southeast-1
TABLE_NAME=tcg-marketplace-dev-data
BUCKET_NAME=tcg-marketplace-dev-storage-274603886128
```

### Frontend Environment Variables

```bash
NODE_ENV=development
PORT=3000
```

The frontend uses relative URLs (`/api`) for all API calls, which works seamlessly when deployed behind the same ALB as the backend. No API URL configuration needed.

## 📊 Features

- ✅ Browse trading card listings
- ✅ Create new listings
- ✅ Filter by category
- ✅ Responsive design
- ⏳ Image upload to S3 (in progress)
- ⏳ User authentication with Cognito (optional)

## 🧪 Testing

### Backend

```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
```

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
```

## 💰 Cost Estimate

**Monthly AWS costs (development):**
- Application Load Balancer: ~$16/month
- ECS Fargate (2 tasks): ~$16/month
- S3 + DynamoDB: ~$1-5/month
- **Total**: ~$33-37/month

**Cost savings:**
- No NAT Gateway: $32/month saved
- No API Gateway: $3.50/million requests saved
- Public subnets only: Simplified architecture

## 📚 Documentation

- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Current deployment status (✅ Fully Operational)
- [infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md) - Deployment guide
- [infra/MANUAL_DEPLOYMENT_GUIDE.md](./infra/MANUAL_DEPLOYMENT_GUIDE.md) - Manual deployment steps
- [infra/QUICK_REFERENCE.md](./infra/QUICK_REFERENCE.md) - Command cheat sheet
- [backend/README.md](./backend/README.md) - Backend documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## 🛠️ Tech Stack

### Frontend
- Next.js 15.0.3
- React 18.3.1
- TypeScript 5+
- Tailwind CSS 3.4
- Lucide React (icons)

### Backend
- NestJS 10+
- TypeScript 5+
- AWS SDK v3
- class-validator
- uuid

### Infrastructure
- AWS ECS Fargate
- Application Load Balancer
- DynamoDB
- S3
- CloudWatch
- ECR (Docker registry)

## 🔐 Security

- IAM roles for ECS tasks (least privilege)
- Security groups restrict traffic
- CORS configured for same-origin requests
- Environment variables for sensitive data
- No hardcoded credentials

## 🐛 Troubleshooting

### "Failed to fetch" error in browser
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check browser console for errors

### ECS tasks not starting
- Check CloudWatch logs: `/ecs/tcg-marketplace-dev-backend` and `/ecs/tcg-marketplace-dev-frontend`
- Verify environment variables are set
- Check ECR image exists

### Health checks failing
- Verify backend responds at `/api/health`
- Check security groups allow traffic
- Review ECS task logs

See [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) for more troubleshooting tips.

## 📝 License

This project is for educational purposes.

## 👥 Contributors

Built as a demonstration of modern full-stack development with AWS.
