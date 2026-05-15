import { Request, Response, NextFunction } from "express";
import { getCache, setCache } from "../config/redis";
import logger from "../config/winston";

/**
 * Express middleware that caches GET responses in Redis.
 *
 * Usage:
 *   router.get("/cars", cacheMiddleware(300), carController.getAllCars);
 *
 * @param ttlSeconds  How long to cache the response (in seconds).
 * @param keyFn       Optional function to derive the cache key from the request.
 *                    Defaults to the full original URL (path + query string).
 */
export const cacheMiddleware = (
  ttlSeconds: number,
  keyFn?: (req: Request) => string,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = keyFn ? keyFn(req) : `route:${req.originalUrl}`;

    try {
      const cached = await getCache<any>(cacheKey);
      if (cached) {
        logger.debug(`Route cache HIT: ${cacheKey}`);
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
      }
    } catch {
      // If Redis fails here, just fall through to the actual handler
    }

    // Patch res.json to capture the response and store it in cache
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttlSeconds).catch(() => {});
        res.setHeader("X-Cache", "MISS");
      }
      return originalJson(body);
    };

    next();
  };
};
