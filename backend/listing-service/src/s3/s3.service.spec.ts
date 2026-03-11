import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { S3Service } from "./s3.service";

describe("S3Service", () => {
  let s3Service: S3Service;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [S3Service]
    }).compile();

    s3Service = module.get<S3Service>(S3Service);
  });

  it("should be defined", () => {
    expect(s3Service).toBeDefined();
  });
});
