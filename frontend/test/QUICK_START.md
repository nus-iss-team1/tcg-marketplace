# Quick Start - Frontend Integration Testing

Fast guide to test frontend-backend integration in 5 minutes.

## Step 1: Start Backend (Terminal 1)

```powershell
cd tcg-marketplace/backend
npm run start:dev
```

Wait for: `🚀 TCG Marketplace Backend running on port 3000`

## Step 2: Start Frontend (Terminal 2)

```powershell
cd tcg-marketplace/frontend
npm run dev
```

Wait for: `✓ Ready on http://localhost:3001`

## Step 3: Run Integration Tests (Terminal 3)

```powershell
# Option 1: Using npm script (recommended)
cd tcg-marketplace/frontend
npm run test:e2e

# Option 2: Direct script execution
cd tcg-marketplace/frontend/test
.\integration-e2e.ps1
```

Expected output:
```
🧪 TCG Marketplace Frontend-Backend Integration Tests

✓ PASSED: Backend Health Check
✓ PASSED: Frontend Availability
✓ PASSED: CORS Configuration
✓ PASSED: Fetch Listings API
✓ PASSED: Create Listing API
✓ PASSED: Presigned URL Generation

🎉 All tests passed!
```

## Step 4: Manual Browser Test

1. Open browser: http://localhost:3001
2. Click "Sell" in navigation
3. Fill form:
   - Title: "Test Card"
   - Price: 100
   - Category: Vintage
4. Click "Create Listing"
5. See success message ✓
6. Go to home page
7. See your listing in the grid ✓

## Troubleshooting

### Backend won't start
```powershell
# Install dependencies
cd tcg-marketplace/backend
npm install

# Check .env.local exists
cat .env.local
```

### Frontend won't start
```powershell
# Install dependencies
cd tcg-marketplace/frontend
npm install

# Check .env.local exists
cat .env.local
```

### Tests fail
```powershell
# Check both servers are running
curl http://localhost:3000/health
curl http://localhost:3001

# Check AWS resources exist
aws s3 ls
aws dynamodb list-tables
```

## What's Being Tested?

1. ✅ Backend is running and healthy
2. ✅ Frontend is running and accessible
3. ✅ CORS allows frontend to call backend
4. ✅ Frontend can fetch listings from backend
5. ✅ Frontend can create new listings
6. ✅ Frontend can request S3 presigned URLs
7. ✅ Images can be uploaded to S3
8. ✅ Created listings appear in queries

## Success Criteria

All tests pass = Frontend and backend are properly integrated! 🎉

## Next Steps

- Run browser tests: See [BROWSER_TESTING.md](./BROWSER_TESTING.md)
- Deploy to AWS: See [../infra/README.md](../../infra/README.md)
- Add authentication: Integrate AWS Cognito
