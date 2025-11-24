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

**GET /api/rooms**
- Access: Public
- Input: Query params: `{ limit?, offset? }`
- Output: `{ success: true, data: { rooms: Room[] } }`
- Notes: Cache for 5 minutes in Redis

**GET /api/rooms/search**
- Access: Public
- Input: Query params: `{ city?, country?, capacity?, start?, end? }`
- Output: `{ success: true, data: { rooms: Room[] } }`
- Notes: Filtering done in-memory on cached room list. No availability returned. All filters are optional.
- Validation: If start/end provided, validate startDate < endDate

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

### Booking Creation (Atomic Operation)
```
1. Verify room exists
2. Use findOneAndUpdate with upsert:
   - Query: roomId + status='CONFIRMED' + NO overlap exists
   - Update: $setOnInsert with booking details
   - Options: upsert=true
3. If operation succeeds → booking created
4. If no document returned → conflict exists, return 409
5. Return booking
```

**Atomicity Guarantee:**
- MongoDB's findOneAndUpdate is atomic
- Only one operation succeeds when multiple requests overlap
- No race conditions possible

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

**Atomic Booking Logic (Recommended)**

Booking creation uses a single atomic conditional operation that guarantees only one booking can succeed when two requests overlap.

**Implementation:**
```typescript
// Pseudo code in service
async function createBooking(userId, roomId, startDate, endDate) {
  // First, verify room exists
  const room = await Room.findById(roomId);
  if (!room) throw NotFoundError;

  // Search for overlapping booking and create atomically
  const result = await Booking.findOneAndUpdate(
    {
      roomId,
      status: 'CONFIRMED',
      // Check if NO overlapping booking exists
      $nor: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
      ]
    },
    {
      $setOnInsert: {
        userId,
        roomId,
        startDate,
        endDate,
        status: 'CONFIRMED',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  // If no document was found/created, conflict exists
  if (!result) {
    throw ConflictError('Room already booked for selected dates');
  }

  return result;
}
```

**How It Works:**
1. Search for overlapping bookings: `startDate < requestedEnd AND endDate > requestedStart`
2. If no conflict exists, create booking using `upsert: true`
3. MongoDB guarantees atomicity - only one operation succeeds
4. No need for replica set or transactions

**Expected Behavior on Conflict:**
- First atomic update succeeds
- Second receives conflict response
- Client displays "Room no longer available"

**Optimistic Locking (Optional Enhancement):**
- Use `version` field
- Increment on update with `$inc`
- Helpful for updates, not required for booking creation

