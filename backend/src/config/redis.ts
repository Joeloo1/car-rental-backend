import { createClient, RedisClientType } from "redis";
import logger from "./winston";

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not set (graceful degradation).
 */
const getRedisClient = (): RedisClientType | null => {
  if (!process.env.REDIS_URL) return null;

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            logger.warn("Redis: max reconnection attempts reached, giving up");
            return new Error("Max Redis reconnection attempts reached");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    }) as RedisClientType;

    redisClient.on("error", (err) => {
      logger.error(`Redis client error: ${err.message}`);
      isConnected = false;
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis: reconnecting...");
    });
  }

  return redisClient;
};

/**
 * Connect to Redis. Called once on server startup.
 * Fails silently so the server still starts without Redis.
 */
export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (!client) {
    logger.warn("⚠️  REDIS_URL not set — caching disabled, running without Redis");
    return;
  }

  try {
    await client.connect();
    isConnected = true;
    logger.info("🟢 Redis connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Redis connection failed: ${message} — continuing without cache`);
    isConnected = false;
  }
};

/**
 * Disconnect from Redis. Called on graceful shutdown.
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && isConnected) {
    await redisClient.quit();
    isConnected = false;
    logger.info("Redis disconnected");
  }
};

// ─── Cache Helpers ────────────────────────────────────────────────────────────

/**
 * Read a value from the cache.
 * Returns `null` on cache miss or when Redis is unavailable.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client || !isConnected) return null;

  try {
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    logger.warn(`Redis getCache error for key "${key}": ${err}`);
    return null;
  }
};

/**
 * Write a value to the cache with a TTL (in seconds).
 * No-ops silently when Redis is unavailable.
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> => {
  const client = getRedisClient();
  if (!client || !isConnected) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn(`Redis setCache error for key "${key}": ${err}`);
  }
};

/**
 * Delete one or more exact cache keys.
 */
export const deleteCache = async (...keys: string[]): Promise<void> => {
  const client = getRedisClient();
  if (!client || !isConnected || keys.length === 0) return;

  try {
    await client.del(keys);
  } catch (err) {
    logger.warn(`Redis deleteCache error for keys [${keys.join(", ")}]: ${err}`);
  }
};

/**
 * Delete all cache keys matching a glob pattern (e.g. "cars:list:*").
 * Uses SCAN to avoid blocking the Redis event loop.
 */
export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  const client = getRedisClient();
  if (!client || !isConnected) return;

  try {
    const keys: string[] = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      if (Array.isArray(key)) {
        keys.push(...key);
      } else {
        keys.push(key as unknown as string);
      }
    }
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug(`Redis: invalidated ${keys.length} key(s) matching "${pattern}"`);
    }
  } catch (err) {
    logger.warn(`Redis deleteCacheByPattern error for pattern "${pattern}": ${err}`);
  }
};
