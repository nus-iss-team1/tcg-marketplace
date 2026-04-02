import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { Public } from "./auth/public.decorator";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  async healthCheck() {
    const checks = await this.appService.check();
    const isHealthy = Object.values(checks).every((status) => status === "up");

    if (!isHealthy) {
      throw new HttpException(
        {
          status: "error",
          checks: checks
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {
      status: "ok",
      version: process.env.IMAGE_TAG || "unknown",
      checks: checks
    };
  }
}
