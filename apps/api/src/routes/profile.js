// Profile routes - user profile, daily bonus, achievements, and leaderboard.
// All routes require authentication.

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
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
// GET /leaderboard - top players
// ===========================
profileRouter.get("/leaderboard", requireAuth, async (req, res) => {
  const type = req.query.type || "totalWon";
  const validTypes = ["totalWon", "biggestWin", "level"];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Options: ${validTypes.join(", ")}` });
  }

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

  // Add rank
  const leaderboard = players.map((player, index) => ({
    rank: index + 1,
    ...player,
  }));

  res.json({ type, leaderboard });
});
