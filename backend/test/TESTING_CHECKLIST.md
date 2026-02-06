# Local Testing Checklist

Quick reference for testing TCG Marketplace backend locally.

## Prerequisites ✓

- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Node.js 18+ installed
- [ ] S3 bucket deployed (via `infra/storage-simple.yml`)
- [ ] DynamoDB table deployed (via `infra/storage-simple.yml`)
- [ ] `.env.local` configured with correct AWS resource names
- [ ] Test image `test-card.jpg` in the test folder

**Deploy Storage Resources:**
```powershell
cd tcg-marketplace/infra
aws cloudformation create-stack --stack-name tcg-marketplace-dev-storage --template-body file://storage-simple.yml --parameters ParameterKey=Environment,ParameterValue=dev ParameterKey=ProjectName,ParameterValue=tcg-marketplace --region ap-southeast-1
```

**Get CloudFormation Outputs:**
```powershell
aws cloudformation describe-stacks --stack-name tcg-marketplace-dev-storage --query "Stacks[0].Outputs"
```

## Test Execution

### Automated Tests

```powershell
# Windows
.\test-local.ps1

# Linux/Mac
./test-local.sh
```

### Manual Tests

#### 1. S3 Upload ✓

**Goal:** Verify presigned URL generation and S3 upload

```bash
# Generate presigned URL
curl -X POST http://localhost:3000/media/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "contentType": "image/jpeg"}'

# Upload to returned URL
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test.jpg"

# Verify in S3
aws s3 ls s3://<bucket-name>/temp/uploads/ --recursive
```

**Expected:** 200 OK, file appears in S3

#### 2. S3 Read ✓

**Goal:** Verify GET presigned URL generation

```bash
# Generate GET URL (use key from upload test)
curl "http://localhost:3000/media/presign?key=<s3-key>&operation=GET"
```

**Expected:** Valid presigned URL that displays image in browser

#### 3. DynamoDB Write ✓

**Goal:** Create listing with metadata

```bash
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Card",
    "description": "Test listing",
    "price": 100,
    "category": "vintage",
    "images": ["<s3-key>"]
  }'
```

**Expected:** JSON response with listing ID and metadata

#### 4. DynamoDB Read ✓

**Goal:** Query listings by category

```bash
# Query by category
curl "http://localhost:3000/listings?category=vintage&limit=10"

# Verify in DynamoDB
aws dynamodb scan --table-name <table-name> --max-items 5
```

**Expected:** Array of listings including test listing

## Validation Checklist

### Application Code
- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] All controllers are registered
- [ ] Environment variables are loaded

### AWS SDK Integration
- [ ] S3 client initializes with correct region
- [ ] DynamoDB client initializes with correct region
- [ ] AWS credentials are valid
- [ ] Presigned URLs are generated successfully

### S3 + DynamoDB Logic
- [ ] Presigned URLs work for upload (PUT)
- [ ] Presigned URLs work for download (GET)
- [ ] Files upload to correct S3 path structure
- [ ] Listings are created with correct schema
- [ ] GSI queries return results
- [ ] Image keys are stored correctly in listings

### IAM Permissions
- [ ] Can generate S3 presigned URLs
- [ ] Can upload to S3 bucket
- [ ] Can read from S3 bucket
- [ ] Can write to DynamoDB table
- [ ] Can query DynamoDB table
- [ ] Can scan DynamoDB table (for verification)

## Common Issues

| Issue | Solution |
|-------|----------|
| `BUCKET_NAME environment variable is required` | Set in `.env.local` from CloudFormation output |
| `TABLE_NAME environment variable is required` | Set in `.env.local` from CloudFormation output |
| `AccessDenied` on S3 upload | Check AWS credentials: `aws sts get-caller-identity` |
| `ResourceNotFoundException` for DynamoDB | Verify table exists: `aws dynamodb describe-table --table-name <name>` |
| CORS errors in browser | Add frontend URL to `CORS_ORIGINS` in `.env.local` |
| Port already in use | Change `PORT` in `.env.local` or kill process on port 3000 |

## Success Criteria

All tests pass when:
1. ✅ Backend starts and health check returns OK
2. ✅ Presigned URLs are generated for S3 upload
3. ✅ Images upload successfully to S3
4. ✅ Listings are created in DynamoDB
5. ✅ Listings can be queried by category
6. ✅ S3 objects are accessible via presigned GET URLs

## Next Steps

After local testing passes:
1. Run unit tests: `npm run test`
2. Run e2e tests: `npm run test:e2e`
3. Test frontend integration
4. Deploy to AWS
5. Run smoke tests in deployed environment
