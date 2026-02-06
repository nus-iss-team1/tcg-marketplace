# TCG Marketplace - Local Testing Guide

Complete guide for testing the application locally before AWS deployment.

## Overview

This guide helps you validate 4 critical components locally before AWS deployment. For a complete setup guide including installation and configuration, see **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)**.

**What this guide covers:**

1. **S3 Upload** - Presigned URL generation and browser upload
2. **S3 Read** - Object retrieval via presigned URLs
3. **DynamoDB Write** - Create listing records with metadata
4. **DynamoDB Read** - Query listings by category using GSI

## Why Test Locally?

**Prove that:**
- ✅ Your application code works
- ✅ AWS SDK integration is correct
- ✅ S3 + DynamoDB logic is valid
- ✅ No IAM issues in the code itself

**Before deploying to:**
- ECS Fargate containers
- API Gateway
- Full production infrastructure

## Quick Start

**Prerequisites:** Complete the setup in [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md) first.

### 1. Deploy AWS Resources

```powershell
# Deploy simplified storage stack (S3 + DynamoDB, no VPC dependencies)
cd tcg-marketplace/infra
aws cloudformation create-stack `
  --stack-name tcg-marketplace-dev-storage-simple `
  --template-body file://storage-simple.yml `
  --parameters ParameterKey=Environment,ParameterValue=dev ParameterKey=ProjectName,ParameterValue=tcg-marketplace `
  --region ap-southeast-1
```

This creates:
- S3 bucket with CORS configuration and lifecycle policies
- DynamoDB table with GSI1 (category queries) and GSI2 (user queries)
- DynamoDB Streams for future event processing
- Optimized for local development without full infrastructure

### 2. Get Resource Names

```powershell
# Get bucket name
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text

# Get table name
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --query "Stacks[0].Outputs[?OutputKey=='TableName'].OutputValue" --output text
```

### 3. Configure Backend

Create `tcg-marketplace/backend/.env.local`:

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

AWS_REGION=ap-southeast-1
BUCKET_NAME=tcg-marketplace-dev-storage-123456789012
TABLE_NAME=tcg-marketplace-dev-data

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Start Backend

```bash
cd tcg-marketplace/backend
npm install
npm run start:dev
```

### 5. Run Tests

```powershell
# Windows
cd test
.\integration-local.ps1
```

## Test Scenarios

### Test 1: S3 Upload via Presigned URL

**What it tests:**
- Backend generates valid presigned URLs
- S3 bucket accepts uploads
- File appears in correct S3 path

**How to test:**
```bash
# 1. Generate presigned URL
curl -X POST http://localhost:3000/media/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "charizard.jpg", "contentType": "image/jpeg"}'

# 2. Upload image (use URL from response)
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-card.jpg"

# 3. Verify in S3
aws s3 ls s3://tcg-marketplace-dev-storage-xxx/temp/uploads/ --recursive
```

**Success criteria:**
- ✅ Presigned URL returned with `uploadUrl`, `key`, `expiresIn`
- ✅ Upload returns 200 OK
- ✅ File visible in S3 bucket

### Test 2: S3 Read via Presigned URL

**What it tests:**
- Backend generates GET presigned URLs
- URLs allow browser access to private objects

**How to test:**
```bash
# Generate GET URL (use key from Test 1)
curl "http://localhost:3000/media/presign?key=temp/uploads/2026-02-06/uuid.jpg&operation=GET"

# Open returned URL in browser
```

**Success criteria:**
- ✅ GET presigned URL returned
- ✅ Image displays in browser
- ✅ URL expires after configured time

### Test 3: DynamoDB Write

**What it tests:**
- Listing creation with correct schema
- GSI attributes are set properly
- Timestamps are generated

**How to test:**
```bash
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Black Lotus - Alpha",
    "description": "Near mint condition",
    "price": 15000,
    "category": "vintage",
    "images": ["temp/uploads/2026-02-06/uuid.jpg"]
  }'
```

**Success criteria:**
- ✅ Listing created with UUID
- ✅ Response includes all fields (PK, SK, GSI1PK, GSI1SK, etc.)
- ✅ Timestamps are ISO 8601 format
- ✅ Item visible in DynamoDB table

### Test 4: DynamoDB Read

**What it tests:**
- GSI queries work correctly
- Category filtering returns results
- Listings are sorted by date

**How to test:**
```bash
# Query by category
curl "http://localhost:3000/listings?category=vintage&limit=10"

# Verify in DynamoDB
aws dynamodb query \
  --table-name tcg-marketplace-dev-data \
  --index-name GSI1 \
  --key-condition-expression "GSI1PK = :category" \
  --expression-attribute-values '{":category": {"S": "CATEGORY#vintage"}}'
```

**Success criteria:**
- ✅ Array of listings returned
- ✅ Listings match category filter
- ✅ Results sorted by date (newest first)
- ✅ Test listing from Test 3 appears in results

## Full Integration Test

Test the complete workflow:

