import { CacheModuleOptions } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import RedisStore from "cache-manager-ioredis";

export const getCacheConfig = (
  configService: ConfigService
): CacheModuleOptions => ({
  store: RedisStore,
  host: configService.get<string>("REDIS_HOST"),
  port: configService.get<number>("REDIS_PORT"),
  password: configService.get<string>("REDIS_PASSWORD"),
  ttl: configService.get<number>("REDIS_TTL"),
});
