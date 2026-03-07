import { Test, TestingModule } from "@nestjs/testing";
import { ReferenceService } from "./reference.service";
import { ReferenceRepository } from "./reference.repository";

describe("ReferenceService", () => {
  let referenceService: ReferenceService;
  let referenceRepo: ReferenceRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferenceService,
        {
          provide: ReferenceRepository,
          useValue: {
            retrieveGameName: jest.fn(),
            retrieveCardDetail: jest.fn()
          }
        }
      ]
    }).compile();

    referenceService = module.get<ReferenceService>(ReferenceService);
    referenceRepo = module.get(ReferenceRepository);
  });

  it("should be defined", () => {
    expect(referenceService).toBeDefined();
    expect(referenceRepo).toBeDefined();
  });
});
