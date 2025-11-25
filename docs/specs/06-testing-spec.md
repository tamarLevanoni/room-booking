# 6. Testing Specification

## 6.1 Backend Tests

### Unit Tests

**Services Layer:**
- `authService.register()`
  - ✓ Creates user with hashed password
  - ✓ Returns user (no tokens)
  - ✓ Throws error on duplicate email
  - ✓ Validates password strength (min 8 chars)

- `authService.login()`
  - ✓ Returns user + tokens on valid credentials
  - ✓ Throws 401 on invalid email
  - ✓ Throws 401 on wrong password

- `bookingService.createBooking()`
  - ✓ Creates booking when room available (atomic operation)
  - ✓ Throws 409 on overlapping booking
  - ✓ Validates date range (start < end)
  - ✓ Validates room exists
  - ✓ Clears room cache after creation

- `roomService.checkAvailability()`
  - ✓ Returns true when no conflicts
  - ✓ Returns false when booking exists for dates
  - ✓ Returns false when booking overlaps partially
  - ✓ No caching (direct DB read)

### Integration Tests

**API Endpoints:**

**POST /api/auth/register:**
- ✓ Returns 201 + user (no tokens) on valid input
- ✓ Returns 400 on invalid email format
- ✓ Returns 400 on short password (< 8 chars)
- ✓ Returns 409 on duplicate email
- ✓ Hashes password (not stored plain)

**POST /api/auth/login:**
- ✓ Returns 200 + user + tokens on valid credentials
- ✓ Returns 401 on non-existent email
- ✓ Returns 401 on wrong password

**POST /api/auth/refresh:**
- ✓ Returns 200 + new accessToken on valid refreshToken
- ✓ Returns 401 on invalid refreshToken
- ✓ Returns 401 on expired refreshToken

**GET /api/rooms:**
- ✓ Returns all rooms
- ✓ Returns cached result (5 min TTL)
- ✓ Supports limit/offset pagination

**GET /api/rooms/search:**
- ✓ Filters by city
- ✓ Filters by country
- ✓ Filters by capacity
- ✓ Filters by date range (start/end)
- ✓ Returns empty array when no matches
- ✓ Uses cached room list

**GET /api/rooms/:id:**
- ✓ Returns room by id
- ✓ Returns 404 when room not found
- ✓ Returns cached result (5 min TTL)

**GET /api/rooms/:id/availability:**
- ✓ Returns available: true when no bookings
- ✓ Returns available: false when bookings exist
- ✓ Returns 400 on invalid date range (start >= end)
- ✓ No caching (direct DB read)

**POST /api/bookings:**
- ✓ Returns 201 + booking when authenticated + room available
- ✓ Returns 401 when no token provided
- ✓ Returns 404 when room doesn't exist
- ✓ Returns 400 when startDate >= endDate
- ✓ Returns 409 when room already booked

### Concurrency Tests

**Concurrent Booking Attempts:**
- ✓ Two simultaneous requests for same room/dates
- ✓ First request succeeds (201)
- ✓ Second request fails (409)
- ✓ Database has only one booking created
- ✓ No duplicate bookings or race conditions

**Atomic Operation Verification:**
- ✓ findOneAndUpdate with upsert is atomic
- ✓ $nor condition prevents overlapping bookings
- ✓ Only one operation succeeds on conflict
- ✓ No need for transactions or replica sets

### Test Setup

**Mock Database:**
- Use mongodb-memory-server for fast in-memory tests
- Or: Docker MongoDB container (closer to production)
- Reset DB between test suites
- Create indexes before tests

**Mock Redis:**
- Use redis-mock or ioredis-mock
- Clear cache between tests

**Fixtures:**
- Seed test users (hashed passwords)
- Seed test rooms
- Helper functions: `createTestUser()`, `createTestRoom()`, `createTestBooking()`

**Example Setup:**
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createClient } from 'redis-mock';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

## 6.2 Frontend Tests

### Component Tests

**RoomCard Component:**
- ✓ Renders room name, city, country, capacity
- ✓ Navigates to room details on click

**RoomList Page:**
- ✓ Renders room grid
- ✓ Shows search filters
- ✓ Calls search API on filter change
- ✓ Shows "No rooms found" when empty

**RoomDetails Page:**
- ✓ Displays room info
- ✓ Shows date picker
- ✓ Enables "Check Availability" button when dates selected
- ✓ Shows "Book Now" button when available
- ✓ Shows "Not available" message when unavailable
- ✓ Opens booking modal on "Book Now" click

