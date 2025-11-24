# Redis Cache Utilities

This directory contains Redis caching utilities for the Room Booking System backend.

## Files

- `redisClient.ts` - Redis client singleton with connection management
- `cacheHelper.ts` - Helper functions for common caching operations
- `index.ts` - Barrel export for easy imports

## Setup

### Environment Variables

Required environment variables (add to `.env`):

```env
# Redis connection (use one of these approaches)

# Option 1: Use REDIS_URL directly
REDIS_URL=redis://localhost:6379

# Option 2: Use individual components
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache configuration
CACHE_TTL_SECONDS=300
```

### Initialize Redis Connection

In your main application file (e.g., `index.ts`):

```typescript
import { connectRedis, disconnectRedis } from './utils';

// Connect to Redis on startup
await connectRedis();

// Graceful shutdown is handled automatically by redisClient
```

## Usage Examples

### Basic Operations

```typescript
import { cacheHelper } from './utils';

// Set a value with default TTL (CACHE_TTL_SECONDS from env)
await cacheHelper.set('user:123', { id: 123, name: 'John' });

// Set a value with custom TTL (in seconds)
await cacheHelper.set('session:abc', { token: 'xyz' }, 60);

// Get a value
const user = await cacheHelper.get<User>('user:123');
if (user) {
  console.log(user.name); // 'John'
}

// Delete a single key
await cacheHelper.del('user:123');

// Clear multiple keys matching a pattern
await cacheHelper.clear('user:*'); // Deletes all user keys

// Check if key exists
const exists = await cacheHelper.exists('user:123'); // false

// Get TTL for a key
const ttl = await cacheHelper.ttl('session:abc'); // seconds remaining
```

### Caching API Responses

```typescript
import { cacheHelper } from './utils';

async function getRooms() {
  const cacheKey = 'rooms:all';

  // Try to get from cache
  const cached = await cacheHelper.get<Room[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from database
  const rooms = await Room.find();

  // Store in cache for 5 minutes
  await cacheHelper.set(cacheKey, rooms, 300);

  return rooms;
}
```

### Cache Invalidation

```typescript
import { cacheHelper } from './utils';

async function updateRoom(roomId: string, data: UpdateRoomDto) {
  // Update in database
  const room = await Room.findByIdAndUpdate(roomId, data);

  // Invalidate related caches
  await cacheHelper.del(`room:${roomId}`);
  await cacheHelper.clear('rooms:*'); // Clear all room lists

  return room;
}
```

### Namespace Patterns

Use consistent naming patterns for cache keys:

```typescript
// Single entities
const cacheKey = `room:${roomId}`;
const cacheKey = `user:${userId}`;
const cacheKey = `booking:${bookingId}`;

// Lists/collections
const cacheKey = `rooms:all`;
const cacheKey = `rooms:available:${date}`;
const cacheKey = `bookings:user:${userId}`;

// Aggregations
const cacheKey = `stats:rooms:${date}`;
const cacheKey = `stats:bookings:monthly:${month}`;
```

## API Reference

### cacheHelper.get<T>(key: string): Promise<T | null>

Get a value from cache and parse it as JSON.

- **key**: Cache key
- **Returns**: Parsed value or null if not found
- **Type Parameter**: T - Type of the cached value

### cacheHelper.set(key: string, value: any, ttl?: number): Promise<void>

Set a value in cache with optional TTL.

- **key**: Cache key
- **value**: Value to cache (will be JSON stringified)
- **ttl**: Time to live in seconds (defaults to CACHE_TTL_SECONDS env var)

### cacheHelper.del(key: string): Promise<void>

Delete a single key from cache.

- **key**: Cache key to delete

### cacheHelper.clear(pattern: string): Promise<void>

Clear cache entries matching a pattern.

- **pattern**: Pattern to match (e.g., "rooms:*", "user:123:*")

### cacheHelper.exists(key: string): Promise<boolean>

Check if a key exists in cache.

- **key**: Cache key to check
- **Returns**: true if key exists, false otherwise

### cacheHelper.ttl(key: string): Promise<number>

Get TTL (time to live) for a key in seconds.

- **key**: Cache key
- **Returns**: TTL in seconds, -1 if key has no expiry, -2 if key doesn't exist

## Testing

Run tests with:

```bash
npm test cacheHelper.test.ts
```

Make sure Redis is running locally or configure REDIS_URL to point to a test instance.

## Error Handling

All cache operations include error handling:

- Failed `get` operations return `null` instead of throwing
- Failed `set`, `del`, and `clear` operations log errors and re-throw
- Connection errors are logged by the Redis client
- Graceful shutdown is handled automatically on SIGINT/SIGTERM

## Best Practices

1. **Use consistent key naming patterns** with namespaces
2. **Set appropriate TTLs** based on data volatility
3. **Invalidate cache on updates** to maintain consistency
4. **Handle cache misses gracefully** by falling back to the database
5. **Use TypeScript generics** for type-safe cache operations
6. **Monitor Redis memory usage** in production
7. **Use patterns for bulk invalidation** (e.g., `rooms:*`)
