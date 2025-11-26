import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler, notFoundHandler, generalApiLimiter } from "./middleware";

const app: Application = express();

// Security middleware
app.use(helmet());


// ---- CORS ----
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

console.log("🔒 CORS Configuration:");
console.log("   Raw ENV:", process.env.CORS_ORIGIN);
console.log("   Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`📨 CORS request from origin: "${origin}"`);

      // בקשות ללא Origin (Postman / curl / mobile apps)
      if (!origin) {
        console.log("   ✅ Allowed: no origin");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log(`   ✅ Allowed origin: ${origin}`);
        return callback(null, true);  // <-- הנקודה הקריטית! לא origin
      }

      console.log(`   ❌ Rejected origin: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true
  })
);


// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use("/api", generalApiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
