# Room Booking Platform

A full-stack room booking application with React frontend, Node.js/Express backend, MongoDB, and Redis.

## Quick Start with Docker

**The simplest way to run the entire application:**

### Prerequisites

- Docker and Docker Compose installed
- That's it! No need to install Node.js, MongoDB, or Redis locally.

### Running the Application

1. Clone the repository and navigate to the project root

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:3000
   - **MongoDB**: localhost:27017
   - **Redis**: localhost:6379

**MongoDB and Redis URLs are pre-configured** - no manual configuration needed!

### Common Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Seed database with sample rooms
docker-compose exec backend npm run seed

# Run backend tests
docker-compose exec backend npm test

# Access MongoDB shell
docker-compose exec mongo mongosh roombooking

# Access Redis CLI
docker-compose exec redis redis-cli
```

## Project Structure

```
room-booking/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/            # Node.js + Express + TypeScript
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml  # Orchestrates all services
└── README.md          # This file
```

## Services

### Frontend
- **Technology**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Port**: 80
- **Environment**: VITE_API_URL automatically configured for Docker

### Backend
- **Technology**: Node.js 20, Express, TypeScript, Mongoose, Redis
- **Port**: 3000
- **Features**: JWT auth, rate limiting, caching, atomic bookings

### MongoDB
- **Version**: 7
- **Port**: 27017
- **Database**: roombooking
- **Persistence**: Docker volume `mongo-data`

### Redis
- **Version**: 7
- **Port**: 6379
- **Purpose**: Caching room data and rate limiting
- **Persistence**: Docker volume `redis-data`

## Environment Variables

The docker-compose.yml file includes sensible defaults. For production, override these:

```bash
# Create .env file in project root
JWT_SECRET=your-production-secret-min-32-characters
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters
```

All MongoDB and Redis connection strings are automatically configured using Docker service names.

## Architecture

The application uses Docker service names for inter-service communication:
- Backend connects to `mongodb://mongo:27017` (not localhost)
- Backend connects to `redis://redis:6379` (not localhost)
- Frontend proxies API requests to `http://backend:3000`

This is all configured automatically in [docker-compose.yml](docker-compose.yml).

## API Documentation

### Health Check
```
GET http://localhost:3000/health
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Rooms (Public)
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/search` - Search rooms
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/availability` - Check availability

### Bookings (Authenticated)
- `POST /api/bookings` - Create new booking

For detailed API documentation, see [backend/README.md](backend/README.md).

## Development Workflow

### Making Code Changes

1. **Backend changes**: 
   ```bash
   # Edit files in ./backend/src/
   # Rebuild the backend image so changes take effect
   docker compose build --no-cache backend
   docker compose up -d backend

   # View backend logs
   docker compose logs -f backend

   ```

2. **Frontend changes**: Rebuild required
   ```bash
   # Edit files in ./frontend/src/
   docker-compose up -d --build frontend
   ```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Backend tests with coverage
docker-compose exec backend npm run test:coverage

# Frontend tests (when implemented)
docker-compose exec frontend npm test
```

### Database Operations

```bash
# Seed sample rooms
docker-compose exec backend npm run seed

# Access MongoDB directly
docker-compose exec mongo mongosh roombooking

# Export database
docker-compose exec mongo mongodump --db=roombooking --out=/data/backup

# Clear all data
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If ports 80, 3000, 27017, or 6379 are in use:

```bash
# Find and kill process on port
lsof -ti:3000 | xargs kill

# Or change ports in docker-compose.yml
```

### Services Not Starting

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs

# Restart specific service
docker-compose restart backend
```

### Clear Everything and Start Fresh

```bash
# Stop services and remove volumes
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all -v

# Rebuild from scratch
docker-compose up -d --build
```

### Backend Can't Connect to MongoDB/Redis

The backend uses Docker service names (`mongo` and `redis`). These only work inside Docker networks. If you see connection errors:

1. Ensure all services are in the same network
2. Check that MongoDB and Redis are healthy:
   ```bash
   docker-compose ps
   ```
3. Verify network connectivity:
   ```bash
   docker-compose exec backend ping mongo
   docker-compose exec backend ping redis
   ```

## Production Deployment

For production:

1. Set strong JWT secrets in `.env` file
2. Change `NODE_ENV=production` in docker-compose.yml
3. Update `CORS_ORIGIN` to your frontend domain
4. Use Docker secrets or environment variables from your hosting platform
5. Consider using Docker Swarm or Kubernetes for orchestration
6. Set up proper backup strategies for MongoDB

## License

ISC
