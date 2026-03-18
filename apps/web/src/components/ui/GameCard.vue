<!--
  Premium game card for the lobby.
  Features a full-bleed hero image with gradient overlay,
  title, description, badges, and a glowing PLAY button.
-->
<template>
  <div class="game-card" :class="`card-theme-${theme}`" @click="$emit('play')">
    <!-- Hero image with overlay -->
    <div class="card-hero">
      <img v-if="image" :src="image" :alt="title" class="card-hero-img" loading="lazy" />
      <div class="card-hero-overlay"></div>
      <div class="card-hero-shine"></div>

      <!-- Floating badges on hero -->
      <div class="card-hero-badges">
        <slot name="badges" />
      </div>
    </div>

    <!-- Body: title + description -->
    <div class="card-body">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
    </div>

    <!-- Footer: play button -->
    <div class="card-footer">
      <BaseButton variant="primary" class="card-play-btn">
        <svg class="play-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
        PLAY NOW
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "./BaseButton.vue";

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: String, default: "default" },
  image: { type: String, default: "" },
});
defineEmits(["play"]);
</script>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  height: 100%;
  min-height: 420px;
  position: relative;
}

.game-card:hover {
  border-color: var(--color-gold);
  transform: translateY(-8px) scale(1.01);
  box-shadow:
    0 20px 60px rgba(212, 160, 32, 0.15),
    0 0 0 1px rgba(212, 160, 32, 0.2);
}

/* Hero image section */
.card-hero {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.game-card:hover .card-hero-img {
  transform: scale(1.08);
}

.card-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 30%,
    rgba(26, 15, 10, 0.4) 60%,
    rgba(26, 15, 10, 0.95) 100%
  );
  pointer-events: none;
}

.card-hero-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 40%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

.game-card:hover .card-hero-shine {
  opacity: 1;
}

.card-hero-badges {
  position: absolute;
  bottom: 10px;
  left: 12px;
  display: flex;
  gap: 0.35rem;
  z-index: 2;
}

/* Theme accent stripe on top */
.card-theme-gunslinger { border-top: 3px solid #e74c3c; }
.card-theme-treasure { border-top: 3px solid #f1c40f; }
.card-theme-desert { border-top: 3px solid #60a5fa; }

/* Body */
.card-body {
  flex: 1;
  padding: 0.75rem 1rem 0.25rem;
  text-align: center;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
  margin: 0 0 0.35rem;
  line-height: 1.2;
  text-shadow: 0 0 20px rgba(212, 160, 32, 0.15);
}

.card-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.card-footer {
  padding: 0.6rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.card-symbols {
  width: 100%;
}

.card-play-btn {
  width: 100%;
  font-weight: 800;
  letter-spacing: 0.08em;
  position: relative;
  overflow: hidden;
}

.play-icon {
  width: 14px;
  height: 14px;
  margin-right: 0.3rem;
}

.game-card:hover .card-play-btn {
  box-shadow: 0 4px 20px rgba(212, 160, 32, 0.3);
}

@media (max-width: 480px) {
  .game-card { min-height: 360px; }
  .card-hero { height: 160px; }
  .card-title { font-size: 1.15rem; }
}
</style>
