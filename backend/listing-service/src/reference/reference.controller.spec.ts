import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { ReferenceController } from "./reference.controller";
import { ReferenceService } from "./reference.service";

describe("ReferenceController", () => {
  let referenceController: ReferenceController;
  let cognitoVerifierService: CognitoVerifierService;
  let referenceService: ReferenceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceController],
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
          provide: ReferenceService,
          useValue: {
            retrieveGameName: jest.fn(),
            retrieveCardDetail: jest.fn()
          }
        }
      ]
    }).compile();

    referenceController = module.get<ReferenceController>(ReferenceController);
    cognitoVerifierService = module.get(CognitoVerifierService);
    referenceService = module.get(ReferenceService);
  });

  it("should be defined", () => {
    expect(referenceController).toBeDefined();
    expect(referenceService).toBeDefined();
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

  //   const result = await referenceController.gameName();
  //   expect(result).toBeDefined();
  // });

  // it("should deny access if not authenticated", async () => {
  //   (cognitoVerifierService.verifyToken as jest.Mock).mockRejectedValueOnce(
  //     new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED)
  //   );

  //   try {
  //     await referenceController.gameName();
  //   } catch (e: any) {
  //     expect(e.response.statusCode).toBe(401);
  //   }
  // });
});
