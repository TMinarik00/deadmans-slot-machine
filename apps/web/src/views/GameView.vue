<!--
  Placeholder game page - will be replaced with the slot machine in Cycle 3.
  For now just shows the user is logged in and the layout works.
-->
<template>
  <div class="game-placeholder">
    <h1 class="title">The Saloon</h1>
    <p class="subtitle">Welcome, {{ authStore.user?.username }}! The slot machine is being built...</p>
    <div class="placeholder-slot">
      <div class="reel">?</div>
      <div class="reel">?</div>
      <div class="reel">?</div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth.js";
const authStore = useAuthStore();
</script>

<style scoped>
.game-placeholder {
  text-align: center;
  padding: 3rem 0;
}

.title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-gold);
  margin: 0;
}

.subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 2rem;
}

.placeholder-slot {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.reel {
  width: 100px;
  height: 120px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--color-gold);
  font-family: var(--font-display);
}
</style>
