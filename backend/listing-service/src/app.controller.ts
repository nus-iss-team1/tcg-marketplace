import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/public.decorator";
import { Roles } from "./auth/roles.decorator";
import { CurrentUser } from "./auth/current-user.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  healthCheck() {
    return { status: "ok" };
  }

  @Public()
  @Get("public")
  getHello(): string {
    return this.appService.getHello();
  }

  @Roles("User")
  @Get("username")
  getUsername(@CurrentUser("sub") username: string) {
    return { username: username };
  }
}
