import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";
import { AppLoggerService } from "../logger/logger.service";

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService
  ) {
    const host = this.configService.getOrThrow<string>("REDIS_HOST");
    const port = this.configService.getOrThrow<number>("REDIS_PORT");
    this.client = createClient({
      socket: {
        host: host,
        port: port,
        tls: true
      }
    });

    this.client.on("error", (err) => this.errorHandler("Redis error", err));
    this.client.on("connect", () => this.logger.log("Redis connecting..."));
    this.client.on("ready", () => this.logger.log("Redis ready!"));
  }

  private errorHandler(message: string, err: any) {
    if (err instanceof Error) {
      this.logger.error(message, err.stack);
    } else {
      this.logger.error(message, String(err));
    }
  }

  async onModuleInit() {
    try {
      await this.client.connect();

      const pong = await this.client.ping();
      if (pong !== "PONG") {
        throw new Error("Unexpected ping response from Redis: " + pong);
      }

      this.logger.log("Successfully connected to AWS Redis");
    } catch (err) {
      this.errorHandler("Failed to connect to Redis", err);
    }
  }

  getClient() {
    return this.client;
  }

  async setOnline(userId: string) {
    await this.client.set(`online:${userId}`, "1");
  }
  async setOffline(userId: string) {
    await this.client.del(`online:${userId}`);
  }
  async isOnline(userId: string) {
    return (await this.client.exists(`online:${userId}`)) === 1;
  }

  async addUserSocket(userId: string, socketId: string) {
    await this.client.sAdd(`user_sockets:${userId}`, socketId);
  }
  async removeUserSocket(userId: string, socketId: string) {
    await this.client.sRem(`user_sockets:${userId}`, socketId);
  }
  async hasActiveSockets(userId: string) {
    return (await this.client.sCard(`user_sockets:${userId}`)) > 0;
  }
  async getUserSockets(userId: string) {
    return this.client.sMembers(`user_sockets:${userId}`);
  }

  async addTyping(conversationId: string, userId: string) {
    await this.client.sAdd(`typing:${conversationId}`, userId);

    await this.client.expire(`typing:${conversationId}`, 5);
  }
  async removeTyping(conversationId: string, userId: string) {
    await this.client.sRem(`typing:${conversationId}`, userId);
  }
  async getTypingUsers(conversationId: string) {
    return this.client.sMembers(`typing:${conversationId}`);
  }
}
