FROM node:20-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (keep dev dependencies for seed script)
RUN npm ci

# Copy source code (excluding dist to force clean build)
COPY src ./src
COPY tsconfig.json ./
COPY docker-entrypoint.sh ./

# Build TypeScript
RUN npm run build

# Copy entrypoint script to system path
RUN cp docker-entrypoint.sh /usr/local/bin/ && chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
