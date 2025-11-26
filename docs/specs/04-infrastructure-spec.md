# 4. Infrastructure & DevOps Specification

## 4.1 Docker

### Backend Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD ["node", "dist/server.ts"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/roombooking
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - NODE_ENV=development
    depends_on:
      - mongo
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - backend
    networks:
      - app-network

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

volumes:
  mongo-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### Environment Variables

**.env (local dev):**
```
MONGODB_URI=mongodb://localhost:27017/roombooking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000/api
```

## 4.2 Local Development Setup

### Requirements
- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)

### Running the Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset database (remove volumes)
docker-compose down -v
```

### Development Features
- Hot reload enabled (volumes mounted for backend and frontend)
- MongoDB standalone (no replica set needed)
- Redis single instance
- Backend: http://localhost:3000
- Frontend: http://localhost:80

## 4.3 Backend Configuration

### Folder Structure
```
backend/
├── src/
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   ├── repositories/  # Database access
│   ├── middleware/    # Auth, error handling
│   ├── utils/         # Helpers
│   └── index.ts       # Entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Health Check Endpoint
```typescript
// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### Database Connection
```typescript
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI!, {
  maxPoolSize: 10
});
```

### Redis Connection
```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.connect();
```

## 4.4 Frontend Configuration

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4.5 Database Strategy

### MongoDB
- Standalone instance (no replica set required)
- Connection pooling: maxPoolSize=10 per instance
- Collections: users, rooms, bookings
- Indexes created on application startup

### Redis
- Single instance
- TTL-based expiry (automatic cleanup)
- Cache keys pattern: `room:{id}`
- Used for room list caching (5 min TTL)

## 4.6 Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```
