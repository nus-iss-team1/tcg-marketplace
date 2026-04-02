import { Test, TestingModule } from "@nestjs/testing";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";
import { RoomService } from "../room/room.service";

describe("MessageService", () => {
  let messageService: MessageService;
  let roomService: RoomService;
  let messageRepo: MessageRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
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
        },
        {
          provide: MessageRepository,
          useValue: {
            queryMessages: jest.fn(),
            getMessage: jest.fn(),
            createMessage: jest.fn(),
            editMessage: jest.fn(),
            deleteMessage: jest.fn(),
            buildCreateMessage: jest.fn(),
            buildCreateVersion: jest.fn(),
            buildUpdateContent: jest.fn()
          }
        }
      ]
    }).compile();

    messageService = module.get<MessageService>(MessageService);
    roomService = module.get(RoomService);
    messageRepo = module.get(MessageRepository);
  });

  it("should be defined", () => {
    expect(messageService).toBeDefined();
    expect(roomService).toBeDefined();
    expect(messageRepo).toBeDefined();
  });
});
