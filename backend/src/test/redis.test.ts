import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from 'redis';

describe('Redis Connection', () => {
  let client: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Use localhost instead of docker service name
    const redisUrl = 'redis://localhost:6379';
    client = createClient({ url: redisUrl });
  });

  afterAll(async () => {
    if (client?.isOpen) {
      await client.quit();
    }
  });

  it('should connect to Redis successfully', async () => {
    await client.connect();
    expect(client.isOpen).toBe(true);

    console.log('✅ Redis is connected and ready for tests');
  });
});
