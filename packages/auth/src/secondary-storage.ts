import { Redis as UpstashRedis } from "@upstash/redis";
import type { SecondaryStorage as Storage } from "better-auth";
import IORedis from "ioredis";

import { env } from "@repo/env/server";

export function secondaryStorage(): Storage | {} {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const client = new UpstashRedis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    return {
      get: async (key) => (await client.get<string | null>(key)) ?? null,
      set: async (key, value, ttl) => {
        if (ttl) await client.set(key, value, { ex: ttl });
        else await client.set(key, value);
      },
      delete: async (key) => {
        await client.del(key);
      },
    };
  }

  if (env.REDIS_URL) {
    const client = new IORedis(env.REDIS_URL);
    return {
      get: async (key) => (await client.get(key)) ?? null,
      set: async (key, value, ttl) => {
        if (ttl) await client.set(key, value, "EX", ttl);
        else await client.set(key, value);
      },
      delete: async (key) => {
        await client.del(key);
      },
    };
  }

  return {};
}
