import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
  console.log('Redis Client Reconnecting');
});

let isConnecting = false;

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    await redisClient.connect();
    console.log('Redis connection established successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis connection closed gracefully');
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

export default redisClient;
