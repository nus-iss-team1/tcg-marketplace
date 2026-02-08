# tcg-marketplace

A full-stack web application designed for the trading card game market. This project serves as a technical implementation of a React-based frontend and a Next.js backend, integrated with AWS cloud services for data and asset management.

## 🛠 Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Backend

- [NestJS](https://nestjs.com/) - Node.js framework
- [TypeScript](https://www.typescriptlang.org/)
- [JWT](https://jwt.io/) for authentication

### Cloud Infrastructure
- [AWS ECS Fargate](https://aws.amazon.com/fargate/) - Containerized backend deployment
- [AWS Application Load Balancer](https://aws.amazon.com/elasticloadbalancing/) - Load balancing and HTTPS termination
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL database for listings
- [AWS S3](https://aws.amazon.com/s3/) - File storage for card images with presigned URLs
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/) - Infrastructure as Code
- [AWS Cognito](https://aws.amazon.com/cognito/) - User authentication (optional)

**Architecture:**
- **Simplified Design**: ECS Fargate with public IP + Application Load Balancer
- **Cost**: ~$25-35/month for development/small-scale production
- **Deployment Guide**: [infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md)
- **Template Review**: [INFRASTRUCTURE_REVIEW.md](./INFRASTRUCTURE_REVIEW.md)
- **Deployment Guide**: [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)
- **Archived Complex Architecture**: The original architecture with private subnets, NAT Gateway, and API Gateway has been archived to [infra/archive/](./infra/archive/). See [infra/archive/README.md](./infra/archive/README.md) for details.

## 🔐 Authentication (Optional)

The application can be deployed with or without authentication:

**Without Authentication** (Simplified):
- All endpoints are public
- Suitable for development and testing
- Faster setup and lower cost

**With AWS Cognito** (Optional):
- User registration and login
- Role-based access control with three user groups:
  - **Admins** (Precedence 0): Full system access and content moderation
  - **Sellers** (Precedence 1): Can create and manage listings
  - **Viewers** (Precedence 2): Read-only access to browse listings
- JWT token authentication with group membership
- See [infra/auth.yml](./infra/auth.yml) for deployment

## 📦 Installation

For a complete step-by-step setup guide, see **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)**.

### Quick Install

```bash
# Clone the repository
git clone https://github.com/nus-iss-team1/tcg-marketplace.git

# Navigate into the project
cd tcg-marketplace

# Install dependencies (automatically installs all workspace dependencies)
npm install
```

## 🚀 Getting Started

New to the project? Start here:

1. **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)** - Complete setup guide (10 minutes)
2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - One-page cheat sheet for common tasks
3. **[LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)** - Validate your setup with tests
4. **[backend/DEPLOYMENT_GUIDE.md](./backend/DEPLOYMENT_GUIDE.md)** - Deploy backend to AWS ECS
5. **[infra/DEPLOYMENT_SIMPLE.md](./infra/DEPLOYMENT_SIMPLE.md)** - Deploy infrastructure to AWS
6. **[infra/archive/README.md](./infra/archive/README.md)** - Archived complex architecture (if needed)
7. **Backend/Frontend READMEs** - Component-specific documentation

### Team Onboarding

Handing off the project to team members? See **[HANDOFF_CHECKLIST.md](./HANDOFF_CHECKLIST.md)** for a comprehensive checklist covering:
- Pre-handoff verification (documentation, tests, configuration)
- 30-minute handoff meeting agenda
- Success criteria for team members
- Common issues and troubleshooting
- Support plan and resources

## 🧪 Local Testing

### Testing Documentation

The project includes comprehensive testing documentation:

- **[LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)** - Complete guide for testing locally before AWS deployment
- **[backend/test/LOCAL_TESTING.md](./backend/test/LOCAL_TESTING.md)** - Detailed backend testing guide with AWS setup and test scenarios
- **[backend/test/TESTING_CHECKLIST.md](./backend/test/TESTING_CHECKLIST.md)** - Quick reference checklist with prerequisites and validation steps
- **[frontend/test/README.md](./frontend/test/README.md)** - Frontend-backend integration testing guide with automated test scripts
- **[frontend/test/TESTING_SUMMARY.md](./frontend/test/TESTING_SUMMARY.md)** - Complete overview of frontend testing strategy, workflows, and success metrics
- **[frontend/test/BROWSER_TESTING.md](./frontend/test/BROWSER_TESTING.md)** - Comprehensive manual browser testing checklist (300+ test cases)
- **Automated test scripts**: `integration-local.ps1` (backend) and `integration-e2e.ps1` (frontend) in respective test directories

### Quick Test Workflow

```bash
# 1. Deploy storage infrastructure
cd tcg-marketplace/infra
aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-storage-simple `
  --template-body file://storage-simple.yml `
  --parameters ParameterKey=Environment,ParameterValue=dev ParameterKey=ProjectName,ParameterValue=tcg-marketplace `
  --region ap-southeast-1

# 2. Configure backend environment
cd ../backend
# Create .env.local with CloudFormation outputs (see DEVELOPER_SETUP.md)

# 3. Start backend
npm run start:dev

# 4. Run backend automated tests
cd test
.\integration-local.ps1          # Windows

# 5. Start frontend (in new terminal)
cd ../frontend
npm run dev

# 6. Run frontend-backend integration tests
npm run test:e2e

# 7. Verify health check
curl http://localhost:3000/health
```

### Test Coverage

The testing suite validates:

**Backend Integration Tests:**
- ✅ S3 presigned URL generation (PUT and GET)
- ✅ Direct S3 uploads from client
- ✅ DynamoDB listing creation and queries
- ✅ GSI-based category queries
- ✅ Health check endpoints
- ✅ AWS SDK integration and IAM permissions

**Frontend-Backend Integration Tests:**
- ✅ Backend and frontend availability
- ✅ CORS configuration
- ✅ API endpoint integration (listings, media, health)
- ✅ Complete image upload flow
- ✅ Data integrity validation

**Manual Browser Testing:**
- ✅ UI/UX validation across all pages
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Performance testing (page load, API calls)
- ✅ Accessibility compliance (WCAG AA)
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Security testing (input validation, CORS, data privacy)

For detailed test scenarios and troubleshooting, see:
- **Getting Started**: [DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)
- **Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- Backend: [backend/test/LOCAL_TESTING.md](./backend/test/LOCAL_TESTING.md)
- Frontend: [frontend/test/README.md](./frontend/test/README.md)
- Frontend Testing Strategy: [frontend/test/TESTING_SUMMARY.md](./frontend/test/TESTING_SUMMARY.md)
- Overview: [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)

## 🖥️ VS Code Configuration

This project includes recommended VS Code settings for consistent formatting, linting, and debugging.

1. Open the project in VS Code.
2. Install the recommended extensions when prompted.
3. The `.vscode/settings.json` automatically configures:
   - Auto-format on save
   - ESLint fixes
   - TypeScript version
