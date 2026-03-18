<!--
  Main game page - shows game lobby or active slot machine.
  Reads :gameId from the route to persist game selection across refreshes.
-->
<template>
  <div class="game-view">
    <div v-if="gameStore.error && !gameStore.currentGame" class="load-error">
      {{ gameStore.error }}
    </div>

    <!-- Slot machine (active game) -->
    <SlotMachine
      v-if="gameStore.currentGame"
      :game="gameStore.currentGame"
    />

    <!-- Game lobby (no game selected) -->
    <GameSelector
      v-else
      :games="gameStore.games"
      @select="handleSelect"
    />
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGameStore } from "../stores/game.js";
import GameSelector from "../components/GameSelector.vue";
import SlotMachine from "../components/SlotMachine.vue";

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

// When user selects a game from the lobby, navigate to the game URL
function handleSelect(game) {
  gameStore.selectGame(game);
  router.replace({ name: "game-play", params: { gameId: game.id } });
}

// On mount, if URL has a gameId, auto-select that game
onMounted(async () => {
  if (gameStore.games.length === 0) {
    await gameStore.fetchGames();
  }

  const gameId = route.params.gameId;
  if (gameId && !gameStore.currentGame) {
    const game = gameStore.games.find((g) => g.id === gameId);
    if (game) {
      gameStore.selectGame(game);
    } else {
      // Invalid game ID, go to lobby
      router.replace({ name: "game" });
    }
  }
});

// Watch for route changes (e.g., logo click navigating to /app)
watch(
  () => route.params.gameId,
  (newGameId) => {
    if (!newGameId && gameStore.currentGame) {
      gameStore.leaveGame();
    }
  }
);
</script>

<style scoped>
.game-view {
  padding: 0.5rem 0;
}

.load-error {
  text-align: center;
  color: var(--color-error);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}
</style>
