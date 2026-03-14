import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { LoggingService } from "./logger/logging.service";
import { overrideConsole } from "./logger/console.override";

async function bootstrap() {
  const port = process.env.PORT ?? 3001;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const loggingService = app.get(LoggingService);
  const logger = loggingService.getLogger();

  app.setGlobalPrefix("api");
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
  console.log(`Application started on port ${port}`);
}
bootstrap().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
