import { Test, TestingModule } from "@nestjs/testing";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceRepository } from "./marketplace.repository";
import { S3Service } from "../s3/s3.service";

describe("MarketplaceService", () => {
  let listingService: MarketplaceService;
  let s3Service: S3Service;
  let listingRepository: MarketplaceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
