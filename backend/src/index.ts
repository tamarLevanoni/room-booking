import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectRedis } from './utils/redisClient';
import routes from './routes';
import { errorHandler, notFoundHandler, generalApiLimiter } from './middleware';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware Setup
// ========================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting
app.use('/api', generalApiLimiter);

// ========================================
// Health Check Endpoint
// ========================================

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========================================
// API Routes
// ========================================

app.use('/api', routes);

// ========================================
// Error Handling
// ========================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ========================================
// Database and Server Initialization
// ========================================

async function startServer() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roombooking';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10', 10)
    });
    console.log('✓ Connected to MongoDB');

    // Connect to Redis
    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('✓ Connected to Redis');

    // Start Express server
    app.listen(PORT, () => {
      console.log('✓ Server is running on port ' + PORT);
      console.log('✓ Environment: ' + process.env.NODE_ENV || 'development');
      console.log('✓ API available at: http://localhost:' + PORT + '/api');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ========================================
// Graceful Shutdown
// ========================================

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
