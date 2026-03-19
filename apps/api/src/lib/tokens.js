// Token utilities for JWT access tokens and secure random tokens.
//
// Access tokens (JWT): Short-lived (15 min), sent in Authorization header.
//   Contains userId so the server knows who's making the request.
//
// Refresh tokens: Long-lived (7 days), used to get new access tokens.
//   Stored as SHA-256 hash in DB so a DB leak doesn't expose raw tokens.
//
// Reset tokens: One-time use, expire in 1 hour. Also stored hashed.

import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";

// --- JWT Access Tokens ---

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

// Verify and decode a JWT. Returns the payload { sub: userId } or throws.
export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// --- Random Tokens (for refresh + password reset) ---

// Generate a cryptographically secure random token (hex string).
export function generateRandomToken() {
  return randomBytes(32).toString("hex");
}

// Hash a token with SHA-256 for safe storage in the database.
// We never store raw tokens - if the DB leaks, hashed tokens are useless.
export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
