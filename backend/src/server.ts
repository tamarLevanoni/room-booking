import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectRedis } from "./utils/redisClient";
import app from "./app";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "3000", 10);

async function startServer() {
  try {
    // Mongo
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/roombooking";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || "10", 10),
    });
    console.log("✓ Connected to MongoDB");

    // Redis
    console.log("Connecting to Redis...");
    await connectRedis();
    console.log("✓ Connected to Redis");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ API available at: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\nSIGTERM received, shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server ONLY when run directly
if (require.main === module) {
  startServer();
}

export { startServer };
