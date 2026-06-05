import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@test.com",
        phone: "9876543210",
        password: "password123",
        role: "PASSENGER",
      });
      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@test.com");
    });

    it("should fail with duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@test.com",
        phone: "9876543210",
        password: "password123",
        role: "PASSENGER",
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email already in use");
    });

    it("should fail with invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "invalid-email",
        phone: "9876543210",
        password: "password123",
        role: "PASSENGER",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body.tokens.accessToken).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "wrongpassword",
      });
      expect(res.status).toBe(400);
    });
  });
});
