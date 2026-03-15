<!--
  Default layout - used for authenticated pages (game, wallet, profile, etc.)
  Has a top navbar with navigation links and a logout button.
-->
<template>
  <div class="default-layout">
    <nav class="navbar">
      <RouterLink to="/app" class="nav-logo">Dead Man's</RouterLink>
      <div class="nav-links">
        <RouterLink to="/app" class="nav-link">Game</RouterLink>
        <span class="nav-user">{{ authStore.user?.username }}</span>
        <button class="nav-btn" @click="handleLogout">Logout</button>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: var(--color-bg);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-gold);
}

.nav-user {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.nav-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.nav-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
