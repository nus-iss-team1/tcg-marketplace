import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/public.decorator";

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get("health")
  healthCheck() {
    return {
      service: "messaging-service",
      status: "ok"
    };
  }
}
