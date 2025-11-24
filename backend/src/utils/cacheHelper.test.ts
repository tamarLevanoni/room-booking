import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import redisClient, { connectRedis, disconnectRedis } from './redisClient';
import cacheHelper from './cacheHelper';

describe('Cache Helper', () => {
  beforeAll(async () => {
    // Connect to Redis before running tests
    await connectRedis();
  });

  afterAll(async () => {
    // Disconnect from Redis after all tests
    await disconnectRedis();
  });

  beforeEach(async () => {
    // Clear all test keys before each test
    const keys = await redisClient.keys('test:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  });

  describe('set and get', () => {
    it('should set and get a string value', async () => {
      const key = 'test:string';
      const value = 'hello world';

      await cacheHelper.set(key, value);
      const result = await cacheHelper.get<string>(key);

      expect(result).toBe(value);
    });

    it('should set and get an object value', async () => {
      const key = 'test:object';
      const value = { id: 1, name: 'Test', active: true };

      await cacheHelper.set(key, value);
      const result = await cacheHelper.get<typeof value>(key);

      expect(result).toEqual(value);
    });

    it('should set and get an array value', async () => {
      const key = 'test:array';
      const value = [1, 2, 3, 4, 5];

      await cacheHelper.set(key, value);
      const result = await cacheHelper.get<number[]>(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheHelper.get('test:nonexistent');
      expect(result).toBeNull();
    });

    it('should respect custom TTL', async () => {
      const key = 'test:ttl';
      const value = 'expires soon';
      const ttl = 1; // 1 second

      await cacheHelper.set(key, value, ttl);

      // Should exist immediately
      let result = await cacheHelper.get<string>(key);
      expect(result).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired
      result = await cacheHelper.get<string>(key);
      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = 'to be deleted';

      await cacheHelper.set(key, value);

      // Verify it exists
      let result = await cacheHelper.get<string>(key);
      expect(result).toBe(value);

      // Delete it
      await cacheHelper.del(key);

      // Verify it's gone
      result = await cacheHelper.get<string>(key);
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all keys matching a pattern', async () => {
      // Set multiple keys
      await cacheHelper.set('test:clear:1', 'value1');
      await cacheHelper.set('test:clear:2', 'value2');
      await cacheHelper.set('test:clear:3', 'value3');
      await cacheHelper.set('test:other', 'should not be deleted');

      // Clear pattern
      await cacheHelper.clear('test:clear:*');

      // Verify clear:* keys are gone
      expect(await cacheHelper.get('test:clear:1')).toBeNull();
      expect(await cacheHelper.get('test:clear:2')).toBeNull();
      expect(await cacheHelper.get('test:clear:3')).toBeNull();

      // Verify other key still exists
      expect(await cacheHelper.get('test:other')).toBe('should not be deleted');
    });

    it('should handle clearing with no matching keys', async () => {
      await expect(cacheHelper.clear('test:nomatch:*')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      const key = 'test:exists';
      await cacheHelper.set(key, 'value');

      const exists = await cacheHelper.exists(key);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const exists = await cacheHelper.exists('test:notexists');
      expect(exists).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return TTL for key with expiration', async () => {
      const key = 'test:ttl-check';
      const ttl = 60;

      await cacheHelper.set(key, 'value', ttl);
      const remainingTtl = await cacheHelper.ttl(key);

      expect(remainingTtl).toBeGreaterThan(0);
      expect(remainingTtl).toBeLessThanOrEqual(ttl);
    });

    it('should return -2 for non-existent key', async () => {
      const ttl = await cacheHelper.ttl('test:nokey');
      expect(ttl).toBe(-2);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const key = 'test:malformed';

      // Manually set invalid JSON
      await redisClient.set(key, 'invalid json {');

      const result = await cacheHelper.get(key);
      expect(result).toBeNull();
    });
  });
});
