<!--
  Auth layout - used for login, register, forgot/reset password pages.
  No navbar, just a centered card with the game logo on a dark background.
-->
<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="logo">Dead Man's</h1>
        <p class="tagline">Slot Machine</p>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 2px 10px rgba(212, 160, 32, 0.3);
}

.tagline {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin: 0.25rem 0 0;
  letter-spacing: 3px;
  text-transform: uppercase;
}
</style>
