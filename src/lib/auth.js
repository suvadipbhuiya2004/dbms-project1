import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return null;
  }
};

// Extract token from request
const extractToken = (request) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Cookie fallback
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] ?? null;
};

// Get user from request
const getUserFromRequest = (request) => {
  const token = extractToken(request);
  if (!token) return null;

  return verifyToken(token);
};

export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserFromRequest,
};
