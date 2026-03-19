<!--
  Game lobby - shows available slot games in a premium card grid.
  Maps game IDs to hero images, uses redesigned GameCard + BadgePill.
-->
<template>
  <div class="game-lobby">
    <!-- Hero header -->
    <div class="lobby-header fade-up">
      <div class="lobby-ornament">
        <span class="lobby-orn-line"></span>
        <svg class="lobby-orn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L3 9h2v7a1 1 0 001 1h3v-5h2v5h3a1 1 0 001-1V9h2L10 2z"/></svg>
        <span class="lobby-orn-line"></span>
      </div>
      <h1 class="lobby-title">The Saloon</h1>
      <p class="lobby-subtitle">Choose your game, partner. Fortune favors the bold.</p>
    </div>

    <div class="game-grid">
      <GameCard
        v-for="(game, idx) in games"
        :key="game.id"
        :title="game.name"
        :description="game.description"
        :theme="game.theme"
        :image="gameImages[game.id] || ''"
        class="fade-up"
        :class="`fade-up-${Math.min(idx + 2, 5)}`"
        @play="$emit('select', game)"
      >
        <template #badges>
          <BadgePill variant="gold">{{ game.reels }} &times; {{ game.rows }}</BadgePill>
          <BadgePill>{{ game.ways.toLocaleString() }} ways</BadgePill>
          <BadgePill>{{ game.betOptions[0] }}&ndash;{{ game.betOptions[game.betOptions.length - 1] }}</BadgePill>
        </template>
      </GameCard>
    </div>

    <!-- Bottom ornament -->
    <div class="lobby-footer fade-up fade-up-5">
      <span class="lobby-footer-line"></span>
      <span class="lobby-footer-dot"></span>
      <span class="lobby-footer-line"></span>
    </div>
  </div>
</template>

<script setup>
import GameCard from "./ui/GameCard.vue";
import BadgePill from "./ui/BadgePill.vue";

defineProps({ games: { type: Array, required: true } });
defineEmits(["select"]);

const gameImages = {
  "dead-mans-gun": "/images/dead-mans-gun.png",
  "dead-mans-treasure": "/images/dead-mans-treasure.png",
  "coyote-moon": "/images/coyote-moon.png",
};
</script>

<style scoped>
.game-lobby {
  text-align: center;
  padding: 1.5rem 0 2rem;
}

/* Header */
.lobby-header {
  margin-bottom: 2rem;
}

.lobby-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.lobby-orn-line {
  display: block;
  width: 50px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
  opacity: 0.3;
}

.lobby-orn-icon {
  width: 18px;
  height: 18px;
  color: var(--color-gold);
  opacity: 0.5;
}

.lobby-title {
  font-family: var(--font-display);
  font-size: 2.8rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow:
    0 0 30px rgba(212, 160, 32, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
}

.lobby-subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

/* Game grid */
.game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 0.5rem;
}

/* Footer ornament */
.lobby-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.lobby-footer-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.2), transparent);
}

.lobby-footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-gold);
  opacity: 0.2;
}

@media (max-width: 900px) {
  .game-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .lobby-title { font-size: 2rem; }
  .game-grid { grid-template-columns: 1fr; gap: 1.25rem; }
  .symbol-preview { font-size: 1.4rem; }
}
</style>
