import request from "supertest";
import app from "../../app";
import "./setup";
import { createAuthenticatedUser } from "./setup";

describe("Rooms API", () => {
  let roomId: string;
  let authToken: string;

  beforeAll(async () => {
    const auth = await createAuthenticatedUser("rooms-test@example.com");
    authToken = auth.authToken;
  });

  describe("POST /api/rooms", () => {
    it("should return 401 when creating room without authentication", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({
          name: "Test Room",
          city: "Tel Aviv",
          country: "Israel",
          capacity: 10
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should create a new room with valid authentication and data", async () => {
      const roomData = {
        name: "Conference Room A",
        city: "Tel Aviv",
        country: "Israel",
        capacity: 10
      };

      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send(roomData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.room).toBeDefined();
      expect(res.body.data.room.name).toBe(roomData.name);
      expect(res.body.data.room.city).toBe(roomData.city);
      expect(res.body.data.room.country).toBe(roomData.country);
      expect(res.body.data.room.capacity).toBe(roomData.capacity);
      expect(res.body.data.room._id).toBeDefined();

      // Store for later tests
      roomId = res.body.data.room._id;
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          city: "Tel Aviv",
          country: "Israel",
          capacity: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when city is missing", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Room",
          country: "Israel",
          capacity: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when country is missing", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Room",
          city: "Tel Aviv",
          capacity: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when capacity is missing", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Room",
          city: "Tel Aviv",
          country: "Israel"
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when capacity is less than 1", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Room",
          city: "Tel Aviv",
          country: "Israel",
          capacity: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 when capacity is not an integer", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Room",
          city: "Tel Aviv",
          country: "Israel",
          capacity: 10.5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should trim whitespace from name, city, and country", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "  Trimmed Room  ",
          city: "  Tel Aviv  ",
          country: "  Israel  ",
          capacity: 5
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.room.name).toBe("Trimmed Room");
      expect(res.body.data.room.city).toBe("Tel Aviv");
      expect(res.body.data.room.country).toBe("Israel");
    });
  });

  it("GET /api/rooms/search → returns rooms based on query", async () => {
    const res = await request(app)
      .get("/api/rooms/search")
      .query({
        city: "Tel Aviv",
        capacity: "5"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.rooms)).toBe(true);

    if (res.body.data.rooms.length > 0) {
      roomId = res.body.data.rooms[0]._id;
    }
  });

  it("GET /api/rooms/:id → returns a room by ID", async () => {
    if (!roomId) return;

    const res = await request(app).get(`/api/rooms/${roomId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.room._id).toBe(roomId);
  });

  it("GET /api/rooms/:id/availability → requires authentication", async () => {
    if (!roomId) return;

    const res = await request(app)
      .get(`/api/rooms/${roomId}/availability`)
      .query({
        startDate: "2024-01-01T10:00:00.000Z",
        endDate: "2024-01-01T12:00:00.000Z"
      });

    // אם הקוד שלך מחזיר 401/403 למי שלא מחובר
    expect([401, 403]).toContain(res.status);
  });

  it("GET /api/rooms/:id/availability → works with Authorization", async () => {
    if (!roomId) return;

    const res = await request(app)
      .get(`/api/rooms/${roomId}/availability`)
      .set("Authorization", `Bearer ${authToken}`)
      .query({
        startDate: "2024-01-01T10:00:00.000Z",
        endDate: "2024-01-01T12:00:00.000Z"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});
