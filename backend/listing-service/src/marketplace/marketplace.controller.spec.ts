import { Test, TestingModule } from "@nestjs/testing";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceService } from "./marketplace.service";

describe("MarketplaceController", () => {
  let listingController: MarketplaceController;
  let listingSrvice: MarketplaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [
        {
          provide: MarketplaceService,
          useValue: {
            create: jest.fn(),
            listing: jest.fn(),
            sellerListing: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile();

    listingController = module.get<MarketplaceController>(MarketplaceController);
    listingSrvice = module.get(MarketplaceService);
  });

  it("should be defined", () => {
    expect(listingController).toBeDefined();
    expect(listingSrvice).toBeDefined();
  });
});
