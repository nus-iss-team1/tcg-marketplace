import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { MessagingController } from "./messaging.controller";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("MessagingController", () => {
  let msgController: MessagingController;
  let cognitoVerifierService: CognitoVerifierService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
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
        }
      ]
    }).compile();

    msgController = module.get<MessagingController>(MessagingController);
    cognitoVerifierService = module.get(CognitoVerifierService);
  });

  it("should be defined", () => {
    expect(msgController).toBeDefined();
  });
});
