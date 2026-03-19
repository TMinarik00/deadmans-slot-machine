// Slot engine - core game logic for Dead Man's Slot Machine.
// Uses "Ways to Win" system: any matching symbols on adjacent reels from left pay.
// No fixed paylines — ways = product of matching positions per reel.

import { randomInt } from "node:crypto";

// ========================================
// SYMBOL TYPES
// ========================================
const WILD = "wild";
const SCATTER = "scatter";
const REGULAR = "regular";
const BONUS = "bonus"; // reserved for future mini-games

// ========================================
// GAME DEFINITIONS
// ========================================

const GAMES = {
  "dead-mans-gun": {
    id: "dead-mans-gun",
    name: "Dead Man's Gun",
    description: "High stakes in the dusty saloon. Land the revolver for deadly payouts.",
    theme: "gunslinger",
    reels: 5,
    rows: 4,
    // ways = rows^reels = 4^5 = 1024
    waysBase: 25, // bet divisor for payout calculation
    betOptions: [10, 20, 50, 100, 200, 500],
    symbols: [
      { id: "wild", emoji: "⭐", name: "Sheriff Badge", type: WILD, payouts: { 3: 15, 4: 80, 5: 400 }, weight: 2 },
      { id: "scatter", emoji: "💎", name: "Diamond", type: SCATTER, scatterPayouts: { 3: 5, 4: 25, 5: 100 }, weight: 2 },
      { id: "revolver", emoji: "🔫", name: "Revolver", type: REGULAR, payouts: { 3: 10, 4: 60, 5: 300 }, weight: 3 },
      { id: "skull", emoji: "💀", name: "Skull", type: REGULAR, payouts: { 3: 8, 4: 40, 5: 200 }, weight: 4 },
      { id: "cowboy", emoji: "🤠", name: "Cowboy", type: REGULAR, payouts: { 3: 5, 4: 25, 5: 120 }, weight: 5 },
      { id: "whiskey", emoji: "🥃", name: "Whiskey", type: REGULAR, payouts: { 3: 4, 4: 18, 5: 80 }, weight: 6 },
      { id: "target", emoji: "🎯", name: "Target", type: REGULAR, payouts: { 3: 3, 4: 12, 5: 50 }, weight: 7 },
      { id: "spade", emoji: "♠️", name: "Spade", type: REGULAR, payouts: { 3: 2, 4: 6, 5: 25 }, weight: 9 },
      { id: "heart", emoji: "♥️", name: "Heart", type: REGULAR, payouts: { 3: 2, 4: 6, 5: 25 }, weight: 9 },
      { id: "diamond_card", emoji: "♦️", name: "Diamond Card", type: REGULAR, payouts: { 3: 1, 4: 4, 5: 15 }, weight: 9 },
    ],
    features: {
      freeSpins: { enabled: false, triggerSymbol: "scatter", minCount: 3, spins: { 3: 10, 4: 15, 5: 20 } },
      gamble: { enabled: false, maxMultiplier: 4 },
      bonusRound: { enabled: false },
    },
  },

  "dead-mans-treasure": {
    id: "dead-mans-treasure",
    name: "Dead Man's Treasure",
    description: "Dig deep into the abandoned gold mine. Unearth riches beyond imagination.",
    theme: "treasure",
    reels: 5,
    rows: 5,
    // ways = 5^5 = 3125
    waysBase: 30,
    betOptions: [10, 25, 50, 100, 250, 500],
    symbols: [
      { id: "wild", emoji: "🌟", name: "Gold Star", type: WILD, payouts: { 3: 12, 4: 60, 5: 300 }, weight: 2 },
      { id: "scatter", emoji: "📜", name: "Treasure Map", type: SCATTER, scatterPayouts: { 3: 5, 4: 20, 5: 80 }, weight: 2 },
      { id: "moneybag", emoji: "💰", name: "Money Bag", type: REGULAR, payouts: { 3: 10, 4: 50, 5: 250 }, weight: 3 },
      { id: "pickaxe", emoji: "⛏️", name: "Pickaxe", type: REGULAR, payouts: { 3: 8, 4: 35, 5: 180 }, weight: 4 },
      { id: "dynamite", emoji: "🧨", name: "Dynamite", type: REGULAR, payouts: { 3: 5, 4: 25, 5: 120 }, weight: 5 },
      { id: "trophy", emoji: "🏆", name: "Trophy", type: REGULAR, payouts: { 3: 4, 4: 18, 5: 80 }, weight: 6 },
      { id: "key", emoji: "🔑", name: "Golden Key", type: REGULAR, payouts: { 3: 3, 4: 12, 5: 50 }, weight: 7 },
      { id: "spade", emoji: "♠️", name: "Spade", type: REGULAR, payouts: { 3: 2, 4: 5, 5: 20 }, weight: 8 },
      { id: "heart", emoji: "♥️", name: "Heart", type: REGULAR, payouts: { 3: 2, 4: 5, 5: 20 }, weight: 8 },
      { id: "diamond_card", emoji: "♦️", name: "Diamond Card", type: REGULAR, payouts: { 3: 1, 4: 4, 5: 15 }, weight: 8 },
      { id: "club", emoji: "♣️", name: "Club", type: REGULAR, payouts: { 3: 1, 4: 4, 5: 15 }, weight: 8 },
    ],
    features: {
      freeSpins: { enabled: false, triggerSymbol: "scatter", minCount: 3, spins: { 3: 12, 4: 18, 5: 25 } },
      gamble: { enabled: false, maxMultiplier: 4 },
      bonusRound: { enabled: false },
    },
  },

  "coyote-moon": {
    id: "coyote-moon",
    name: "Coyote Moon",
    description: "The desert awakens at night. The coyote howls — fortune follows.",
    theme: "desert",
    reels: 5,
    rows: 6,
    // ways = 6^5 = 7776
    waysBase: 40,
    betOptions: [10, 30, 60, 100, 300, 600],
    symbols: [
      { id: "wild", emoji: "🐎", name: "Mustang", type: WILD, payouts: { 3: 10, 4: 50, 5: 250 }, weight: 3 },
      { id: "scatter", emoji: "✨", name: "Spirit Star", type: SCATTER, scatterPayouts: { 3: 4, 4: 15, 5: 60 }, weight: 2 },
      { id: "coyote", emoji: "🐺", name: "Coyote", type: REGULAR, payouts: { 3: 8, 4: 40, 5: 200 }, weight: 3 },
      { id: "moon", emoji: "🌙", name: "Moon", type: REGULAR, payouts: { 3: 6, 4: 30, 5: 150 }, weight: 4 },
      { id: "eagle", emoji: "🦅", name: "Eagle", type: REGULAR, payouts: { 3: 5, 4: 22, 5: 100 }, weight: 5 },
      { id: "cactus", emoji: "🌵", name: "Cactus", type: REGULAR, payouts: { 3: 4, 4: 15, 5: 60 }, weight: 6 },
      { id: "fire", emoji: "🔥", name: "Campfire", type: REGULAR, payouts: { 3: 3, 4: 10, 5: 40 }, weight: 7 },
      { id: "snake", emoji: "🐍", name: "Rattlesnake", type: REGULAR, payouts: { 3: 2, 4: 8, 5: 30 }, weight: 7 },
      { id: "spade", emoji: "♠️", name: "Spade", type: REGULAR, payouts: { 3: 1, 4: 5, 5: 18 }, weight: 8 },
      { id: "heart", emoji: "♥️", name: "Heart", type: REGULAR, payouts: { 3: 1, 4: 5, 5: 18 }, weight: 8 },
      { id: "diamond_card", emoji: "♦️", name: "Diamond Card", type: REGULAR, payouts: { 3: 1, 4: 4, 5: 12 }, weight: 9 },
      { id: "club", emoji: "♣️", name: "Club", type: REGULAR, payouts: { 3: 1, 4: 4, 5: 12 }, weight: 9 },
    ],
    features: {
      freeSpins: { enabled: false, triggerSymbol: "scatter", minCount: 3, spins: { 3: 15, 4: 20, 5: 30 } },
      gamble: { enabled: false, maxMultiplier: 4 },
      bonusRound: { enabled: false },
    },
  },
};

