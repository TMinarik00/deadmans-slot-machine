// Game routes - slot machine spin and game listing.
// All routes require authentication. Spins debit/credit the CHIPS wallet atomically.

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getGameList, getGame, spin } from "../lib/slot-engine.js";
import { xpFromBet, levelFromXp, levelReward } from "../lib/progression.js";

export const gameRouter = Router();

// --- Validation schemas ---

const ALLOWED_SPINS = [1, 5, 10, 100];

const spinSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  betAmount: z.number().positive("Bet must be positive"),
  spins: z.number().int().refine((v) => ALLOWED_SPINS.includes(v), {
    message: `Allowed values: ${ALLOWED_SPINS.join(", ")}`,
  }).optional().default(1),
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
  const { gameId, betAmount, spins: spinCount } = req.body;
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

      const totalCost = betAmount * spinCount;
      if (Number(wallet.balance) < totalCost) {
        throw { status: 400, message: `Insufficient CHIPS balance. Need ${totalCost} for ${spinCount} spins.` };
      }

      // --- Run each spin, recording bet/win transactions ---
      const spinResults = [];
      let runningBalance = Number(wallet.balance);

      for (let i = 0; i < spinCount; i++) {
        // Debit bet
        const afterBet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: betAmount } },
        });
        runningBalance = Number(afterBet.balance);

        await tx.transaction.create({
          data: {
            type: "BET",
            amount: -betAmount,
            balanceAfter: afterBet.balance,
            note: spinCount > 1
              ? `Bet ${betAmount} CHIPS on ${gameConfig.name} (auto ${i + 1}/${spinCount})`
              : `Bet ${betAmount} CHIPS on ${gameConfig.name}`,
            userId,
            walletId: wallet.id,
          },
        });

        // Spin the reels
        const spinResult = spin(gameId, betAmount);

        // Credit winnings
        if (spinResult.totalWin > 0) {
          const afterWin = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: spinResult.totalWin } },
          });
          runningBalance = Number(afterWin.balance);

          await tx.transaction.create({
            data: {
              type: "WIN",
              amount: spinResult.totalWin,
              balanceAfter: afterWin.balance,
              note: spinCount > 1
                ? `Won ${spinResult.totalWin} CHIPS on ${gameConfig.name} (auto ${i + 1}/${spinCount})`
                : `Won ${spinResult.totalWin} CHIPS on ${gameConfig.name}`,
              userId,
              walletId: wallet.id,
            },
          });
        }

        spinResults.push(spinResult);
      }

      // --- Progression: aggregate stats across all spins ---
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, totalSpins: true, totalWon: true, biggestWin: true },
      });

      const totalXpEarned = xpFromBet(betAmount) * spinCount;
      const newXp = user.xp + totalXpEarned;
      const newLevel = levelFromXp(newXp);

      const winCount = spinResults.filter((s) => s.totalWin > 0).length;
      const totalWon = spinResults.reduce((sum, s) => sum + s.totalWin, 0);
      const batchBiggestWin = Math.max(...spinResults.map((s) => s.totalWin));
      const newBiggestWin = Math.max(Number(user.biggestWin), batchBiggestWin);

      // Handle level-up CHIPS rewards
      let levelUpRewards = 0;
      if (newLevel > user.level) {
        for (let lvl = user.level + 1; lvl <= newLevel; lvl++) {
          levelUpRewards += levelReward(lvl);
        }
        if (levelUpRewards > 0) {
          const afterLevelReward = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: levelUpRewards } },
          });
          await tx.transaction.create({
            data: {
              type: "LEVEL_REWARD",
              amount: levelUpRewards,
              balanceAfter: afterLevelReward.balance,
              note: `Level up! Reached level ${newLevel} (+${levelUpRewards} CHIPS)`,
              userId,
              walletId: wallet.id,
            },
          });
          runningBalance = Number(afterLevelReward.balance);
        }
      }

      // Determine favorite game
      const allGameStats = await tx.userGameStats.findMany({ where: { userId } });
      const gameStatsMap = Object.fromEntries(allGameStats.map((gs) => [gs.gameId, gs]));
      const currentGameSpins = (gameStatsMap[gameId]?.spins || 0) + spinCount;
      let favoriteGameId = gameId;
      for (const gs of allGameStats) {
        const spins = gs.gameId === gameId ? currentGameSpins : gs.spins;
        if (spins > currentGameSpins) favoriteGameId = gs.gameId;
      }

      // Update user stats (batched)
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel,
          totalSpins: { increment: spinCount },
          totalWins: winCount > 0 ? { increment: winCount } : undefined,
          totalWagered: { increment: totalCost },
          totalWon: totalWon > 0 ? { increment: totalWon } : undefined,
          biggestWin: newBiggestWin,
          favoriteGameId,
        },
      });

      // Update per-game stats (batched)
      await tx.userGameStats.upsert({
        where: { userId_gameId: { userId, gameId } },
        update: {
          spins: { increment: spinCount },
          wins: winCount > 0 ? { increment: winCount } : undefined,
          totalWon: totalWon > 0 ? { increment: totalWon } : undefined,
          biggestWin: Math.max(Number(gameStatsMap[gameId]?.biggestWin || 0), batchBiggestWin),
        },
        create: {
          userId,
          gameId,
          spins: spinCount,
          wins: winCount,
          totalWon,
          biggestWin: batchBiggestWin,
        },
      });

      const levelUp = newLevel > user.level ? { newLevel, reward: levelUpRewards } : null;

      // Single spin → flat response (backward compatible)
      if (spinCount === 1) {
        return {
          ...spinResults[0],
          balance: runningBalance,
          xpEarned: totalXpEarned,
          levelUp,
        };
      }

      // Multi-spin → batch response
      return {
        spins: spinResults,
        summary: {
          count: spinCount,
          totalBet: totalCost,
          totalWin: totalWon,
          netResult: totalWon - totalCost,
          wins: winCount,
          biggestWin: batchBiggestWin,
          xpEarned: totalXpEarned,
          levelUp,
        },
        balance: runningBalance,
      };
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
