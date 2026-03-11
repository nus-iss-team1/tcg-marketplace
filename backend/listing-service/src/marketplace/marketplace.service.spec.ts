import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceRepository } from "./marketplace.repository";
import { S3Service } from "../s3/s3.service";
import { LoggingModule } from "../logger/logging.module";

describe("MarketplaceService", () => {
  let listingService: MarketplaceService;
  let s3Service: S3Service;
  let listingRepository: MarketplaceRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggingModule, ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        MarketplaceService,
        {
          provide: S3Service,
          useValue: {
            uploadImage: jest.fn(),
            deleteObject: jest.fn()
          }
        },
        {
          provide: MarketplaceRepository,
          useValue: {
            createListing: jest.fn(),
            retrieveListing: jest.fn(),
            retrieveSellerListing: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn()
          }
        }
      ]
    }).compile();

    listingService = module.get<MarketplaceService>(MarketplaceService);
    s3Service = module.get(S3Service);
    listingRepository = module.get(MarketplaceRepository);
  });

  it("should be defined", () => {
    expect(listingService).toBeDefined();
    expect(s3Service).toBeDefined();
    expect(listingRepository).toBeDefined();
  });
});
