<!--
  Default layout - authenticated pages (game, wallet, etc.)
  Responsive navbar with hamburger menu on mobile.
-->
<template>
  <div class="default-layout">
    <nav class="navbar">
      <RouterLink to="/app" class="nav-logo">Dead Man's</RouterLink>

      <!-- Desktop nav -->
      <div class="nav-links">
        <RouterLink to="/app" class="nav-link">Game</RouterLink>
        <RouterLink to="/app/wallet" class="nav-link">Wallet</RouterLink>
        <RouterLink to="/app/wallet" class="nav-balance" title="CHIPS balance">
          {{ formattedChips }} CHIPS
        </RouterLink>
        <span class="nav-user">{{ authStore.user?.username }}</span>
        <button class="nav-btn" @click="handleLogout">Logout</button>
      </div>

      <!-- Mobile: balance pill + hamburger -->
      <div class="nav-mobile-right">
        <RouterLink to="/app/wallet" class="nav-balance nav-balance--mobile">
          {{ formattedChips }}
        </RouterLink>
        <button class="hamburger" @click="mobileOpen = !mobileOpen" :aria-label="mobileOpen ? 'Close menu' : 'Open menu'">
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile dropdown -->
    <div class="mobile-menu" :class="{ 'mobile-menu--open': mobileOpen }" @click="mobileOpen = false">
      <RouterLink to="/app" class="mobile-link">Game</RouterLink>
      <RouterLink to="/app/wallet" class="mobile-link">Wallet</RouterLink>
      <span class="mobile-user">{{ authStore.user?.username }}</span>
      <button class="mobile-logout" @click="handleLogout">Logout</button>
    </div>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useWalletStore } from "../stores/wallet.js";

const authStore = useAuthStore();
const walletStore = useWalletStore();
const router = useRouter();
const mobileOpen = ref(false);

const formattedChips = computed(() => {
  return walletStore.chipsBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

onMounted(() => {
  walletStore.fetchWallets();
});

async function handleLogout() {
  mobileOpen.value = false;
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: var(--color-bg);
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
  text-decoration: none;
  flex-shrink: 0;
}

/* Desktop links */
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

.nav-balance {
  background: rgba(212, 160, 32, 0.15);
  color: var(--color-gold);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(212, 160, 32, 0.3);
  transition: all 0.2s;
}
.nav-balance:hover {
  background: rgba(212, 160, 32, 0.25);
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

/* Mobile-only elements */
.nav-mobile-right {
  display: none;
  align-items: center;
  gap: 0.75rem;
}

.nav-balance--mobile {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text);
  border-radius: 1px;
  transition: all 0.3s;
}

.hamburger-line.open:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger-line.open:nth-child(2) { opacity: 0; }
.hamburger-line.open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile dropdown */
.mobile-menu {
  display: none;
  flex-direction: column;
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.mobile-menu--open {
  max-height: 300px;
  padding: 0.75rem 1.5rem 1rem;
}

.mobile-link {
  display: block;
  color: var(--color-text);
  text-decoration: none;
  padding: 0.6rem 0;
  font-size: 1rem;
  border-bottom: 1px solid var(--color-border);
  transition: color 0.2s;
}
.mobile-link:hover,
.mobile-link.router-link-active {
  color: var(--color-gold);
}

.mobile-user {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: 0.6rem 0;
}

.mobile-logout {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  transition: all 0.2s;
}
.mobile-logout:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* Main content */
.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-mobile-right { display: flex; }
  .mobile-menu { display: flex; }
  .navbar { padding: 0.65rem 1rem; }
  .nav-logo { font-size: 1.2rem; }
  .main-content { padding: 1.25rem 1rem; }
}

@media (max-width: 380px) {
  .nav-logo { font-size: 1rem; }
  .main-content { padding: 1rem 0.75rem; }
}
</style>
