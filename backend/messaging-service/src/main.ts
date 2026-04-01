import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppLoggerService } from "./logger/logger.service";
import { overrideConsole } from "./logger/console.override";
import { RedisIoAdapter } from "./redis/redis.adapter";
import { RedisService } from "./redis/redis.service";

async function bootstrap() {
  const port = process.env.PORT ?? 3002;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const logger = app.get(AppLoggerService);
  const redisService = app.get(RedisService);

  app.setGlobalPrefix("messaging");
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (
        !origin ||
        /^https?:\/\/([^/]*\.)?(dev\.vaultofcards\.io|vaultofcards\.io|localhost:\d+)$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  });
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

  const adapter = new RedisIoAdapter(app, redisService);
  try {
    await adapter.connectToRedis();
  } catch (err) {
    logger.error(
      "Could not connect to Redis adapter",
      err instanceof Error ? err.stack : String(err)
    );
    process.exit(1);
  }
  app.useWebSocketAdapter(adapter);

  await app.listen(port);
  logger.log(`Application started on port ${port}`, "Startup");
}
bootstrap().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
