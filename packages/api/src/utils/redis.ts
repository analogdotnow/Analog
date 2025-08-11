import { Redis } from "@upstash/redis";

import { env } from "@repo/env/server";

let redis: Redis | undefined = undefined;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}
