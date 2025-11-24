# Room Booking Backend API

A scalable RESTful API for room booking system built with Node.js, Express, TypeScript, MongoDB, and Redis.

## Features

- User authentication with JWT (access & refresh tokens)
- Room search and availability checking
- Atomic booking creation (prevents race conditions)
- Redis caching for improved performance
- Rate limiting and security middleware
- Comprehensive input validation with Zod
- TypeScript for type safety
- Layered architecture (routes → services → repositories)

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Cache:** Redis
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcrypt
- **Testing:** Vitest, Supertest

## Prerequisites

- Docker and Docker Compose

## Quick Start with Docker (Recommended)

**The easiest way to run the entire application:**

1. From the project root:
   ```bash
   docker-compose up -d
   ```

This automatically starts:
- Backend API on http://localhost:3000
- Frontend on http://localhost (port 80)
- MongoDB on port 27017
- Redis on port 6379

**No manual configuration needed!** MongoDB and Redis URLs are pre-configured in docker-compose.yml.

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Seed database with sample rooms
docker-compose exec backend npm run seed
```


## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response includes `accessToken` and `refreshToken`.

#### Refresh Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Room Endpoints (Public)

#### Get All Rooms
```http
GET /api/rooms?limit=10&offset=0
```

#### Search Rooms
```http
GET /api/rooms/search?city=Miami&country=USA&capacity=2&start=2025-01-01&end=2025-01-05
```

#### Get Room by ID
```http
GET /api/rooms/:id
```

#### Check Room Availability
```http
GET /api/rooms/:id/availability?startDate=2025-01-01&endDate=2025-01-05
```

### Booking Endpoints (Authenticated)

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "roomId": "507f1f77bcf86cd799439011",
  "startDate": "2025-01-01T15:00:00Z",
  "endDate": "2025-01-05T11:00:00Z"
}
```

## Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose schemas (User, Room, Booking)
│   ├── repositories/    # Database access layer
│   ├── services/        # Business logic layer
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware (auth, validation, errors)
│   ├── utils/           # Helper functions and utilities
│   ├── types/           # TypeScript type definitions
│   ├── scripts/         # Utility scripts (seedRooms.ts)
│   └── index.ts         # Application entry point
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## Architecture

### Layered Architecture
- **Routes Layer:** Request validation, response formatting
- **Services Layer:** Business logic, orchestration
- **Repositories Layer:** Database operations
- **Models Layer:** MongoDB schemas and types

### Key Design Patterns
- **Repository Pattern:** Abstracts database operations
- **Singleton Pattern:** Services and repositories
- **Middleware Pattern:** Authentication, validation, error handling
- **Factory Pattern:** Validation middleware

### Atomic Booking Logic
Uses MongoDB's `findOneAndUpdate` with `upsert` to prevent race conditions:
- Checks for availability and creates booking in single atomic operation
- Only one concurrent request succeeds
- No need for transactions or distributed locks

## Security Features

- **JWT Authentication:** Access tokens (15 min) + refresh tokens (7 days)
- **Password Hashing:** bcrypt with configurable rounds
- **Rate Limiting:** Different limits for auth, booking, and general API
- **Input Validation:** Zod schemas for all endpoints
- **Security Headers:** Helmet middleware
- **CORS Protection:** Configurable origin whitelist
- **Error Handling:** Sanitized error messages in production

## Caching Strategy

- **Room List:** 5 minutes TTL
- **Room Details:** 5 minutes TTL
- **Availability Checks:** No caching (always fresh)
- **Cache Invalidation:** Automatic after booking creation

## Environment Variables

See `.env.example` for all available configuration options.

Critical settings:
- `JWT_SECRET` - Must be strong (32+ characters)
- `JWT_REFRESH_SECRET` - Separate secret for refresh tokens
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string

## Testing

The project uses Vitest for testing. Tests cover:
- Unit tests for services and repositories
- Integration tests for API endpoints
- Concurrency tests for atomic booking operations

Run specific test file:
```bash
npm test -- <filename>
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Redis Connection Issues
- Ensure Redis is running
- Check `REDIS_URL` in `.env`
- Try: `redis-cli ping` to test connection

### Port Already in Use
- Change `PORT` in `.env`
- Kill process using the port: `lsof -ti:3000 | xargs kill`

## Development Guidelines

- Follow TypeScript strict mode
- Use async/await for all asynchronous operations
- Always validate user input with Zod schemas
- Write tests for new features
- Use proper error handling (throw AppError with status codes)
- Follow existing project structure and patterns

## License

ISC
