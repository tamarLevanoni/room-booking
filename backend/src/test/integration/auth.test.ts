import request from "supertest";
import app from "../../app";
import "./setup";

describe("Auth API", () => {
  const email = "authrefresh@example.com";
  let refreshToken: string;
  let accessToken: string;

  it("POST /api/auth/register → creates a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Tester",
        email,
        password: "12345678",
      });

    // Debug output if test fails
    if (res.status !== 201) {
      console.log("❌ Register failed!");
      console.log("Status:", res.status);
      console.log("Response body:", JSON.stringify(res.body, null, 2));
    }

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email.toLowerCase());
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toHaveProperty("_id");
    expect(res.body.data.user).toHaveProperty("name");
  });

  it("POST /api/auth/login → logs user in", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "12345678",
      });

    // Debug output if test fails
    if (res.status !== 200) {
      console.log("❌ Login failed!");
      console.log("Status:", res.status);
      console.log("Response body:", JSON.stringify(res.body, null, 2));
    }

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Extract access token from response body
    accessToken = res.body.data.accessToken;
    expect(accessToken).toBeDefined();

    // Extract refresh token from cookie header
    const raw = res.headers["set-cookie"];
    const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const refreshCookie = cookies.find((c: string) => c.startsWith("refreshToken="));

    if (!refreshCookie) {
      throw new Error("No refreshToken cookie found in login response");
    }

    refreshToken = refreshCookie.split(";")[0].split("=")[1];
    expect(refreshToken).toBeDefined();
    expect(refreshToken.length).toBeGreaterThan(0);

    // Validate response structure
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).not.toHaveProperty("refreshToken");
  });

  it("POST /api/auth/refresh → returns new accessToken", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });
  

  it("POST /api/auth/logout → logs user out", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message.toLowerCase()).toContain("logged out");
  });
});
