<!--
  Game lobby - shows available slot games in a consistent card grid.
  Uses reusable GameCard + BadgePill components.
-->
<template>
  <div class="game-lobby">
    <h1 class="lobby-title">The Saloon</h1>
    <p class="lobby-subtitle">Choose your game, partner</p>

    <div class="game-grid">
      <GameCard
        v-for="game in games"
        :key="game.id"
        :title="game.name"
        :description="game.description"
        :theme="game.theme"
        @play="$emit('select', game)"
      >
        <template #visual>
          <div class="symbol-preview">
            <span v-for="s in previewSymbols(game)" :key="s.id" class="preview-sym">{{ s.emoji }}</span>
          </div>
        </template>

        <template #badges>
          <BadgePill variant="gold">{{ game.reels }} &times; {{ game.rows }}</BadgePill>
          <BadgePill>{{ game.ways.toLocaleString() }} ways</BadgePill>
          <BadgePill>{{ game.betOptions[0] }}&ndash;{{ game.betOptions[game.betOptions.length - 1] }}</BadgePill>
        </template>
      </GameCard>
    </div>
  </div>
</template>

<script setup>
import GameCard from "./ui/GameCard.vue";
import BadgePill from "./ui/BadgePill.vue";

defineProps({ games: { type: Array, required: true } });
defineEmits(["select"]);

function previewSymbols(game) {
  return game.symbols.filter((s) => s.type !== "scatter").slice(0, 5);
}
</script>

<style scoped>
.game-lobby {
  text-align: center;
  padding: 1rem 0;
}

.lobby-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-gold);
  margin: 0;
}

.lobby-subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 2rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  max-width: 900px;
  margin: 0 auto;
}

.symbol-preview {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  font-size: 1.8rem;
  padding: 0.4rem 0.6rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  width: 100%;
}

.preview-sym {
  transition: transform 0.2s;
}

@media (max-width: 480px) {
  .lobby-title { font-size: 1.8rem; }
  .game-grid { grid-template-columns: 1fr; gap: 1rem; }
  .symbol-preview { font-size: 1.5rem; }
}
</style>
