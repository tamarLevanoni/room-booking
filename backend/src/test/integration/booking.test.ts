import request from "supertest";
import app from "../../app";
import "./setup";
import { createAuthenticatedUser, createTestRoom } from "./setup";
import mongoose from "mongoose";

describe("POST /api/bookings", () => {
  let roomId: string;
  let authToken: string;

  beforeAll(async () => {
    const auth = await createAuthenticatedUser("booking-test@example.com");
    authToken = auth.authToken;

    const room = await createTestRoom();
    roomId = room._id.toString();
  });

  it("should create a booking successfully (201)", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId,
        startDate: "2024-01-01T10:00:00.000Z",
        endDate: "2024-01-01T12:00:00.000Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.booking.roomId).toBe(roomId);
  });

  it("should reject booking when no auth token is provided (401)", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({
        roomId,
        startDate: "2024-01-01T10:00:00.000Z",
        endDate: "2024-01-01T12:00:00.000Z",
      });

    expect(res.status).toBe(401);
  });



  it("should reject if room does not exist (404)", async () => {
    const fakeRoomId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId: fakeRoomId,
        startDate: "2024-01-01T10:00:00.000Z",
        endDate: "2024-01-01T12:00:00.000Z",
      });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Room not found");
  });

  it("should reject overlapping bookings (409)", async () => {
    // First booking (valid)
    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId,
        startDate: "2024-01-02T10:00:00.000Z",
        endDate: "2024-01-02T12:00:00.000Z",
      });

    // Second overlapping booking
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        roomId,
        startDate: "2024-01-02T11:00:00.000Z",
        endDate: "2024-01-02T13:00:00.000Z",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Room already booked for selected dates");
  });
});
