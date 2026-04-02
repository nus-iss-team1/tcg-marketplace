import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { RedisService } from "./redis/redis.service";

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async check() {
    const checks: Record<string, "up" | "down"> = {};

    checks.app = "up";

    try {
      const client = this.redisService.getClient();

      const start = DateTime.now().toMillis();
      const pong = await client.ping();

      const latency = DateTime.now().toMillis() - start;

      if (pong !== "PONG") {
        throw new Error("Invalid Redis response");
      }

      checks.redis = latency < 100 ? "up" : "down";
    } catch {
      checks.redis = "down";
    }

    return checks;
  }
}
