// Profile routes - user profile, daily bonus, achievements, and leaderboard.
// All routes require authentication.

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  xpForLevel,
  levelReward,
  levelFromXp,
  DAILY_BONUS_CHIPS,
  DAILY_BONUS_XP,
  DAILY_BONUS_COOLDOWN_MS,
  ACHIEVEMENTS,
  getStatValue,
} from "../lib/progression.js";

export const profileRouter = Router();

// ===========================
// GET /profile - full user profile with stats
// ===========================
profileRouter.get("/profile", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      country: true,
      kycStatus: true,
      createdAt: true,
      xp: true,
      level: true,
      totalSpins: true,
      totalWins: true,
      totalWagered: true,
      totalWon: true,
      biggestWin: true,
      favoriteGameId: true,
      lastDailyBonus: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Calculate level progress
  const currentLevelXp = xpForLevel(user.level);
  const nextLevelXp = xpForLevel(user.level + 1);
  const xpProgress = user.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  // Daily bonus availability
  const now = new Date();
  const canClaimDaily = !user.lastDailyBonus ||
    (now.getTime() - new Date(user.lastDailyBonus).getTime()) >= DAILY_BONUS_COOLDOWN_MS;
  const nextDailyBonus = user.lastDailyBonus
    ? new Date(new Date(user.lastDailyBonus).getTime() + DAILY_BONUS_COOLDOWN_MS)
    : null;

  res.json({
    profile: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      country: user.country,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
      level: user.level,
      xp: user.xp,
      xpProgress,
      xpNeeded,
      nextLevelXp,
      stats: {
        totalSpins: user.totalSpins,
        totalWins: user.totalWins,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        biggestWin: user.biggestWin,
        favoriteGameId: user.favoriteGameId,
      },
      dailyBonus: {
        available: canClaimDaily,
        nextAvailableAt: canClaimDaily ? null : nextDailyBonus,
        reward: DAILY_BONUS_CHIPS,
      },
    },
  });
});

// ===========================
// POST /profile/kyc - submit KYC verification (simulated auto-approve)
// ===========================
profileRouter.post("/profile/kyc", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.kycStatus === "VERIFIED") {
      return res.json({ message: "Already verified", kycStatus: "VERIFIED" });
    }

    // Set to PENDING first
    await prisma.user.update({
      where: { id: req.userId },
      data: { kycStatus: "PENDING" },
    });

    // Simulate processing delay then auto-approve
    setTimeout(async () => {
      try {
        await prisma.user.update({
          where: { id: req.userId },
          data: { kycStatus: "VERIFIED" },
        });
      } catch (e) {
        console.error("KYC auto-approve error:", e);
      }
    }, 3000);

    res.json({ message: "KYC submitted for verification", kycStatus: "PENDING" });
  } catch (err) {
    console.error("KYC submit error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===========================
// PUT /profile - edit profile (change username/password/personal info)
// ===========================
const editProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8).max(128).optional(),
  firstName: z.string().max(50).optional().nullable(),
  lastName: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  country: z.string().length(2).optional().nullable(),
});

profileRouter.post("/profile/edit", requireAuth, async (req, res) => {
  const parsed = editProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  const { username, currentPassword, newPassword, firstName, lastName, phone, country } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    // Check username uniqueness if changing
    if (username && username !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) return res.status(409).json({ error: "Username already taken" });
    }

    // Build update
    const updateData = {};
    if (username && username !== user.username) updateData.username = username;
    if (newPassword) updateData.password = await hashPassword(newPassword);
    if (firstName !== undefined) updateData.firstName = firstName || null;
    if (lastName !== undefined) updateData.lastName = lastName || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (country !== undefined) updateData.country = country || null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No changes detected" });
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true, email: true, username: true, createdAt: true,
        firstName: true, lastName: true, phone: true, country: true,
      },
    });

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===========================
// DELETE /profile - delete account (requires password confirmation)
// ===========================
const deleteProfileSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

