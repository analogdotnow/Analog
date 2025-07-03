import { Redis } from "@upstash/redis";
import { SecondaryStorage } from "better-auth";

import { env } from "@repo/env/server";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const secondaryStorage: SecondaryStorage = {
  get: async (key) => {
    const value = await redis.get<string>(key);

    return value ?? null;
  },
  set: async (key, value, ttl) => {
    if (ttl) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }
  },
  delete: async (key) => {
    await redis.del(key);
  },
};
