This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

For a complete setup guide, see **[../DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)**.

### Quick Start

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

For a complete setup guide including backend configuration, see **[../DEVELOPER_SETUP.md](../DEVELOPER_SETUP.md)**.

For comprehensive frontend-backend integration testing, see [test/README.md](./test/README.md).

For a complete overview of the frontend testing strategy including workflows, success metrics, and CI/CD integration, see [test/TESTING_SUMMARY.md](./test/TESTING_SUMMARY.md).

For manual browser testing including UI/UX, accessibility, and cross-browser compatibility, see [test/BROWSER_TESTING.md](./test/BROWSER_TESTING.md).

### Quick Integration Test

```powershell
# Prerequisites: Backend running on port 3000, Frontend on port 3001

# Option 1: Using npm script (recommended)
npm run test:e2e

# Option 2: Direct script execution
cd test
.\integration-e2e.ps1
```

The automated test suite validates:
- Backend and frontend availability
- CORS configuration
- API endpoint integration
- Complete image upload flow
- Data integrity

### Manual Browser Testing

The [BROWSER_TESTING.md](./test/BROWSER_TESTING.md) checklist covers 300+ test cases including:
- Home page layout and listings grid
- Sell page form validation and image upload
- Responsive design across devices
- Performance and accessibility
- Browser compatibility
- Security and user experience

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

You have two deployment options for the TCG Marketplace frontend:

**Option A: Vercel (Recommended)**
- Easiest deployment method using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
- Free tier available, global CDN, automatic HTTPS
- See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete guide (5 minutes)

**Option B: AWS ECS Fargate**
- Full control over hosting infrastructure
- Deployed alongside backend on AWS
- Uses Next.js `output: 'standalone'` mode for optimized Docker deployments (smaller images, faster startup)
- See **[../infra/FRONTEND_ECS_DEPLOYMENT.md](../infra/FRONTEND_ECS_DEPLOYMENT.md)** for complete guide (20-30 minutes)
- See **[DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)** for troubleshooting build issues

The guide covers:
- Dashboard deployment (easiest, 5 minutes)
- CLI deployment (for developers)
- Environment variable configuration
- Automatic deployments from GitHub
- Multi-branch deployments (production, preview, PR deployments)
- Branch-specific environment variables
- Branch protection and testing workflows
- Custom domain setup
- Troubleshooting and monitoring

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