```bash
# 1. Generate presigned URL
PRESIGN=$(curl -s -X POST http://localhost:3000/media/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "contentType": "image/jpeg"}')

# 2. Extract values
UPLOAD_URL=$(echo $PRESIGN | jq -r '.uploadUrl')
IMAGE_KEY=$(echo $PRESIGN | jq -r '.key')

# 3. Upload image
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-card.jpg"

# 4. Create listing
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Card\",
    \"price\": 100,
    \"category\": \"vintage\",
    \"images\": [\"$IMAGE_KEY\"]
  }"

# 5. Query listings
curl "http://localhost:3000/listings?category=vintage"
```

## Automated Tests

The test script validates all 4 scenarios automatically:

```powershell
cd tcg-marketplace/backend/test
.\integration-local.ps1
```

**Test output:**
```
🧪 TCG Marketplace Local Integration Tests
Backend URL: http://localhost:3000

▶ Test: Health Check
  Status: ok
✓ PASSED: Health Check

▶ Test: S3 Presigned URL Generation
  Upload URL: https://tcg-marketplace-dev-storage-xxx.s3...
  Key: temp/uploads/2026-02-06/uuid.jpg
  Expires In: 3600s
✓ PASSED: S3 Presigned URL Generation

▶ Test: S3 Image Upload
  Uploaded to: temp/uploads/2026-02-06/uuid.jpg
✓ PASSED: S3 Image Upload

▶ Test: DynamoDB Create Listing
  Listing ID: abc-123-def
  Title: Test Card - 14:30:45
  Price: $100
  Category: vintage
✓ PASSED: DynamoDB Create Listing

▶ Test: DynamoDB Query Listings by Category
  Found 3 listing(s)
  ✓ Test listing found in query results
✓ PASSED: DynamoDB Query Listings by Category

▶ Test: S3 Object Verification
  Checking S3 object: s3://bucket/temp/uploads/2026-02-06/uuid.jpg
  ✓ Object exists in S3
✓ PASSED: S3 Object Verification

═══════════════════════════════════════════════════════
Test Summary
═══════════════════════════════════════════════════════
Total Tests: 6
Passed: 6
Failed: 0

🎉 All tests passed!
```

## Troubleshooting

### Backend won't start

**Error:** `BUCKET_NAME environment variable is required`

**Solution:**
```bash
# Verify .env.local exists and has correct values
cat backend/.env.local

# Get values from CloudFormation
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple
```

### S3 upload fails

**Error:** `AccessDenied`

**Solution:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://tcg-marketplace-dev-storage-xxx/

# Verify IAM permissions include s3:PutObject
```

### DynamoDB query returns empty

**Error:** No listings returned

**Solution:**
```bash
# Verify table exists
aws dynamodb describe-table --table-name tcg-marketplace-dev-data

# Check if GSI1 index exists
aws dynamodb describe-table --table-name tcg-marketplace-dev-data \
  --query "Table.GlobalSecondaryIndexes[?IndexName=='GSI1']"

# Scan table to see all items
aws dynamodb scan --table-name tcg-marketplace-dev-data --max-items 5
```

### Port conflict

**Error:** `Port 3000 is already in use`

**Solution:**
```powershell
# Windows - find and kill process
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or change port in .env.local
PORT=3002
```

## Frontend Integration

After backend tests pass, test with frontend:

### 1. Configure Frontend

Create `tcg-marketplace/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Start Frontend

```bash
cd tcg-marketplace/frontend
npm install
npm run dev
```

### 3. Test in Browser

1. Open http://localhost:3000
2. Navigate to "Sell" page
3. Upload a card image
4. Create a listing
5. Verify listing appears on home page

## Success Criteria

✅ **All local tests pass when:**

1. Backend starts without errors
2. Health check returns `{"status": "ok"}`
3. Presigned URLs are generated for S3 upload
4. Images upload successfully to S3
5. Listings are created in DynamoDB with correct schema
6. Listings can be queried by category using GSI
7. S3 objects are accessible via GET presigned URLs
8. Frontend can communicate with backend

## Next Steps

After successful local testing:

1. ✅ Write unit tests for adapters and controllers
2. ✅ Write e2e tests for API endpoints
3. ✅ Test frontend-backend integration
4. ✅ Deploy infrastructure to AWS
5. ✅ Run smoke tests in deployed environment
6. ✅ Set up CI/CD pipeline

## Additional Resources

- [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md) - Complete setup guide for new developers
- [Backend Local Testing Guide](./backend/test/LOCAL_TESTING.md) - Detailed testing instructions
- [Testing Checklist](./backend/test/TESTING_CHECKLIST.md) - Quick reference checklist
- [Backend Test README](./backend/test/README.md) - Complete testing documentation
- [Frontend Test README](./frontend/test/README.md) - Frontend integration testing guide
- [Frontend Testing Summary](./frontend/test/TESTING_SUMMARY.md) - Complete frontend testing strategy and workflows
- [Infrastructure README](./infra/README.md) - AWS deployment guide
- [Backend README](./backend/README.md) - Backend development guide
