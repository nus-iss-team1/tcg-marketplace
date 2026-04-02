import { Test, TestingModule } from "@nestjs/testing";
import { RoomService } from "./room.service";
import { RoomRepository } from "./room.repository";

describe("RoomService", () => {
  let roomService: RoomService;
  let roomRepo: RoomRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: RoomRepository,
          useValue: {
            queryRooms: jest.fn(),
            getRoom: jest.fn(),
            archiveRoom: jest.fn(),
            deleteRoom: jest.fn(),
            updateLastSeen: jest.fn(),
            buildCreateRoom: jest.fn(),
            buildUpdateLatestMessage: jest.fn()
          }
        }
      ]
    }).compile();

    roomService = module.get<RoomService>(RoomService);
    roomRepo = module.get(RoomRepository);
  });

  it("should be defined", () => {
    expect(roomService).toBeDefined();
    expect(roomRepo).toBeDefined();
  });
});
