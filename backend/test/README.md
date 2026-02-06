# Backend Tests

This directory contains all tests for the TCG Marketplace backend.

## Documentation

- **[README.md](./README.md)** - This file (overview of all tests)
- **[LOCAL_TESTING.md](./LOCAL_TESTING.md)** - Detailed guide for local AWS integration testing
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Quick reference checklist for manual testing

## Test Types

### Unit Tests (`*.spec.ts`)
- Test individual components in isolation
- Mock external dependencies
- Fast execution
- Run with: `npm run test`

### E2E Tests (`*.e2e-spec.ts`)
- Test complete API workflows
- Use test database/services
- Run with: `npm run test:e2e`

### Integration Tests (Local AWS)
- Test real AWS service integration (S3, DynamoDB)
- Require deployed AWS resources
- Validate SDK configuration and IAM permissions

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Local Integration Tests

**Prerequisites:**
1. AWS resources deployed (S3 bucket + DynamoDB table)
2. Backend configured with `.env.local`
3. Backend server running on port 3000
4. Test image `test-card.jpg` in the test folder

**Run tests:**
```powershell
# Windows
cd test
.\integration-local.ps1
```

**What it tests:**
1. ✅ S3 presigned URL generation
2. ✅ S3 image upload
3. ✅ DynamoDB listing creation
4. ✅ DynamoDB query by category
5. ✅ S3 object verification

## Test Structure

```
test/
├── README.md                    # This file
├── app.e2e-spec.ts             # Basic e2e test
├── integration-local.ps1       # Local AWS integration tests
├── LOCAL_TESTING.md            # Detailed testing guide
├── TESTING_CHECKLIST.md        # Quick reference
└── jest-e2e.json               # E2E test configuration
```

## Writing Tests

### Unit Test Example
```typescript
// src/controllers/listings.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from './listings.controller';
import { AWSDynamoAdapter } from '../adapters/dynamodb/aws-dynamodb.adapter';

describe('ListingsController', () => {
  let controller: ListingsController;
  let dynamoAdapter: AWSDynamoAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        {
          provide: AWSDynamoAdapter,
          useValue: {
            putItem: jest.fn(),
            queryItems: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ListingsController>(ListingsController);
    dynamoAdapter = module.get<AWSDynamoAdapter>(AWSDynamoAdapter);
  });

  it('should create a listing', async () => {
    const mockListing = {
      title: 'Test Card',
      price: 100,
      category: 'vintage',
    };

    jest.spyOn(dynamoAdapter, 'putItem').mockResolvedValue(undefined);

    const result = await controller.createListing(mockListing);
    
    expect(result).toHaveProperty('id');
    expect(dynamoAdapter.putItem).toHaveBeenCalled();
  });
});
```

### E2E Test Example
```typescript
// test/listings.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Listings (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/listings (GET)', () => {
    return request(app.getHttpServer())
      .get('/listings?category=vintage')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/listings (POST)', () => {
    return request(app.getHttpServer())
      .post('/listings')
      .send({
        title: 'Test Card',
        description: 'Test description',
        price: 100,
        category: 'vintage',
        images: [],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Card');
      });
  });
});
```

## Best Practices

1. **Mock external dependencies** in unit tests
2. **Use test databases** for e2e tests (not production)
3. **Clean up test data** after integration tests
4. **Run unit tests frequently** during development
5. **Run integration tests** before deployment
6. **Keep tests fast** - unit tests should run in milliseconds
7. **Test edge cases** - null values, invalid inputs, errors

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
npm install
```

### Integration tests fail with "Unable to connect"
- Ensure backend is running: `npm run start:dev`
- Check backend is on port 3000: `curl http://localhost:3000/health`

### Integration tests fail with AWS errors
- Verify `.env.local` has correct AWS resource names
- Check AWS credentials: `aws sts get-caller-identity`
- Verify resources exist: `aws s3 ls` and `aws dynamodb list-tables`

### E2E tests timeout
- Increase timeout in `jest-e2e.json`
- Check if ports are available
- Ensure no other services are running on test ports
