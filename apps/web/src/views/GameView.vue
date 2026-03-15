<!--
  Main game page - shows game lobby or active slot machine.
  Fetches available games on mount, delegates to GameSelector or SlotMachine.
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
      @back="gameStore.leaveGame()"
    />

    <!-- Game lobby (no game selected) -->
    <GameSelector
      v-else
      :games="gameStore.games"
      @select="gameStore.selectGame($event)"
    />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useGameStore } from "../stores/game.js";
import GameSelector from "../components/GameSelector.vue";
import SlotMachine from "../components/SlotMachine.vue";

const gameStore = useGameStore();

onMounted(() => {
  if (gameStore.games.length === 0) {
    gameStore.fetchGames();
  }
});
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
