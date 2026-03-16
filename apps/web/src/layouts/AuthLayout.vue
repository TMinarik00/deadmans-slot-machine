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
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
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
  position: relative;
  overflow: hidden;
}

/* Subtle radial background glow */
.auth-layout::before {
  content: "";
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(212, 160, 32, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeUp 0.5s ease-out;
}

.logo {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 2px 10px rgba(212, 160, 32, 0.3);
  animation: logoGlow 3s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% { text-shadow: 0 2px 10px rgba(212, 160, 32, 0.3); }
  50% { text-shadow: 0 2px 20px rgba(212, 160, 32, 0.5), 0 0 40px rgba(212, 160, 32, 0.15); }
}

.tagline {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin: 0.25rem 0 0;
  letter-spacing: 3px;
  text-transform: uppercase;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .auth-container { max-width: 100%; }
  .auth-header { margin-bottom: 1.25rem; }
  .logo { font-size: 2rem; }
  .tagline { font-size: 0.85rem; letter-spacing: 2px; }
}
</style>
