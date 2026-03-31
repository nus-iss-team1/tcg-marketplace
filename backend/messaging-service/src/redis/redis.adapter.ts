import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext } from "@nestjs/common";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server, ServerOptions } from "socket.io";
import { RedisService } from "./redis.service";

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter!: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly redisService: RedisService
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const client = this.redisService.getClient();
    const pub = client.duplicate();
    const sub = client.duplicate();

    await pub.connect();
    await sub.connect();

    this.redisAdapter = createAdapter(pub, sub);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    if (!this.redisAdapter) {
      throw new Error("Redis adapter not initialized. Call connectToRedis() first");
    }

    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: "*" },
      path: "/messaging",
      transports: ["websocket"]
    }) as Server;

    server.adapter(this.redisAdapter);

    return server;
  }
}
