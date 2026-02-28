# Local Testing Guide

This guide helps you test the TCG Marketplace backend locally before deploying to AWS.

## Prerequisites

1. **AWS Account** with credentials configured
2. **AWS CLI** installed and configured (`aws configure`)
3. **Node.js** 18+ installed
4. **Deployed AWS Resources** (S3 bucket and DynamoDB table)

## Setup

### 1. Deploy Required AWS Resources

```powershell
# Deploy simplified storage stack (S3 + DynamoDB only, no VPC dependencies)
cd tcg-marketplace/infra
.\deploy.ps1 -Environment dev -Template storage-simple
```

This deploys a simplified CloudFormation stack optimized for local testing that includes:
- S3 bucket with CORS and lifecycle policies
- DynamoDB table with GSI1 and GSI2 indexes
- DynamoDB Streams enabled
- No VPC or networking dependencies

### 2. Get CloudFormation Outputs

```powershell
# Get S3 bucket name
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text

# Get DynamoDB table name
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage-simple --query "Stacks[0].Outputs[?OutputKey=='TableName'].OutputValue" --output text
```

### 3. Configure Environment

Create `tcg-marketplace/backend/.env.local`:

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# AWS Configuration
AWS_REGION=ap-southeast-1

# AWS Resources (from CloudFormation outputs above)
BUCKET_NAME=tcg-marketplace-dev-storage-123456789012
TABLE_NAME=tcg-marketplace-dev-data

# CORS (optional - defaults to allow all in dev)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**CORS Configuration**: The backend defaults to allowing all origins in development. For local testing with specific origins, set `CORS_ORIGINS` to a comma-separated list. When deployed behind an ALB with path-based routing (full-stack deployment), same-origin requests work automatically without CORS configuration.

**Note:** The backend loads `.env.local` first, then falls back to `.env`. This allows you to keep local configuration separate from committed defaults.

### 4. Install Dependencies

```bash
cd tcg-marketplace/backend
npm install
```

## Test Scenarios

### Test 1: S3 Upload (Presigned URL)

**Goal:** Verify backend can generate presigned URLs and browser can upload to S3.

```bash
# Start backend
npm run start:dev

# In another terminal, test presigned URL generation
curl -X POST http://localhost:3000/media/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-card.jpg",
    "contentType": "image/jpeg"
  }'
```

**Expected Response:**
```json
{
  "uploadUrl": "https://tcg-marketplace-dev-storage-xxx.s3.ap-southeast-1.amazonaws.com/...",
  "key": "temp/uploads/2026-02-06/uuid.jpg",
  "expiresIn": 3600
}
```

**Upload Test:**
```bash
# Save the uploadUrl from above response
# Upload a test image
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-image.jpg"
```

**Verify in S3:**
```bash
# List objects in bucket
aws s3 ls s3://tcg-marketplace-dev-storage-xxx/temp/uploads/ --recursive
```

### Test 2: S3 Read (GET Presigned URL)

**Goal:** Verify app can generate GET presigned URLs for retrieval.

```bash
# Generate GET presigned URL (using the key from Test 1)
curl -X GET "http://localhost:3000/media/presign?key=temp/uploads/2026-02-06/uuid.jpg&operation=GET"
```

**Verify:**
- Open the returned URL in browser
- Image should display

### Test 3: DynamoDB Write

**Goal:** Create listing record with metadata.

```bash
# Create a listing
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

**Expected Response:**
```json
{
  "PK": "LISTING#<uuid>",
  "SK": "METADATA",
  "id": "<uuid>",
  "title": "Black Lotus - Alpha",
  "description": "Near mint condition",
  "price": 15000,
  "category": "vintage",
  "user_id": "user-placeholder",
  "status": "active",
  "images": ["temp/uploads/2026-02-06/uuid.jpg"],
  "created_at": "2026-02-06T...",
  "updated_at": "2026-02-06T...",
  "GSI1PK": "CATEGORY#vintage",
  "GSI1SK": "2026-02-06T...",
  "GSI2PK": "USER#user-placeholder",
  "GSI2SK": "STATUS#active"
}
```

**Verify in DynamoDB:**
```bash
# Scan table
aws dynamodb scan --table-name tcg-marketplace-dev-data --max-items 5
```

### Test 4: DynamoDB Read

**Goal:** Query listings by category using GSI.

```bash
# Get listings by category
curl -X GET "http://localhost:3000/listings?category=vintage&limit=10"
```

**Expected Response:**
```json
[
  {
    "id": "<uuid>",
    "title": "Black Lotus - Alpha",
    "price": 15000,
    "category": "vintage",
    ...
  }
]
```

**Query by PK directly:**
```bash
# Get specific listing (replace with actual listing ID from Test 3)
aws dynamodb get-item \
  --table-name tcg-marketplace-dev-data \
  --key '{"PK": {"S": "LISTING#<uuid>"}, "SK": {"S": "METADATA"}}'
```

## Integration Test: Full Workflow

Test the complete user journey:

```bash
# 1. Generate presigned URL
PRESIGN_RESPONSE=$(curl -s -X POST http://localhost:3000/media/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "charizard.jpg", "contentType": "image/jpeg"}')

echo $PRESIGN_RESPONSE

# 2. Extract upload URL and key (manual step - copy from response)
UPLOAD_URL="<paste-upload-url>"
IMAGE_KEY="<paste-key>"

# 3. Upload image
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-card.jpg"

# 4. Create listing with image
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Charizard Base Set\",
    \"description\": \"First edition\",
    \"price\": 2500,
    \"category\": \"vintage\",
    \"images\": [\"$IMAGE_KEY\"]
  }"

# 5. Retrieve listings
curl -X GET "http://localhost:3000/listings?category=vintage"
```

## Health Check

```bash
# Verify backend is running
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T...",
  "uptime": 123.456
}
```

## Common Issues

### Issue: "BUCKET_NAME environment variable is required"
**Solution:** Ensure `.env.local` has correct `BUCKET_NAME` from CloudFormation output. The application loads `.env.local` first, then falls back to `.env`.

### Issue: "TABLE_NAME environment variable is required"
**Solution:** Ensure `.env.local` has correct `TABLE_NAME` from CloudFormation output. The application loads `.env.local` first, then falls back to `.env`.

### Issue: "AccessDenied" when uploading to S3
**Solution:** Check AWS credentials have S3 write permissions:
```bash
aws sts get-caller-identity
aws s3 ls s3://tcg-marketplace-dev-storage-xxx/
```

### Issue: "ResourceNotFoundException" for DynamoDB
**Solution:** Verify table exists:
```bash
aws dynamodb describe-table --table-name tcg-marketplace-dev-data
```

### Issue: CORS errors in browser
**Solution:** Backend defaults to allow all origins in development. For specific origins, ensure `CORS_ORIGINS` in `.env.local` includes frontend URL. When deployed behind an ALB with path-based routing, same-origin requests work automatically.

## Cleanup Test Data

```bash
# Delete test objects from S3
aws s3 rm s3://tcg-marketplace-dev-storage-xxx/temp/uploads/ --recursive

# Delete test items from DynamoDB (replace with actual keys)
aws dynamodb delete-item \
  --table-name tcg-marketplace-dev-data \
  --key '{"PK": {"S": "LISTING#<uuid>"}, "SK": {"S": "METADATA"}}'
```

## Next Steps

After successful local testing:
1. Run unit tests: `npm run test`
2. Run e2e tests: `npm run test:e2e`
3. Test frontend integration
4. Deploy to AWS and run smoke tests
