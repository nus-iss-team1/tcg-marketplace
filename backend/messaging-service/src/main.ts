import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppLoggerService } from "./logger/logger.service";
import { overrideConsole } from "./logger/console.override";

async function bootstrap() {
  const port = process.env.PORT ?? 3002;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const logger = app.get(AppLoggerService);

  app.setGlobalPrefix("messaging");
  app.useLogger(logger);
  overrideConsole(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  await app.listen(port);
  logger.log(`Application started on port ${port}`, "Startup");
}
bootstrap().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
