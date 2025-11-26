// ------------------------------------------------------
// 1. Import vitest FIRST for hoisting
// ------------------------------------------------------
import { vi, beforeAll, afterAll } from "vitest";

// ------------------------------------------------------
// 2. Mock Redis BEFORE any other imports
// ------------------------------------------------------
vi.mock("../../utils/redisClient", () => {
  const store = new Map<string, string>();

  const mockRedis = {
    isOpen: true,

    connect: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined),
    flushDb: vi.fn().mockImplementation(async () => {
      store.clear();
      return "OK";
    }),

    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return "OK";
    }),
    setEx: vi.fn(async (key: string, _seconds: number, value: string) => {
      store.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key: string | string[]) => {
      if (Array.isArray(key)) {
        let count = 0;
        key.forEach(k => {
          if (store.delete(k)) count++;
        });
        return count;
      }
      return store.delete(key) ? 1 : 0;
    }),
    exists: vi.fn(async (key: string) => (store.has(key) ? 1 : 0)),

    keys: vi.fn(async (pattern: string) => {
      const all = Array.from(store.keys());
      if (pattern === "*") return all;

      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      return all.filter((k) => regex.test(k));
    }),

    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    on: vi.fn(),
  };

  return {
    default: mockRedis,
    connectRedis: vi.fn().mockResolvedValue(undefined),
    disconnectRedis: vi.fn().mockResolvedValue(undefined),
  };
});

// ------------------------------------------------------
// 3. Load env and other imports AFTER mocking
// ------------------------------------------------------
import mongoose from "mongoose";
import dotenv from "dotenv";
import request from "supertest";
import { Room } from "../../models/Room";
import { IRoom } from "../../types";
import { User } from "../../models/User";

dotenv.config();

// ------------------------------------------------------
// 4. Import app AFTER mocking Redis
// ------------------------------------------------------
import app from "../../app";

// ------------------------------------------------------
// 4. Helpers
// ------------------------------------------------------

export async function createTestRoom(roomData?: {
  name?: string;
  city?: string;
  country?: string;
  capacity?: number;
}): Promise<IRoom> {
  const room = new Room({
    name: roomData?.name ?? "Test Room",
    city: roomData?.city ?? "Tel Aviv",
    country: roomData?.country ?? "Israel",
    capacity: roomData?.capacity ?? 10,
  });

  return room.save();
}

export async function createAuthenticatedUser(
  email: string = "test@example.com"
) {
  await User.deleteOne({ email });

  const registerRes = await request(app).post("/api/auth/register").send({
    email,
    password: "12345678",
    name: "Test User",
  });

  if (registerRes.status !== 201) {
    throw new Error("Failed to register user: " + JSON.stringify(registerRes.body));
  }

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "12345678",
  });

  if (loginRes.status !== 200) {
    throw new Error("Failed to login: " + JSON.stringify(loginRes.body));
  }

  const authToken = loginRes.body.data.accessToken;

  // Extract refresh cookie
  const raw = loginRes.headers["set-cookie"];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));

  if (!refreshCookie) {
    throw new Error("refreshToken cookie missing");
  }

  return { authToken, refreshCookie };
}

// ------------------------------------------------------
// 5. Global Setup: Mongo only (not Redis, because Redis is mocked)
// ------------------------------------------------------
beforeAll(async () => {
  const mongoUri =
    process.env.MONGODB_TEST_URI ||
    process.env.MONGODB_URI?.replace("//mongo:", "//localhost:") ||
    "mongodb://localhost:27017/roombooking-test";

  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 12000,
      });
      console.log("[SETUP] Connected to MongoDB");
    } catch (err) {
      console.error("[SETUP] MongoDB connect failed:", err);
      throw err;
    }
  }
});


// ------------------------------------------------------
// 6. Cleanup
// ------------------------------------------------------
afterAll(async () => {
  // Drop DB
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log("[CLEANUP] MongoDB dropped");
    }
  } catch (err) {
    console.warn("[CLEANUP] Mongo drop failed:", err);
  }

  // Close Mongo
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("[CLEANUP] MongoDB closed");
    }
  } catch (err) {
    console.warn("[CLEANUP] Mongo close failed:", err);
  }
});
