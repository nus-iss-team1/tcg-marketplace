# Frontend Tests

This directory contains all tests for the TCG Marketplace frontend application.

## Documentation Overview

- **[README.md](./README.md)** - This file (detailed testing guide)
- **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)** - Complete testing strategy, workflows, and success metrics
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start guide
- **[BROWSER_TESTING.md](./BROWSER_TESTING.md)** - Manual browser testing checklist (300+ test cases)

## Test Types

### Integration Tests (Frontend-Backend)
- **Purpose**: Validate that the frontend correctly communicates with the backend API
- **Scope**: End-to-end flow from browser to backend services
- **File**: `integration-e2e.ps1`
- **Automation**: Fully automated PowerShell script

### Manual Browser Tests
- **Purpose**: Visual and functional testing in real browsers
- **Scope**: UI/UX, responsive design, accessibility, user interactions, cross-browser compatibility
- **Checklist**: `BROWSER_TESTING.md`
- **Coverage**: 300+ test cases across 12 categories including responsive design, performance, accessibility, and security

## Running Integration Tests

### Prerequisites

1. **Backend must be running** on port 3000:
   ```powershell
   cd tcg-marketplace/backend
   npm run start:dev
   ```

2. **Frontend must be running** on port 3001:
   ```powershell
   cd tcg-marketplace/frontend
   npm run dev
   ```

3. **AWS resources deployed** (S3 + DynamoDB):
   - S3 bucket configured
   - DynamoDB table created
   - Backend `.env.local` configured

### Run Tests

```powershell
# Option 1: Using npm script (recommended)
cd tcg-marketplace/frontend
npm run test:e2e

# Option 2: Direct script execution
cd tcg-marketplace/frontend/test
.\integration-e2e.ps1
```

### Custom URLs

```powershell
.\integration-e2e.ps1 -BackendUrl "http://localhost:3000" -FrontendUrl "http://localhost:3001"
```

## What Gets Tested

### Suite 1: Backend Availability
- ✅ Backend health check endpoint responds
- ✅ Backend is accessible from frontend

### Suite 2: Frontend Availability
- ✅ Frontend server is running
- ✅ Frontend pages load successfully

### Suite 3: CORS Configuration
- ✅ Backend allows frontend origin
- ✅ Preflight requests work correctly
- ✅ Required headers are present

### Suite 4: Listings API Integration
- ✅ Frontend can fetch listings from backend
- ✅ Query parameters work (category, limit)
- ✅ Response format matches expected schema
- ✅ Array of listings returned

### Suite 5: Create Listing Integration
- ✅ Frontend can create new listings
- ✅ POST request with JSON body works
- ✅ Backend returns created listing with ID
- ✅ Price and category are correctly saved

### Suite 6: Media Upload Integration
- ✅ Frontend can request presigned URLs
- ✅ Backend generates valid S3 presigned URLs
- ✅ Response includes uploadUrl, key, expiresIn

### Suite 7: Image Upload Flow
- ✅ Images can be uploaded to S3 via presigned URL
- ✅ PUT request to S3 succeeds
- ✅ File is stored in correct S3 path

### Suite 8: Verify Created Listing
- ✅ Created listing appears in query results
- ✅ Data integrity maintained (price, title, category)

## Test Output Example

```
🧪 TCG Marketplace Frontend-Backend Integration Tests
Backend URL: http://localhost:3000
Frontend URL: http://localhost:3001

═══════════════════════════════════════════════════════
Test Suite 1: Backend Availability
═══════════════════════════════════════════════════════

▶ Test: Backend Health Check
✓ PASSED: Backend Health Check
  Status: ok
  StatusCode: 200

═══════════════════════════════════════════════════════
Test Suite 2: Frontend Availability
═══════════════════════════════════════════════════════

▶ Test: Frontend Availability
✓ PASSED: Frontend Availability
  StatusCode: 200
  ContentLength: 15234 bytes

═══════════════════════════════════════════════════════
Test Suite 3: CORS Configuration
═══════════════════════════════════════════════════════

▶ Test: CORS Configuration
✓ PASSED: CORS Configuration
  AllowOrigin: http://localhost:3001
  AllowMethods: GET,HEAD,PUT,PATCH,POST,DELETE

═══════════════════════════════════════════════════════
Test Summary
═══════════════════════════════════════════════════════

Total Tests: 8
Passed: 8
Failed: 0

🎉 All tests passed!

Frontend-Backend Integration Status: ✓ WORKING
```

## Troubleshooting

### Backend Not Running

**Error**: `Unable to connect to the remote server`