// ========================================
// RNG
// ========================================

function pickWeightedSymbol(symbols) {
  const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
  let roll = randomInt(0, totalWeight);
  for (const symbol of symbols) {
    roll -= symbol.weight;
    if (roll < 0) return symbol;
  }
  return symbols[symbols.length - 1];
}

// ========================================
// GRID GENERATION
// ========================================

function generateGrid(game) {
  const grid = [];
  for (let reel = 0; reel < game.reels; reel++) {
    const column = [];
    for (let row = 0; row < game.rows; row++) {
      column.push(pickWeightedSymbol(game.symbols).id);
    }
    grid.push(column);
  }
  return grid;
}

// ========================================
// WAYS-TO-WIN CALCULATION
// ========================================

function getSymbolById(game, symbolId) {
  return game.symbols.find((s) => s.id === symbolId);
}

// Evaluate wins using the ways-to-win system.
// For each symbol type, check consecutive reels left-to-right.
// Wilds substitute for any regular symbol.
// Ways = product of matching positions per reel.
function calculateWins(game, grid, totalBet) {
  const betUnit = totalBet / game.waysBase;
  const wins = [];
  let totalWin = 0;

  // --- Ways wins: check each symbol ---
  for (const targetSymbol of game.symbols) {
    if (targetSymbol.type === SCATTER || targetSymbol.type === BONUS) continue;

    let consecutiveReels = 0;
    let totalWays = 1;
    const allPositions = [];

    for (let reel = 0; reel < game.reels; reel++) {
      const matchingRows = [];

      for (let row = 0; row < game.rows; row++) {
        const cellId = grid[reel][row];
        const cellSymbol = getSymbolById(game, cellId);

        // Wild matches everything except itself (wild-only wins are separate)
        const matches =
          targetSymbol.type === WILD
            ? cellSymbol.type === WILD
            : cellId === targetSymbol.id || cellSymbol.type === WILD;

        if (matches) matchingRows.push([reel, row]);
      }

      if (matchingRows.length === 0) break;

      consecutiveReels++;
      totalWays *= matchingRows.length;
      allPositions.push(...matchingRows);
    }

    if (consecutiveReels >= 3 && targetSymbol.payouts && targetSymbol.payouts[consecutiveReels]) {
      const payout = Math.round(betUnit * targetSymbol.payouts[consecutiveReels] * totalWays * 100) / 100;
      if (payout > 0) {
        wins.push({
          symbolId: targetSymbol.id,
          count: consecutiveReels,
          ways: totalWays,
          positions: allPositions,
          payout,
          isScatter: false,
        });
        totalWin += payout;
      }
    }
  }

  // --- Scatter wins (anywhere on the grid) ---
  const scatterSymbol = game.symbols.find((s) => s.type === SCATTER);
  if (scatterSymbol) {
    let scatterCount = 0;
    const scatterPositions = [];

    for (let reel = 0; reel < game.reels; reel++) {
      for (let row = 0; row < game.rows; row++) {
        if (grid[reel][row] === scatterSymbol.id) {
          scatterCount++;
          scatterPositions.push([reel, row]);
        }
      }
    }

    if (scatterCount >= 3 && scatterSymbol.scatterPayouts && scatterSymbol.scatterPayouts[scatterCount]) {
      const scatterPayout = Math.round(totalBet * scatterSymbol.scatterPayouts[scatterCount] * 100) / 100;
      wins.push({
        symbolId: scatterSymbol.id,
        count: scatterCount,
        ways: 1,
        positions: scatterPositions,
        payout: scatterPayout,
        isScatter: true,
      });
      totalWin += scatterPayout;
    }
  }

  // --- Feature triggers (placeholder) ---
  let featureTriggered = null;
  const scatterWin = wins.find((w) => w.isScatter);
  if (scatterWin && game.features.freeSpins.enabled) {
    featureTriggered = {
      type: "freeSpins",
      spins: game.features.freeSpins.spins[scatterWin.count] || 10,
      message: `${scatterWin.count} scatters! Free spins unlocked!`,
    };
  }

  return {
    wins,
    totalWin: Math.round(totalWin * 100) / 100,
    featureTriggered,
  };
}

