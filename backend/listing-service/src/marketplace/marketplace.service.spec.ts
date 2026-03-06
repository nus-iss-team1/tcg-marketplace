import { Test, TestingModule } from "@nestjs/testing";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceRepository } from "./marketplace.repository";

describe("MarketplaceService", () => {
  let listingSrvice: MarketplaceService;
  let listingRepository: MarketplaceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
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

    listingSrvice = module.get<MarketplaceService>(MarketplaceService);
    listingRepository = module.get(MarketplaceRepository);
  });

  it("should be defined", () => {
    expect(listingSrvice).toBeDefined();
    expect(listingRepository).toBeDefined();
  });
});
