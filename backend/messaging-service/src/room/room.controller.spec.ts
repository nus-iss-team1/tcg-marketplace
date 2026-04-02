import { Test, TestingModule } from "@nestjs/testing";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { CognitoVerifierService } from "../auth/cognito-verifier.service";
import { CognitoAuthGuard } from "../auth/cognito-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("RoomController", () => {
  let roomController: RoomController;
  let cognitoVerifierService: CognitoVerifierService;
  let roomService: RoomService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
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
          provide: RoomService,
          useValue: {
            queryRooms: jest.fn(),
            getRoom: jest.fn(),
            updateLastSeen: jest.fn(),
            archiveRoom: jest.fn(),
            deleteRoom: jest.fn(),
            getCreateRoomScript: jest.fn(),
            getUpdateLatestMessageScript: jest.fn()
          }
        }
      ]
    }).compile();

    roomController = module.get<RoomController>(RoomController);
    cognitoVerifierService = module.get(CognitoVerifierService);
    roomService = module.get(RoomService);
  });

  it("should be defined", () => {
    expect(roomController).toBeDefined();
    expect(roomService).toBeDefined();
  });
});
