import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";
import { RedisService } from "./redis/redis.service";

describe("AppService", () => {
  let appService: AppService;
  let redisService: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: {
            onModuleInit: jest.fn(),
            getClient: jest.fn(),
            setOnline: jest.fn(),
            setOffline: jest.fn(),
            isOnline: jest.fn(),
            addUserSocket: jest.fn(),
            removeUserSocket: jest.fn(),
            hasActiveSockets: jest.fn(),
            getUserSockets: jest.fn(),
            addTyping: jest.fn(),
            removeTyping: jest.fn(),
            getTypingUsers: jest.fn()
          }
        }
      ]
    }).compile();

    appService = module.get<AppService>(AppService);
    redisService = module.get(RedisService);
  });

  it("should be defined", () => {
    expect(appService).toBeDefined();
    expect(redisService).toBeDefined();
  });
});
