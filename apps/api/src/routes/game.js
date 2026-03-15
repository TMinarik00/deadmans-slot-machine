// Game routes - slot machine spin and game listing.
// All routes require authentication. Spins debit/credit the CHIPS wallet atomically.

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getGameList, getGame, spin } from "../lib/slot-engine.js";

export const gameRouter = Router();

// --- Validation schemas ---

const spinSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  betAmount: z.number().positive("Bet must be positive"),
});

// ===========================
// GET /game/list - available games
// ===========================
gameRouter.get("/game/list", requireAuth, (_req, res) => {
  res.json({ games: getGameList() });
});

// ===========================
// GET /game/:id - single game config
// ===========================
gameRouter.get("/game/:id", requireAuth, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json({ game });
});

// ===========================
// POST /game/spin - perform a spin
// ===========================
gameRouter.post("/game/spin", requireAuth, validate(spinSchema), async (req, res) => {
  const { gameId, betAmount } = req.body;
  const userId = req.userId;

  // Validate game exists
  const gameConfig = getGame(gameId);
  if (!gameConfig) {
    return res.status(404).json({ error: "Game not found" });
  }

  // Validate bet amount is in allowed options
  if (!gameConfig.betOptions.includes(betAmount)) {
    return res.status(400).json({
      error: `Invalid bet. Options: ${gameConfig.betOptions.join(", ")}`,
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find CHIPS wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId_currency: { userId, currency: "CHIPS" } },
      });

      if (!wallet) {
        throw { status: 400, message: "No CHIPS wallet found. Visit the wallet page first." };
      }

      if (Number(wallet.balance) < betAmount) {
        throw { status: 400, message: "Insufficient CHIPS balance" };
      }

      // Debit the bet
      const afterBet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: betAmount } },
      });

      // Record bet transaction
      await tx.transaction.create({
        data: {
          type: "BET",
          amount: -betAmount,
          balanceAfter: afterBet.balance,
          note: `Bet ${betAmount} CHIPS on ${gameConfig.name}`,
          userId,
          walletId: wallet.id,
        },
      });

      // Spin the reels
      const spinResult = spin(gameId, betAmount);

      // Credit winnings (if any)
      let finalBalance = Number(afterBet.balance);
      if (spinResult.totalWin > 0) {
        const afterWin = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: spinResult.totalWin } },
        });

        await tx.transaction.create({
          data: {
            type: "WIN",
            amount: spinResult.totalWin,
            balanceAfter: afterWin.balance,
            note: `Won ${spinResult.totalWin} CHIPS on ${gameConfig.name}`,
            userId,
            walletId: wallet.id,
          },
        });

        finalBalance = Number(afterWin.balance);
      }

      return { ...spinResult, balance: finalBalance };
    });

    res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Spin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
