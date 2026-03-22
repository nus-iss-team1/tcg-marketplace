import { Test, TestingModule } from "@nestjs/testing";
import { MessagingService } from "./messaging.service";

describe("MessagingService", () => {
  let msgService: MessagingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingService]
    }).compile();

    msgService = module.get<MessagingService>(MessagingService);
  });

  it("should be defined", () => {
    expect(msgService).toBeDefined();
  });
});
