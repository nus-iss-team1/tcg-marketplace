import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceService } from "./marketplace.service";

describe("MarketplaceController", () => {
  let listingController: MarketplaceController;
  let cognitoVerifierService: CognitoVerifierService;
  let listingService: MarketplaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [
        Reflector,
        {
          provide: CognitoVerifierService,
          useValue: {
            verifyToken: jest.fn()
          }
        },
        {
          provide: APP_GUARD,
          useClass: CognitoAuthGuard
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard
        },
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
    cognitoVerifierService = module.get(CognitoVerifierService);
    listingService = module.get(MarketplaceService);
  });

  it("should be defined", () => {
    expect(listingController).toBeDefined();
    expect(listingService).toBeDefined();
  });

  // it("should allow access if authenticated", async () => {
  //   (cognitoVerifierService.verifyToken as jest.Mock).mockResolvedValueOnce({
  //     sub: "test-sub",
  //     iss: "test-iss",
  //     aud: "test-aud",
  //     exp: Math.floor(Date.now() / 1000) + 3600,
  //     iat: Math.floor(Date.now() / 1000),
  //     token_use: "access"
  //   });

  //   const result = await listingController.listing("Pokemon");
  //   expect(result).toBeDefined();
  // });

  // it("should deny access if not authenticated", async () => {
  //   (cognitoVerifierService.verifyToken as jest.Mock).mockRejectedValueOnce(
  //     new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED)
  //   );

  //   try {
  //     await listingController.listing("Pokemon");
  //   } catch (e: any) {
  //     console.log(e);
  //     expect(e.response.statusCode).toBe(401);
  //   }
  // });
});
