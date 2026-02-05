import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AWSModule } from './modules/aws.module';
import { MediaController } from './controllers/media.controller';
import { ListingsController } from './controllers/listings.controller';
import { HealthController } from './controllers/health.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AWSModule,
  ],
  controllers: [
    AppController,
    HealthController,
    MediaController,
    ListingsController,
  ],
  providers: [AppService],
})
export class AppModule {}
