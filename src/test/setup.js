import { vi } from "vitest";

// Set environment variables for tests
process.env.JWT_SECRET = "test-secret-key";
process.env.SALT_ROUNDS = "1"; // Low rounds for faster tests
