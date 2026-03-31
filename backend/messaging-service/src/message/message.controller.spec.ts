import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { MessageController } from "./message.controller";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { MessageService } from "./message.service";

describe("MessageController", () => {
  let msgController: MessageController;
  let cognitoVerifierService: CognitoVerifierService;
  let msgService: MessageService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
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
          provide: MessageService,
          useValue: {}
        },
        {
          provide: MessageService,
          useValue: {
            getMessages: jest.fn(),
            createMessage: jest.fn(),
            editMessage: jest.fn(),
            deleteMessage: jest.fn()
          }
        }
      ]
    }).compile();

    msgController = module.get<MessageController>(MessageController);
    cognitoVerifierService = module.get(CognitoVerifierService);
    msgService = module.get(MessageService);
  });

  it("should be defined", () => {
    expect(msgController).toBeDefined();
    expect(msgService).toBeDefined();
  });
});
