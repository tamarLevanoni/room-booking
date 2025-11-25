# 2. Backend Specification

## 2.1 Architecture

**Stack:**
- Node.js + TypeScript
- Express.js

**Layer Structure:**
```
routes/        → API endpoints, request validation
services/      → Business logic
repositories/  → Database access (Mongoose)
middleware/    → Auth, error handling, rate limiting
utils/         → Helpers, validators
```

**Principles:**
- Stateless (no in-memory sessions)
- RESTful API
- Single responsibility per layer
- Dependency injection ready

## 2.2 API Specification

### Authentication Endpoints

**POST /api/auth/register**
- Access: Public
- Input: `{ email, password, name }`
- Output: `{ success: true, data: { user } }`
- Validation: Zod schema, password min 8 chars
- Notes: Hash password with bcrypt (rounds: 10). Does not return tokens - user must login after registration.

**POST /api/auth/login**
- Access: Public
- Input: `{ email, password }`
- Output: `{ success: true, data: { user, accessToken, refreshToken } }`
- Notes: Return 401 on invalid credentials

**POST /api/auth/refresh**
- Access: Public
- Input: `{ refreshToken }`
- Output: `{ success: true, data: { accessToken } }`
- Notes: Validate refresh token, issue new access token

### Room Endpoints

**GET /api/rooms/search**
- Access: Public
- Input: Query params: `{ city?, country?, capacity?, limit?, offset? }`
- Output: `{ success: true, data: { rooms: Room[] } }`
- Notes:
  - **Current strategy (< 10K rooms):** Caches all rooms in 'rooms:all' for 5 minutes, filters in-memory, applies pagination
  - **Default pagination:** limit=5 (DEFAULT_PAGE_SIZE env), max=100 (MAX_PAGE_SIZE env)
  - **Future optimization (10K+ rooms):** Move to DB filtering with indexes, cache per filter combination
  - All filters optional
- Validation: None required (all optional params)

**GET /api/rooms/:id**
- Access: Public
- Input: Path param: `id`
- Output: `{ success: true, data: { room: Room } }`
- Notes: Cache for 5 minutes

**GET /api/rooms/:id/availability**
- Access: Public
- Input: Query params: `{ startDate: ISO8601, endDate: ISO8601 }`
- Output: `{ success: true, data: { is_available: boolean} }`
- Notes: Direct DB read. No caching.
- Validation: startDate < endDate

### Booking Endpoints

**POST /api/bookings**
- Access: Authenticated
- Input: `{ roomId, startDate: ISO8601, endDate: ISO8601 }`
- Output: `{ success: true, data: { booking: Booking } }`
- Notes:
  - Use atomic findOneAndUpdate with upsert
  - Check availability and insert in single atomic operation
  - Return 409 on conflict
  - No transaction required
- Validation: Room exists, dates valid, no overlap

## 2.3 Business Logic

### Availability Check
```
1. Parse startDate, endDate
2. Validate: endDate > startDate
3. Query bookings: {
     roomId: roomId,
     status: 'CONFIRMED',
     $or: [
       { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
     ]
   }
4. If results.length > 0 → unavailable
5. Return is_available: true
```

### Booking Creation (Transaction-Based)
```
1. Verify room exists
2. Start MongoDB transaction
3. Within transaction:
   - Check for overlapping bookings with status='CONFIRMED'
   - If overlap found → return null → 409
   - If no overlap → create booking
4. Commit transaction
5. Return booking
```

**Atomicity Guarantee:**
- MongoDB transactions provide ACID guarantees
- Read and write are isolated within transaction
- Concurrent requests each see consistent snapshot
- Zero race conditions

### Overlap Detection (MongoDB Query)
```javascript
Booking.find({
  roomId: roomId,
  status: 'CONFIRMED',
  $or: [
    { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
  ]
})
```

## 2.4 Authentication

**JWT Strategy:**
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Payload: `{ userId: string, iat, exp }`

**Token Storage:**
- Client: localStorage or memory (both access token and refresh token)
- Server: No storage (stateless)

**Middleware:**
```typescript
// middleware/auth.ts
- Extract token from Authorization header
- Verify with JWT secret
- Attach userId to req.user
- Return 401 on invalid/expired token
```

**Token Rotation:**
- On /auth/refresh: issue new access token
- Keep same refresh token (no rotation for simplicity)

## 2.5 Database Schema

### Users Collection
```typescript
interface User {
  _id: ObjectId
  email: string       // unique
  password: string    // bcrypt hashed
  name: string
  createdAt: Date
  updatedAt: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
```

### Rooms Collection
```typescript
interface Room {
  _id: ObjectId
  name: string
  city: string
  country: string
  capacity: number
  createdAt: Date
  updatedAt: Date
}

// Indexes
db.rooms.createIndex({ name: 1 })
db.rooms.createIndex({ city: 1, country: 1 })  // Fast geographic filtering
```

### Bookings Collection
```typescript
interface Booking {
  _id: ObjectId
  userId: ObjectId    // reference to User
  roomId: ObjectId    // reference to Room
  startDate: Date
  endDate: Date
  status: 'CONFIRMED' | 'CANCELLED'
  version: number     // for optimistic locking
  createdAt: Date
  updatedAt: Date
}

// Indexes
db.bookings.createIndex({ userId: 1 })  // Speeds up user booking retrieval
db.bookings.createIndex({ roomId: 1, startDate: 1, endDate: 1 })  // Required for overlap detection
db.bookings.createIndex({ roomId: 1, startDate: 1, endDate: 1 }, { unique: true })  // Prevents exact duplicates

// Optional: TTL index for expired bookings (future enhancement)
// db.bookings.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 })
```

**Indexing Strategy:**
- **User.email:** unique index for login
- **Room.city + country:** composite index supports fast geographic filtering (for /rooms/search)
- **Booking.userId:** speeds up user booking retrieval
- **Booking.roomId + startDate + endDate:** compound index required for overlap detection during booking creation
- **Unique constraint:** (roomId, startDate, endDate) prevents exact duplicates


## 2.6 Concurrency

**Transaction-Based Booking Logic**

Booking creation uses MongoDB transactions to ensure the check and insert happen atomically with zero race conditions.

**Requirements:**
- MongoDB Replica Set or standalone with replica set mode
- MongoDB 4.0 or higher

**Implementation:**
```typescript
// In repository
async function createBooking(userId, roomId, startDate, endDate) {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // Check for overlapping bookings within transaction
      const overlapping = await Booking.find({
        roomId,
        status: 'CONFIRMED',
        $or: [
          { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
      }).session(session);

      if (overlapping.length > 0) {
        // Conflict detected
        return null;
      }

      // Create booking within transaction
      const [booking] = await Booking.create([{
        userId,
        roomId,
        startDate,
        endDate,
        status: 'CONFIRMED',
        version: 1
      }], { session });

      return booking;
    });

    return result;
  } finally {
    session.endSession();
  }
}
```

**How It Works:**
1. Start MongoDB transaction
2. Check for overlapping bookings: `startDate < requestedEnd AND endDate > requestedStart`
3. If overlap exists, return null (no commit needed)
4. If no overlap, create booking in same transaction
5. Transaction commits atomically - both read and write are isolated
6. Zero race conditions - MongoDB guarantees ACID

**Expected Behavior:**
- First request: checks, finds no overlap, creates booking, commits
- Second concurrent request: checks within its transaction, sees committed booking, returns null → 409
- Client displays "Room already booked for selected dates"

