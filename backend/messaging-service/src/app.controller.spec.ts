import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            check: jest.fn()
          }
        }
      ]
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);
  });

  it("should be defined", () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });
});
