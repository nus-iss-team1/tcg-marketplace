import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CognitoVerifierService } from "./cognito-verifier.service";
import { APP_GUARD } from "@nestjs/core";
import { CognitoAuthGuard } from "./cognito-auth.guard";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [ConfigModule],
  providers: [
    CognitoVerifierService,
    {
      provide: APP_GUARD,
      useClass: CognitoAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  exports: []
})
export class AuthModule {}