profileRouter.post("/profile/delete", requireAuth, async (req, res) => {
  const parsed = deleteProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Password is required to delete your account" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify password
    const valid = await verifyPassword(parsed.data.password, user.password);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });

    // Delete everything in a transaction (cascade)
    await prisma.$transaction(async (tx) => {
      await tx.userAchievement.deleteMany({ where: { userId: req.userId } });
      await tx.userGameStats.deleteMany({ where: { userId: req.userId } });
      await tx.transaction.deleteMany({ where: { userId: req.userId } });
      await tx.wallet.deleteMany({ where: { userId: req.userId } });
      await tx.refreshToken.deleteMany({ where: { userId: req.userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId: req.userId } });
      await tx.user.delete({ where: { id: req.userId } });
    });

    res.json({ message: "Account deleted permanently" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===========================
// POST /profile/daily-bonus - claim daily bonus
// ===========================
profileRouter.post("/profile/daily-bonus", requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw { status: 404, message: "User not found" };

      // Check cooldown
      const now = new Date();
      if (user.lastDailyBonus) {
        const elapsed = now.getTime() - new Date(user.lastDailyBonus).getTime();
        if (elapsed < DAILY_BONUS_COOLDOWN_MS) {
          const nextAvailable = new Date(new Date(user.lastDailyBonus).getTime() + DAILY_BONUS_COOLDOWN_MS);
          throw { status: 400, message: `Daily bonus already claimed. Next available at ${nextAvailable.toISOString()}` };
        }
      }

      // Find CHIPS wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId_currency: { userId, currency: "CHIPS" } },
      });
      if (!wallet) throw { status: 400, message: "No CHIPS wallet found. Visit the wallet page first." };

      // Credit CHIPS
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: DAILY_BONUS_CHIPS } },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "DAILY_BONUS",
          amount: DAILY_BONUS_CHIPS,
          balanceAfter: updatedWallet.balance,
          note: `Daily bonus: +${DAILY_BONUS_CHIPS} CHIPS`,
          userId,
          walletId: wallet.id,
        },
      });

      // Award XP and update lastDailyBonus
      const newXp = user.xp + DAILY_BONUS_XP;
      const newLevel = levelFromXp(newXp);

      // Handle level-ups: credit CHIPS for each level gained
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
        }
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel,
          lastDailyBonus: now,
        },
      });

      return {
        xpAwarded: DAILY_BONUS_XP,
        chipsAwarded: DAILY_BONUS_CHIPS,
        levelUpRewards,
        newLevel: updatedUser.level,
        newXp: updatedUser.xp,
        balance: updatedWallet.balance,
        nextAvailableAt: new Date(now.getTime() + DAILY_BONUS_COOLDOWN_MS),
      };
    });

    res.json({
      message: "Daily bonus claimed!",
      ...result,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Daily bonus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===========================
// GET /achievements - all achievements with user progress
// ===========================
profileRouter.get("/achievements", requireAuth, async (req, res) => {
  const userId = req.userId;

  // Fetch user stats and game stats
  const [user, gameStats, userAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalSpins: true,
        totalWins: true,
        totalWagered: true,
        totalWon: true,
        biggestWin: true,
        level: true,
        kycStatus: true,
      },
    }),
    prisma.userGameStats.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Build game stats lookup map
  const gameStatsMap = Object.fromEntries(gameStats.map((gs) => [gs.gameId, gs]));

  // Build user achievement lookup map
  const userAchMap = Object.fromEntries(userAchievements.map((ua) => [ua.achievementId, ua]));

  // Build response with current progress
  const achievements = Object.entries(ACHIEVEMENTS).map(([id, def]) => {
    const userAch = userAchMap[id];
    const currentValue = getStatValue(def, user, gameStatsMap);
    const progress = Math.min(currentValue, def.threshold);
    const unlocked = currentValue >= def.threshold;

    return {
      id,
      name: def.name,
      description: def.description,
      category: def.category,
      threshold: def.threshold,
      progress,
      unlocked,
      claimed: userAch?.claimed || false,
      claimedAt: userAch?.claimedAt || null,
      xpReward: def.xpReward,
      chipsReward: def.chipsReward,
    };
  });

  res.json({ achievements });
});

