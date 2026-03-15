// Pinia game store - manages slot machine state, game selection, and spins.
// Components read from here; they never call the API directly for game operations.

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../lib/api.js";

export const useGameStore = defineStore("game", () => {
  // State
  const games = ref([]);
  const currentGame = ref(null);
  const grid = ref(null);
  const wins = ref([]);
  const totalWin = ref(0);
  const symbolMap = ref({});
  const spinning = ref(false);
  const selectedBet = ref(null);
  const balance = ref(0);
  const error = ref(null);
  const lastFeature = ref(null);

  // Getters
  const hasWin = computed(() => totalWin.value > 0);
  const winPositions = computed(() => {
    const positions = new Set();
    for (const win of wins.value) {
      for (const [reel, row] of win.positions) {
        positions.add(`${reel}-${row}`);
      }
    }
    return positions;
  });

  // Actions
  async function fetchGames() {
    error.value = null;
    try {
      const res = await api.get("/game/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load games");
      games.value = data.games;
    } catch (e) {
      error.value = e.message;
    }
  }

  function selectGame(game) {
    currentGame.value = game;
    grid.value = null;
    wins.value = [];
    totalWin.value = 0;
    symbolMap.value = {};
    lastFeature.value = null;
    // Default to first bet option
    selectedBet.value = game.betOptions[0];
  }

  function leaveGame() {
    currentGame.value = null;
    grid.value = null;
    wins.value = [];
    totalWin.value = 0;
    symbolMap.value = {};
    lastFeature.value = null;
  }

  async function doSpin() {
    if (spinning.value || !currentGame.value || !selectedBet.value) return;

    spinning.value = true;
    error.value = null;
    wins.value = [];
    totalWin.value = 0;
    lastFeature.value = null;

    try {
      const res = await api.post("/game/spin", {
        gameId: currentGame.value.id,
        betAmount: selectedBet.value,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Spin failed");

      // Store results (animation component will reveal them)
      grid.value = data.grid;
      wins.value = data.wins;
      totalWin.value = data.totalWin;
      symbolMap.value = data.symbolMap;
      balance.value = data.balance;
      lastFeature.value = data.featureTriggered;

      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      // spinning is set to false by the SlotMachine component after animation
    }
  }

  function setSpinning(val) {
    spinning.value = val;
  }

  function setBet(amount) {
    selectedBet.value = amount;
  }

  return {
    games,
    currentGame,
    grid,
    wins,
    totalWin,
    symbolMap,
    spinning,
    selectedBet,
    balance,
    error,
    lastFeature,
    hasWin,
    winPositions,
    fetchGames,
    selectGame,
    leaveGame,
    doSpin,
    setSpinning,
    setBet,
  };
});
