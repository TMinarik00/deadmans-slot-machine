<!--
  Reusable game card for the lobby.
  Fixed-height layout ensures title, description, and play button
  are always in the same position regardless of content length.
-->
<template>
  <div class="game-card" :class="`card-theme-${theme}`" @click="$emit('play')">
    <!-- Visual section: symbol preview -->
    <div class="card-visual">
      <slot name="visual" />
    </div>

    <!-- Body: title + description (flex:1 pushes footer down) -->
    <div class="card-body">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
    </div>

    <!-- Footer: badges + play button always at the bottom -->
    <div class="card-footer">
      <div class="card-badges">
        <slot name="badges" />
      </div>
      <BaseButton variant="primary" class="card-play-btn">PLAY</BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "./BaseButton.vue";

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: String, default: "default" },
});
defineEmits(["play"]);
</script>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 320px;
}

.game-card:hover {
  border-color: var(--color-gold);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(212, 160, 32, 0.15);
}

/* Theme accent stripe */
.card-theme-gunslinger { border-top: 3px solid #e74c3c; }
.card-theme-treasure { border-top: 3px solid #f1c40f; }
.card-theme-desert { border-top: 3px solid #3498db; }
.card-theme-canyon { border-top: 3px solid #e67e22; }

/* Visual section */
.card-visual {
  padding: 1rem 1rem 0.5rem;
  display: flex;
  justify-content: center;
  min-height: 60px;
}

/* Body - flex:1 fills available space, pushing footer to bottom */
.card-body {
  flex: 1;
  padding: 0 1rem;
  text-align: center;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-gold);
  margin: 0 0 0.4rem;
  line-height: 1.2;
}

.card-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer - always at the bottom */
.card-footer {
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.card-badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card-play-btn {
  width: 100%;
}

@media (max-width: 480px) {
  .game-card { min-height: 280px; }
  .card-title { font-size: 1.1rem; }
}
</style>