// ===========================
// POST /achievements/:id/claim - claim achievement reward
// ===========================
profileRouter.post("/achievements/:id/claim", requireAuth, async (req, res) => {
  const userId = req.userId;
  const achievementId = req.params.id;

  // Validate achievement exists
  const achievementDef = ACHIEVEMENTS[achievementId];
  if (!achievementDef) {
    return res.status(404).json({ error: "Achievement not found" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get user stats
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          totalSpins: true,
          totalWins: true,
          totalWagered: true,
          totalWon: true,
          biggestWin: true,
          kycStatus: true,
        },
      });
      if (!user) throw { status: 404, message: "User not found" };

      // Get game stats if needed
      let gameStatsMap = {};
      if (achievementDef.stat.startsWith("game:")) {
        const gameStats = await tx.userGameStats.findMany({ where: { userId } });
        gameStatsMap = Object.fromEntries(gameStats.map((gs) => [gs.gameId, gs]));
      }

      // Check if achievement is unlocked
      const currentValue = getStatValue(achievementDef, user, gameStatsMap);
      if (currentValue < achievementDef.threshold) {
        throw { status: 400, message: "Achievement not yet unlocked" };
      }

      // Check if already claimed
      const existing = await tx.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId } },
      });
      if (existing?.claimed) {
        throw { status: 400, message: "Achievement already claimed" };
      }

      // Upsert achievement record as claimed
      await tx.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId } },
        update: { claimed: true, claimedAt: new Date(), unlockedAt: existing?.unlockedAt || new Date(), progress: currentValue },
        create: { userId, achievementId, progress: currentValue, unlockedAt: new Date(), claimed: true, claimedAt: new Date() },
      });

      // Credit CHIPS reward
      const wallet = await tx.wallet.findUnique({
        where: { userId_currency: { userId, currency: "CHIPS" } },
      });
      if (!wallet) throw { status: 400, message: "No CHIPS wallet found" };

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: achievementDef.chipsReward } },
      });

      await tx.transaction.create({
        data: {
          type: "ACHIEVEMENT_REWARD",
          amount: achievementDef.chipsReward,
          balanceAfter: updatedWallet.balance,
          note: `Achievement "${achievementDef.name}" reward: +${achievementDef.chipsReward} CHIPS`,
          userId,
          walletId: wallet.id,
        },
      });

      // Award XP and check for level-up
      const newXp = user.xp + achievementDef.xpReward;
      const newLevel = levelFromXp(newXp);

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
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel },
      });

      return {
        achievementId,
        name: achievementDef.name,
        chipsAwarded: achievementDef.chipsReward,
        xpAwarded: achievementDef.xpReward,
        levelUpRewards,
        newLevel,
        newXp,
      };
    });

    res.json({ message: "Achievement claimed!", ...result });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Achievement claim error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===========================
// GET /leaderboard - top players (supports period filtering)
// ===========================
profileRouter.get("/leaderboard", requireAuth, async (req, res) => {
  const type = req.query.type || "totalWon";
  const period = req.query.period || "allTime";
  const validTypes = ["totalWon", "biggestWin", "level"];
  const validPeriods = ["daily", "weekly", "monthly", "allTime"];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Options: ${validTypes.join(", ")}` });
  }
  if (!validPeriods.includes(period)) {
    return res.status(400).json({ error: `Invalid period. Options: ${validPeriods.join(", ")}` });
  }

  // All-time: use aggregated User fields (fast)
  if (period === "allTime") {
    const orderBy = type === "level"
      ? [{ level: "desc" }, { xp: "desc" }]
      : { [type]: "desc" };

    const players = await prisma.user.findMany({
      orderBy,
      take: 20,
      select: {
        id: true,
        username: true,
        level: true,
        totalSpins: true,
        totalWon: true,
        biggestWin: true,
      },
    });

    const leaderboard = players.map((player, index) => ({
      rank: index + 1,
      ...player,
    }));

    return res.json({ type, period, leaderboard });
  }

  // Time-based: compute from transactions within the window
  const now = new Date();
  let since;
  if (period === "daily") since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else if (period === "weekly") since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // monthly

  // Level leaderboard is always all-time (levels don't reset)
  if (type === "level") {
    const players = await prisma.user.findMany({
      orderBy: [{ level: "desc" }, { xp: "desc" }],
      take: 20,
      select: { id: true, username: true, level: true, totalSpins: true, totalWon: true, biggestWin: true },
    });
    const leaderboard = players.map((player, index) => ({ rank: index + 1, ...player }));
    return res.json({ type, period, leaderboard });
  }

  // Aggregate WIN transactions within the period
  const winData = await prisma.transaction.groupBy({
    by: ["userId"],
    where: {
      type: "WIN",
      createdAt: { gte: since },
    },
    _sum: { amount: true },
    _max: { amount: true },
    _count: { _all: true },
  });

  // Sort properly based on type
  const sorted = [...winData].sort((a, b) => {
    if (type === "totalWon") return Number(b._sum.amount || 0) - Number(a._sum.amount || 0);
    return Number(b._max.amount || 0) - Number(a._max.amount || 0);
  }).slice(0, 20);

  // Fetch user details for the top players
  const userIds = sorted.map((w) => w.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, level: true, totalSpins: true, totalWon: true, biggestWin: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const leaderboard = sorted.map((w, index) => {
    const user = userMap[w.userId] || {};
    return {
      rank: index + 1,
      id: w.userId,
      username: user.username || "Unknown",
      level: user.level || 1,
      totalSpins: user.totalSpins || 0,
      totalWon: type === "totalWon" ? String(w._sum.amount || 0) : String(user.totalWon || 0),
      biggestWin: type === "biggestWin" ? String(w._max.amount || 0) : String(user.biggestWin || 0),
    };
  });

  res.json({ type, period, leaderboard });
});