**BookingModal Component:**
- ✓ Displays room name, dates, user name (read-only)
- ✓ Enables "Confirm Booking" button
- ✓ Shows "Cancel" button
- ✓ Disables buttons during API call
- ✓ Closes modal on success
- ✓ Shows error message on API failure

### Form Validation Tests

**Login Form:**
- ✓ Shows error on empty email
- ✓ Shows error on invalid email format
- ✓ Shows error on empty password
- ✓ Submits when fields valid

**Register Form:**
- ✓ Validates email format
- ✓ Validates password length (min 8)
- ✓ Validates name presence
- ✓ Shows backend error messages

**Date Range Picker:**
- ✓ Validates startDate < endDate
- ✓ Validates startDate >= today
- ✓ Prevents submission with invalid dates

### API Interaction Tests (React Query Hooks)

**useRooms Hook:**
- ✓ Fetches rooms on mount
- ✓ Caches result (staleTime: 5 min)
- ✓ Shows loading state initially
- ✓ Shows error state on API failure

**useRoomSearch Hook:**
- ✓ Fetches filtered rooms
- ✓ Passes filters as query params
- ✓ Updates on filter change

**useRoom Hook:**
- ✓ Fetches single room by id
- ✓ Caches result (staleTime: 5 min)
- ✓ Returns 404 error when room not found

**useRoomAvailability Hook:**
- ✓ Fetches availability on demand
- ✓ No caching (always fresh)
- ✓ Returns available boolean
- ✓ Handles 409 conflict gracefully

**useCreateBooking Hook:**
- ✓ Creates booking
- ✓ Invalidates room queries after success
- ✓ Shows success message
- ✓ Shows conflict error on 409

### Rendering & UX States

**Room List Page:**
- ✓ Shows skeleton loaders while fetching
- ✓ Renders room grid after load
- ✓ Shows "No rooms available" when empty
- ✓ Shows error message on API failure

**Room Details Page:**
- ✓ Shows loading spinner while fetching room
- ✓ Shows room details after load
- ✓ Shows 404 page when room not found

**Booking Flow:**
- ✓ Availability check shows loading spinner
- ✓ "Book Now" button disabled until availability confirmed
- ✓ Success toast shown after booking created
- ✓ Modal closes on success
- ✓ Shows conflict error message on 409

### Test Setup

**Mock API:**
- Use MSW (Mock Service Worker)
- Mock all API endpoints
- Return test fixtures

**React Query Setup:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

**Router Setup:**
- Wrap in MemoryRouter for route tests
- Use createMemoryRouter for testing navigation

## 6.3 Load Testing

**Booking Under Conflict:**
- Simulate 100 concurrent booking requests for same room/dates
- Verify: exactly 1 booking created
- Verify: 99 requests return 409
- Measure: response time < 500ms for p99

**Search Under Heavy Load:**
- 1000 requests/sec to GET /api/rooms
- Verify: cache hit rate > 95%
- Verify: response time < 100ms for p95

**Rate Limit Validation:**
- Send 150 requests in 1 minute to login endpoint
- Verify: rate limit kicks in (e.g., max 100/min)
- Verify: returns 429 Too Many Requests

**Tools:**
- **k6** - Load testing framework
- **artillery** - Alternative load testing tool
- **Apache Bench (ab)** - Simple benchmarking

**Example k6 Script:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '10s',
};

export default function () {
  const url = 'http://localhost:3000/api/bookings';
  const payload = JSON.stringify({
    roomId: '507f1f77bcf86cd799439011',
    startDate: '2025-01-01',
    endDate: '2025-01-05',
  });

  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <token>'
    },
  });

  check(res, {
    'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
  });
}
```

**Metrics to Track:**
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- MongoDB connections used
- Redis hit/miss ratio

## 6.4 Coverage Goals

**Backend:**
- Overall coverage: > 80%
- Critical paths (booking creation, auth): > 95%
- Services layer: > 90%
- Routes: > 80%

**Frontend:**
- Components: > 70%
- Hooks: > 80%
- Pages: > 75%

**Tools:**
- Vitest built-in coverage (via c8)
- `npm run test:coverage`
- Fail CI if coverage drops below threshold

## 6.5 Test Commands

**Backend:**
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Frontend:**
```bash
npm run test          # Run all tests
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
```

**Load Tests:**
```bash
k6 run tests/load/booking-conflict.js
k6 run tests/load/room-search.js
```
