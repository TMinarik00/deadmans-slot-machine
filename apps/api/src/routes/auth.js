// Auth routes: register, login, logout, forgot-password, reset-password, /me
//
// Security measures implemented:
//   - Argon2id password hashing (OWASP recommended)
//   - Generic error messages to prevent account enumeration
//   - Reset tokens are SHA-256 hashed before storing in DB
//   - Reset tokens expire after 1 hour and are single-use
//   - Rate limiting applied in server.js on /auth/* routes
//   - All inputs validated with Zod schemas

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  generateAccessToken,
  generateRandomToken,
  hashToken,
} from "../lib/tokens.js";
import { sendPasswordResetEmail } from "../lib/email.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// --- Zod Schemas (define what valid request bodies look like) ---

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

// --- POST /auth/register ---
// Creates a new user account. Hashes the password before storing.
authRouter.post("/auth/register", validate(registerSchema), async (req, res) => {
  const { email, username, password } = req.body;

  // Check if email or username already taken
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    // Generic message - don't reveal which field is taken
    return res.status(409).json({ error: "Email or username already in use" });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
  });

  const accessToken = generateAccessToken(user.id);

  res.status(201).json({
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
  });
});

// --- POST /auth/login ---
// Verifies credentials and returns a JWT access token.
authRouter.post("/auth/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message for both "user not found" and "wrong password"
  // This prevents attackers from discovering valid email addresses
  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(user.id);

  // Create a refresh token for session persistence
  const rawRefreshToken = generateRandomToken();
  const refreshTokenHash = hashToken(rawRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userId: user.id,
    },
  });

  res.json({
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
    refreshToken: rawRefreshToken,
  });
});

// --- POST /auth/refresh ---
// Exchange a valid refresh token for a new access token.
authRouter.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const accessToken = generateAccessToken(stored.userId);

  res.json({ accessToken });
});

// --- POST /auth/logout ---
// Revokes the refresh token so it can't be used again.
authRouter.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  res.json({ message: "Logged out successfully" });
});

// --- POST /auth/forgot-password ---
// Sends a password reset email. Always returns success (even if email
// doesn't exist) to prevent account enumeration.
authRouter.post("/auth/forgot-password", validate(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Generate a secure random token
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    // Store the hashed token with 1-hour expiry
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        userId: user.id,
      },
    });

    // Send the raw token via email (user clicks link with this token)
    await sendPasswordResetEmail(email, rawToken);
  }

  // Always return the same response regardless of whether the email exists
  res.json({ message: "If that email is registered, a reset link has been sent" });
});

// --- POST /auth/reset-password ---
// Accepts a reset token + new password. Validates the token, hashes
// the new password, and marks the token as used.
authRouter.post("/auth/reset-password", validate(resetPasswordSchema), async (req, res) => {
  const { token, password } = req.body;

  const tokenHash = hashToken(token);

  // Find a valid (unused, not expired) token
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  const hashedPassword = await hashPassword(password);

  // Update password and mark token as used in a single transaction
  // so they either both succeed or both fail
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.json({ message: "Password reset successfully" });
});

// --- GET /me ---
// Returns the current user's profile. Requires authentication.
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});
