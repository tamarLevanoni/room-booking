#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."

# Wait for MongoDB to be available
until node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/roombooking').then(() => { console.log('MongoDB is ready'); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done

echo "MongoDB is ready!"

# Run seed script
echo "Running database seed..."
npm run seed

# Start the application
echo "Starting application..."
exec node dist/server.js
