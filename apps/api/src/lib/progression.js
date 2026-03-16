// Progression system - levels, XP, achievements, and daily bonus config.
// All definitions live here. The database only stores user progress.

// ========================================
// LEVEL SYSTEM
// ========================================

// XP required to reach each level (cumulative).
// Formula: level N requires 50 * N * (N - 1) total XP.
// Level 1 = 0, Level 2 = 100, Level 3 = 300, Level 4 = 600, etc.
export function xpForLevel(level) {
  return 50 * level * (level - 1);
}

// CHIPS reward for reaching a given level
export function levelReward(level) {
  return level * 50;
}

// Calculate what level a given XP total corresponds to
export function levelFromXp(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

// XP earned per spin (1 XP per CHIP wagered)
export function xpFromBet(betAmount) {
  return Math.floor(betAmount);
}

// ========================================
// DAILY BONUS
// ========================================

export const DAILY_BONUS_CHIPS = 100;
export const DAILY_BONUS_XP = 25;
export const DAILY_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ========================================
// ACHIEVEMENTS
// ========================================

// Categories: general, wins, levels, game
// stat field tells the system which user stat to compare against threshold:
//   "totalSpins", "totalWins", "totalWagered", "totalWon", "biggestWin", "level"
//   "game:<gameId>" = per-game spin count from UserGameStats

export const ACHIEVEMENTS = {
  // --- General ---
  first_spin: {
    name: "First Spin",
    description: "Complete your first spin",
    category: "general",
    threshold: 1,
    stat: "totalSpins",
    xpReward: 50,
    chipsReward: 100,
  },
  spin_100: {
    name: "Spinning Pro",
    description: "Complete 100 spins",
    category: "general",
    threshold: 100,
    stat: "totalSpins",
    xpReward: 200,
    chipsReward: 500,
  },
  spin_1000: {
    name: "Spin Master",
    description: "Complete 1,000 spins",
    category: "general",
    threshold: 1000,
    stat: "totalSpins",
    xpReward: 500,
    chipsReward: 2000,
  },

  // --- Wins ---
  first_win: {
    name: "Winner!",
    description: "Win your first spin",
    category: "wins",
    threshold: 1,
    stat: "totalWins",
    xpReward: 50,
    chipsReward: 100,
  },
  big_win_500: {
    name: "Big Winner",
    description: "Win 500+ CHIPS in a single spin",
    category: "wins",
    threshold: 500,
    stat: "biggestWin",
    xpReward: 300,
    chipsReward: 1000,
  },
  big_win_5000: {
    name: "Jackpot!",
    description: "Win 5,000+ CHIPS in a single spin",
    category: "wins",
    threshold: 5000,
    stat: "biggestWin",
    xpReward: 1000,
    chipsReward: 5000,
  },

  // --- Wagering ---
  wagered_10000: {
    name: "High Roller",
    description: "Wager a total of 10,000 CHIPS",
    category: "general",
    threshold: 10000,
    stat: "totalWagered",
    xpReward: 300,
    chipsReward: 1000,
  },
  wagered_100000: {
    name: "Whale",
    description: "Wager a total of 100,000 CHIPS",
    category: "general",
    threshold: 100000,
    stat: "totalWagered",
    xpReward: 1000,
    chipsReward: 5000,
  },

  // --- Levels ---
  level_5: {
    name: "Rising Star",
    description: "Reach level 5",
    category: "levels",
    threshold: 5,
    stat: "level",
    xpReward: 200,
    chipsReward: 500,
  },
  level_10: {
    name: "Veteran",
    description: "Reach level 10",
    category: "levels",
    threshold: 10,
    stat: "level",
    xpReward: 500,
    chipsReward: 2000,
  },
  level_25: {
    name: "Legend",
    description: "Reach level 25",
    category: "levels",
    threshold: 25,
    stat: "level",
    xpReward: 1500,
    chipsReward: 10000,
  },

  // --- Game-specific (50 spins each) ---
  dead_mans_gun_50: {
    name: "Gunslinger",
    description: "Play Dead Man's Gun 50 times",
    category: "game",
    threshold: 50,
    stat: "game:dead-mans-gun",
    xpReward: 200,
    chipsReward: 500,
  },
  dead_mans_treasure_50: {
    name: "Treasure Hunter",
    description: "Play Dead Man's Treasure 50 times",
    category: "game",
    threshold: 50,
    stat: "game:dead-mans-treasure",
    xpReward: 200,
    chipsReward: 500,
  },
  coyote_moon_50: {
    name: "Night Howler",
    description: "Play Coyote Moon 50 times",
    category: "game",
    threshold: 50,
    stat: "game:coyote-moon",
    xpReward: 200,
    chipsReward: 500,
  },
  rattlesnake_gold_50: {
    name: "Snake Charmer",
    description: "Play Rattlesnake Gold 50 times",
    category: "game",
    threshold: 50,
    stat: "game:rattlesnake-gold",
    xpReward: 200,
    chipsReward: 500,
  },
};

// Helper: get the current value for an achievement's stat from user data + game stats
export function getStatValue(achievement, user, gameStatsMap) {
  const { stat } = achievement;

  if (stat.startsWith("game:")) {
    const gameId = stat.slice(5);
    return gameStatsMap[gameId]?.spins || 0;
  }

  switch (stat) {
    case "totalSpins":   return user.totalSpins;
    case "totalWins":    return user.totalWins;
    case "totalWagered": return Number(user.totalWagered);
    case "totalWon":     return Number(user.totalWon);
    case "biggestWin":   return Number(user.biggestWin);
    case "level":        return user.level;
    default:             return 0;
  }
}
