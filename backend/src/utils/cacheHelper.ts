import redisClient from './redisClient';

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

export const cacheHelper = {
  /**
   * Get a value from cache and parse it as JSON
   * @param key Cache key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      if (!cached) {
        return null;
      }
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttl Time to live in seconds (defaults to CACHE_TTL_SECONDS env var or 300)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expirationTime = ttl || DEFAULT_TTL;

      await redisClient.setEx(key, expirationTime, serialized);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Delete a single key from cache
   * @param key Cache key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear cache entries matching a pattern
   * @param pattern Pattern to match (e.g., "rooms:*", "user:123:*")
   */
  async clear(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);

      if (keys.length === 0) {
        return;
      }

      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    } catch (error) {
      console.error(`Cache clear error for pattern ${pattern}:`, error);
      throw error;
    }
  },

  /**
   * Check if a key exists in cache
   * @param key Cache key to check
   * @returns true if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get TTL (time to live) for a key in seconds
   * @param key Cache key
   * @returns TTL in seconds, -1 if key has no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  },
};

export default cacheHelper;
