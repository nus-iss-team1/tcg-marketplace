# Frontend Testing Summary

Complete overview of frontend testing strategy and available tests.

## Test Structure

```
frontend/test/
├── README.md                    # Complete testing documentation
├── QUICK_START.md              # 5-minute quick start guide
├── BROWSER_TESTING.md          # Manual browser testing checklist
├── TESTING_SUMMARY.md          # This file
├── integration-e2e.ps1         # Automated integration tests
└── test-card.jpg               # Sample image for upload tests
```

## Test Types

### 1. Automated Integration Tests
**File**: `integration-e2e.ps1`  
**Purpose**: Validate frontend-backend API communication  
**Runtime**: ~30 seconds  
**Requires**: Backend + Frontend running

**What it tests**:
- Backend health and availability
- Frontend server accessibility
- CORS configuration
- Listings API (GET)
- Create listing API (POST)
- Presigned URL generation
- Image upload to S3
- Data persistence in DynamoDB

**Run**:
```powershell
# Option 1: Using npm script (recommended)
cd tcg-marketplace/frontend
npm run test:e2e

# Option 2: Direct script execution
cd tcg-marketplace/frontend/test
.\integration-e2e.ps1
```

### 2. Manual Browser Tests
**File**: `BROWSER_TESTING.md`  
**Purpose**: Comprehensive UI/UX validation  
**Runtime**: ~30 minutes  
**Requires**: Browser + Backend + Frontend running

**What it tests**:
- Layout and design
- Responsive behavior
- Form validation
- Image upload UI
- Error handling
- Accessibility
- Browser compatibility
- Performance

**Run**: Follow checklist in `BROWSER_TESTING.md`

## Testing Workflow

### Daily Development
```powershell
# 1. Start services
cd tcg-marketplace/backend && npm run start:dev
cd tcg-marketplace/frontend && npm run dev

# 2. Run quick integration test
cd tcg-marketplace/frontend
npm run test:e2e

# 3. Manual spot check in browser
# Open http://localhost:3001
# Test one feature you're working on
```

### Before Committing
```powershell
# 1. Run full integration tests
cd tcg-marketplace/frontend
npm run test:e2e

# 2. Check for console errors
# Open browser DevTools
# Look for errors in Console tab

# 3. Test on different screen sizes
# Use browser DevTools responsive mode
# Test mobile, tablet, desktop
```

### Before Deploying
```powershell
# 1. Run all integration tests
cd tcg-marketplace/frontend
npm run test:e2e

# 2. Complete browser testing checklist
# Follow BROWSER_TESTING.md

# 3. Test with production-like data
# Use real AWS resources
# Test with multiple listings
# Test with large images

# 4. Performance check
# Run Lighthouse audit
# Check network tab for slow requests
```

## Test Coverage

### API Endpoints Tested
- ✅ `GET /health` - Backend health check
- ✅ `GET /listings?category=X&limit=Y` - Fetch listings
- ✅ `POST /listings` - Create listing
- ✅ `POST /media/presign` - Generate presigned URL
- ✅ `PUT <S3-URL>` - Upload image to S3

### Frontend Components Tested
- ✅ ListingsGrid - Fetches and displays listings
- ✅ SellForm - Creates new listings
- ✅ Header - Navigation
- ✅ Footer - Layout
- ✅ Hero - Home page banner

### User Flows Tested
- ✅ View listings on home page
- ✅ Navigate to sell page
- ✅ Fill out listing form
- ✅ Upload images
- ✅ Submit listing
- ✅ See success message
- ✅ View created listing

## Success Metrics

### Integration Tests
- **Target**: 100% pass rate
- **Current**: Run `.\integration-e2e.ps1` to check
- **Threshold**: All 8 tests must pass

### Browser Tests
- **Target**: 90%+ checklist completion
- **Current**: Manual tracking in BROWSER_TESTING.md
- **Threshold**: All critical paths must work

### Performance
- **Target**: Lighthouse score > 90
- **Page Load**: < 3 seconds
- **API Response**: < 1 second
- **Image Upload**: < 5 seconds

## Common Issues

### Issue: Integration tests fail with "Unable to connect"
**Cause**: Backend or frontend not running  
**Fix**: Start both services
```powershell
# Terminal 1
cd tcg-marketplace/backend && npm run start:dev

# Terminal 2
cd tcg-marketplace/frontend && npm run dev
```

### Issue: CORS errors in browser
**Cause**: Backend CORS not configured for frontend origin  
**Fix**: Check backend `.env.local`
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Issue: Listings don't appear
**Cause**: No data in DynamoDB or API error  
**Fix**: 
1. Check backend logs for errors
2. Create test listing via API
3. Verify DynamoDB has data

### Issue: Image upload fails
**Cause**: S3 bucket not configured or presigned URL expired  
**Fix**:
1. Verify S3 bucket exists
2. Check backend can generate presigned URLs
3. Ensure CORS configured on S3 bucket

## Test Data Management

### Creating Test Data
```powershell
# Via API
curl -X POST http://localhost:3000/listings `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Card","price":100,"category":"vintage","images":[]}'

# Via Frontend
# Use the Sell form at http://localhost:3001/sell
```

### Cleaning Test Data
```powershell
# List all listings
aws dynamodb scan --table-name tcg-marketplace-dev-data

# Delete specific listing
aws dynamodb delete-item `
  --table-name tcg-marketplace-dev-data `
  --key '{"PK":{"S":"LISTING#<id>"},"SK":{"S":"METADATA"}}'
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: |
          cd tcg-marketplace/backend
          npm install
          cd ../frontend
          npm install
      
      - name: Start Backend
        run: |
          cd tcg-marketplace/backend
          npm run start:dev &
          Start-Sleep -Seconds 10
      
      - name: Start Frontend
        run: |
          cd tcg-marketplace/frontend
          npm run dev &
          Start-Sleep -Seconds 10
      
      - name: Run Integration Tests
        run: |
          cd tcg-marketplace/frontend
          npm run test:e2e
```

## Reporting Issues

When reporting test failures, include:

1. **Test Type**: Integration or Browser
2. **Test Name**: Which specific test failed
3. **Error Message**: Full error output
4. **Environment**:
   - OS: Windows/Mac/Linux
   - Browser: Chrome/Firefox/Safari/Edge
   - Node version: `node --version`
   - Backend running: Yes/No
   - Frontend running: Yes/No
5. **Steps to Reproduce**:
   - What you did
   - What you expected
   - What actually happened
6. **Screenshots**: If UI issue
7. **Console Logs**: Browser DevTools console
8. **Network Tab**: Failed requests

## Future Enhancements

### Planned
- [ ] Add Playwright for automated browser testing
- [ ] Add visual regression testing
- [ ] Add performance benchmarks
- [ ] Add accessibility automated tests
- [ ] Add API contract testing
- [ ] Add load testing

### Under Consideration
- [ ] Add unit tests for React components
- [ ] Add Storybook for component documentation
- [ ] Add E2E tests with authentication
- [ ] Add mobile app testing (if mobile app is built)

## Resources

- **Frontend README**: [../README.md](../README.md)
- **Backend Testing**: [../../backend/test/README.md](../../backend/test/README.md)
- **Infrastructure**: [../../infra/README.md](../../infra/README.md)
- **Root Testing Guide**: [../../LOCAL_TESTING_GUIDE.md](../../LOCAL_TESTING_GUIDE.md)

## Quick Links

- **Run Integration Tests**: `npm run test:e2e` (from frontend directory)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Browser Checklist**: [BROWSER_TESTING.md](./BROWSER_TESTING.md)
- **Full Documentation**: [README.md](./README.md)