**Solution**:
```powershell
cd tcg-marketplace/backend
npm run start:dev
```

Wait for: `🚀 TCG Marketplace Backend running on port 3000`

### Frontend Not Running

**Error**: `Unable to connect to the remote server` (for frontend URL)

**Solution**:
```powershell
cd tcg-marketplace/frontend
npm run dev
```

Wait for: `✓ Ready on http://localhost:3001`

### CORS Errors

**Error**: `Frontend origin not allowed`

**Solution**: Check backend `.env.local`:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

Restart backend after changing environment variables.

### API Endpoint Not Found

**Error**: `404 Not Found`

**Solution**: Verify backend routes are registered:
```powershell
# Check backend logs for route mappings
# Should see: Mapped {/listings, GET} route
# Should see: Mapped {/listings, POST} route
# Should see: Mapped {/media/presign, POST} route
```

### Presigned URL Generation Fails

**Error**: `Failed to generate presigned URL`

**Solution**: 
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify S3 bucket exists: `aws s3 ls`
3. Check backend `.env.local` has correct `BUCKET_NAME`

### Image Upload Fails

**Error**: `Access Denied` or `403 Forbidden`

**Solution**:
1. Verify presigned URL hasn't expired (default: 1 hour)
2. Check S3 bucket CORS configuration
3. Ensure Content-Type matches presigned URL parameters

### Created Listing Not Found

**Error**: `Created listing not found in query results`

**Solution**:
1. Check DynamoDB table has GSI1 index
2. Verify category matches query parameter
3. Check DynamoDB item was actually created:
   ```powershell
   aws dynamodb scan --table-name tcg-marketplace-dev-data --max-items 5
   ```

## Manual Browser Testing

For comprehensive UI testing, see [BROWSER_TESTING.md](./BROWSER_TESTING.md).

The browser testing checklist covers:
- **Home Page**: Layout, listings grid, error handling, navigation
- **Sell Page**: Form validation, image upload, submission flows
- **Responsive Design**: Desktop, tablet, and mobile layouts
- **Performance**: Page load times, API response times, network conditions
- **Accessibility**: Keyboard navigation, screen readers, WCAG compliance
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge
- **Integration**: Backend communication, S3 uploads, DynamoDB queries
- **Security**: Input validation, CORS, data privacy
- **User Experience**: First-time users, error recovery, edge cases

### Quick Manual Test

1. Open http://localhost:3001
2. Navigate to "Sell" page
3. Fill out the form:
   - Title: "Test Card"
   - Description: "Test description"
   - Price: 100
   - Category: Vintage
4. Click "Create Listing"
5. Verify success message appears
6. Go back to home page
7. Verify new listing appears in grid

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Start Backend
  run: |
    cd tcg-marketplace/backend
    npm run start:dev &
    sleep 10

- name: Start Frontend
  run: |
    cd tcg-marketplace/frontend
    npm run dev &
    sleep 10

- name: Run Integration Tests
  run: |
    cd tcg-marketplace/frontend/test
    .\integration-e2e.ps1
```

## Test Data Cleanup

The integration tests create test listings in DynamoDB. To clean up:

```powershell
# List test listings
aws dynamodb scan --table-name tcg-marketplace-dev-data --filter-expression "contains(title, :test)" --expression-attribute-values '{":test":{"S":"Integration Test"}}'

# Delete specific item
aws dynamodb delete-item --table-name tcg-marketplace-dev-data --key '{"PK":{"S":"LISTING#<id>"},"SK":{"S":"METADATA"}}'
```

## Best Practices

1. **Run tests before committing** - Ensure frontend-backend integration works
2. **Test with real AWS resources** - Don't mock S3/DynamoDB in integration tests
3. **Check CORS configuration** - Common source of frontend-backend issues
4. **Verify environment variables** - Both frontend and backend need correct config
5. **Test error scenarios** - Not just happy path
6. **Keep test data minimal** - Clean up after tests when possible

## Future Enhancements

- [ ] Add Playwright/Cypress for automated browser testing
- [ ] Test authentication flows (when Cognito is integrated)
- [ ] Test image upload with actual files
- [ ] Test error handling and edge cases
- [ ] Add performance testing (response times)
- [ ] Test mobile responsive design
- [ ] Add accessibility testing

## Additional Resources

For a complete overview of the frontend testing strategy including:
- Testing workflows (daily development, before committing, before deploying)
- Success metrics and thresholds
- Common issues and troubleshooting
- Test data management
- CI/CD integration examples
- Reporting guidelines

See [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) for the comprehensive testing strategy guide.