// ========================================
// PUBLIC API
// ========================================

export function getGameList() {
  return Object.values(GAMES).map((game) => ({
    id: game.id,
    name: game.name,
    description: game.description,
    theme: game.theme,
    reels: game.reels,
    rows: game.rows,
    ways: Math.pow(game.rows, game.reels),
    betOptions: game.betOptions,
    symbols: game.symbols.map((s) => ({
      id: s.id,
      emoji: s.emoji,
      name: s.name,
      type: s.type,
      payouts: s.payouts || null,
      scatterPayouts: s.scatterPayouts || null,
    })),
    features: game.features,
  }));
}

export function getGame(gameId) {
  const game = GAMES[gameId];
  if (!game) return null;

  return {
    id: game.id,
    name: game.name,
    description: game.description,
    theme: game.theme,
    reels: game.reels,
    rows: game.rows,
    ways: Math.pow(game.rows, game.reels),
    betOptions: game.betOptions,
    symbols: game.symbols.map((s) => ({
      id: s.id,
      emoji: s.emoji,
      name: s.name,
      type: s.type,
      payouts: s.payouts || null,
      scatterPayouts: s.scatterPayouts || null,
    })),
    features: game.features,
  };
}

export function spin(gameId, totalBet) {
  const game = GAMES[gameId];
  if (!game) throw new Error(`Unknown game: ${gameId}`);

  if (!game.betOptions.includes(totalBet)) {
    throw new Error(`Invalid bet amount. Options: ${game.betOptions.join(", ")}`);
  }

  const grid = generateGrid(game);
  const { wins, totalWin, featureTriggered } = calculateWins(game, grid, totalBet);

  return {
    gameId,
    grid,
    wins,
    totalWin,
    totalBet,
    featureTriggered,
    symbolMap: Object.fromEntries(game.symbols.map((s) => [s.id, { emoji: s.emoji, name: s.name, type: s.type }])),
  };
}
