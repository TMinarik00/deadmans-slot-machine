// Auth middleware - protects routes that require login.
// Reads the JWT from the Authorization header ("Bearer <token>"),
// verifies it, and attaches the userId to req.userId.
// If the token is missing or invalid, returns 401.

import { verifyAccessToken } from "../lib/tokens.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.userId = payload.sub; // sub = subject = userId
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
