#!/bin/bash
# Script to rebuild and restart the backend with new CORS changes

echo "Stopping backend container..."
docker compose stop backend

echo "Rebuilding backend with new code..."
docker compose build backend

echo "Starting backend..."
docker compose up -d backend

echo "Waiting for backend to start..."
sleep 3

echo "Checking backend logs..."
docker compose logs backend --tail 30
