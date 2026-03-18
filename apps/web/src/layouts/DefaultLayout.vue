<!--
  Default layout - authenticated pages (game, wallet, etc.)
  Premium navbar with fullscreen mobile menu.
-->
<template>
  <div class="default-layout">
    <AnimatedBackground variant="default" />

    <nav class="navbar">
      <div class="nav-inner">
        <!-- Logo -->
        <RouterLink to="/app" class="nav-logo">
          <span class="nav-logo-icon">
            <IconSkull />
          </span>
          <span class="nav-logo-text">Dead Man's</span>
        </RouterLink>

        <!-- Desktop center nav -->
        <div class="nav-center">
          <RouterLink to="/app" class="nav-link" :class="{ 'is-exact': isExactApp }">
            <svg class="nav-link-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L3 9h2v7a1 1 0 001 1h3v-5h2v5h3a1 1 0 001-1V9h2L10 2z"/></svg>
            Lobby
          </RouterLink>
          <RouterLink to="/app/achievements" class="nav-link">
            <svg class="nav-link-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm3.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 1a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-7 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 2a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
            Achievements
          </RouterLink>
          <RouterLink to="/app/leaderboard" class="nav-link">
            <svg class="nav-link-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Leaderboard
          </RouterLink>
        </div>

        <!-- Desktop right -->
        <div class="nav-right">
          <RouterLink to="/app/wallet" class="nav-chips" title="CHIPS balance">
            <span class="nav-chips-icon"><IconStar /></span>
            <span class="nav-chips-amount">{{ formattedChips }}</span>
          </RouterLink>
          <RouterLink to="/app/profile" class="nav-profile">
            <span class="nav-avatar">
              <span class="nav-avatar-text">{{ userInitials }}</span>
            </span>
            <span class="nav-profile-info">
              <span class="nav-profile-name">{{ authStore.user?.username }}</span>
              <span class="nav-profile-level">Level {{ profileStore.level }}</span>
            </span>
          </RouterLink>
          <button class="nav-logout" @click="handleLogout" title="Logout">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M17 10a1 1 0 00-1-1H9a1 1 0 100 2h7a1 1 0 001-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <!-- Mobile right (coins hidden — shown inside menu) -->
        <div class="nav-mobile-right">
          <button
            class="hamburger"
            :class="{ 'hamburger--active': mobileOpen }"
            @click="mobileOpen = !mobileOpen"
            :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>

      <div class="nav-accent-line"></div>
    </nav>

    <!-- Fullscreen mobile menu -->
    <Transition name="mobile-overlay">
      <div v-if="mobileOpen" class="mobile-overlay">
        <div class="mobile-menu">
          <!-- Gold dust particles -->
          <span v-for="d in 24" :key="'dust-' + d" class="mob-dust" :class="'mob-dust--' + d" />

          <!-- Floating decorative icons -->
          <div class="mobile-float mobile-float--1"><IconHorseshoe /></div>
          <div class="mobile-float mobile-float--2"><IconRevolver /></div>
          <div class="mobile-float mobile-float--3"><IconCactus /></div>
          <div class="mobile-float mobile-float--4"><IconDice /></div>
          <div class="mobile-float mobile-float--5"><IconBullet /></div>
          <div class="mobile-float mobile-float--6"><IconTarget /></div>
          <div class="mobile-float mobile-float--7"><IconStar /></div>
          <div class="mobile-float mobile-float--8"><IconHat /></div>
          <div class="mobile-float mobile-float--9"><IconCard /></div>
          <div class="mobile-float mobile-float--10"><IconSkull /></div>

          <!-- ── Profile hero section ── -->
          <RouterLink to="/app/profile" class="mobile-profile-hero mob-stagger-1" @click="mobileOpen = false">
            <div class="mobile-profile-hero-bg"></div>
            <div class="mobile-avatar">
              <span class="mobile-avatar-text">{{ userInitials }}</span>
              <span class="mobile-avatar-ring"></span>
            </div>
            <div class="mobile-profile-details">
              <span class="mobile-profile-name">{{ authStore.user?.username }}</span>
              <div class="mobile-xp-row">
                <span class="mobile-level-badge">Lv.{{ profileStore.level }}</span>
                <div class="mobile-xp-bar">
                  <div class="mobile-xp-fill" :style="{ width: profileStore.xpPercent + '%' }"></div>
                </div>
                <span class="mobile-xp-text">{{ profileStore.xpProgress }}/{{ profileStore.xpNeeded }}</span>
              </div>
            </div>
            <svg class="mobile-profile-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </RouterLink>

          <!-- ── Wallet / Chips card ── -->
          <RouterLink to="/app/wallet" class="mobile-wallet-card mob-stagger-2" @click="mobileOpen = false">
            <div class="mobile-wallet-left">
              <span class="mobile-wallet-icon"><IconStar /></span>
              <div class="mobile-wallet-info">
                <span class="mobile-wallet-amount">{{ formattedChips }}</span>
                <span class="mobile-wallet-label">CHIPS Balance</span>
              </div>
            </div>
            <span class="mobile-wallet-action">Wallet</span>
          </RouterLink>

          <!-- Separator -->
          <div class="mobile-separator mob-stagger-3">
            <span class="mobile-separator-line"></span>
            <IconSkull />
            <span class="mobile-separator-line"></span>
          </div>

          <!-- ── Lobby hero ── -->
          <RouterLink to="/app" class="mobile-lobby mob-stagger-4" :class="{ 'is-active': isExactApp }" @click="mobileOpen = false">
            <div class="mobile-lobby-glow"></div>
            <div class="mobile-lobby-icon-wrap">
              <svg class="mobile-lobby-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L3 9h2v7a1 1 0 001 1h3v-5h2v5h3a1 1 0 001-1V9h2L10 2z"/></svg>
            </div>
            <div class="mobile-lobby-text">
              <span class="mobile-lobby-title">Game Lobby</span>
              <span class="mobile-lobby-sub">Pick your game & spin</span>
            </div>
            <svg class="mobile-lobby-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </RouterLink>

          <!-- ── Nav cards: Achievements + Leaderboard ── -->
          <div class="mobile-nav-grid">
            <RouterLink to="/app/achievements" class="mobile-nav-card mob-stagger-5" @click="mobileOpen = false">
              <div class="mobile-nav-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm3.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 1a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-7 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 2a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
              </div>
              <span class="mobile-nav-card-label">Achievements</span>
            </RouterLink>
            <RouterLink to="/app/leaderboard" class="mobile-nav-card mob-stagger-6" @click="mobileOpen = false">
              <div class="mobile-nav-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
              <span class="mobile-nav-card-label">Leaderboard</span>
            </RouterLink>
          </div>

          <!-- Spacer -->
          <div class="mobile-spacer"></div>

          <!-- Logout -->
          <button class="mobile-logout mob-stagger-7" @click="handleLogout">
            <svg class="mobile-logout-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M17 10a1 1 0 00-1-1H9a1 1 0 100 2h7a1 1 0 001-1z" clip-rule="evenodd"/></svg>
            <span>Logout</span>
          </button>

          <!-- Bottom ornament -->
          <div class="mobile-ornament">
            <span class="mobile-ornament-line"></span>
            <IconSkull />
            <span class="mobile-ornament-line"></span>
          </div>
        </div>
      </div>
    </Transition>

    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useWalletStore } from "../stores/wallet.js";
import { useProfileStore } from "../stores/profile.js";
import AnimatedBackground from "../components/ui/AnimatedBackground.vue";
import {
  IconSkull,
  IconStar,
  IconHorseshoe,
  IconRevolver,
  IconCactus,
  IconDice,
  IconBullet,
  IconTarget,
  IconHat,
  IconCard,
} from "../components/icons/index.js";

const authStore = useAuthStore();
const walletStore = useWalletStore();
const profileStore = useProfileStore();
const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);
const scrollY = ref(0);

const formattedChips = computed(() => {
  return walletStore.chipsBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const userInitials = computed(() => {
  const name = authStore.user?.username || "";
  return name.slice(0, 2).toUpperCase();
});

const isExactApp = computed(() => route.path === "/app" || route.path.startsWith("/app/game"));

watch(() => route.path, () => {
  mobileOpen.value = false;
});

// Lock ALL scroll when mobile menu is open (iOS + Android)
watch(mobileOpen, (open) => {
  if (open) {
    scrollY.value = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY.value}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    window.scrollTo(0, scrollY.value);
  }
});

onMounted(() => {
  walletStore.fetchWallets();
  profileStore.fetchProfile();
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
  position: relative;
  overflow: hidden;
}

/* ═══════════════════════════════════
   Navbar
   ═══════════════════════════════════ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background:
    linear-gradient(
      180deg,
      rgba(42, 26, 16, 0.95) 0%,
      rgba(26, 15, 10, 0.92) 100%
    );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(139, 105, 20, 0.25);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  max-width: 1280px;
  margin: 0 auto;
}

.nav-accent-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 5%,
    rgba(212, 160, 32, 0.3) 20%,
    rgba(212, 160, 32, 0.6) 50%,
    rgba(212, 160, 32, 0.3) 80%,
    transparent 95%
  );
}

/* ── Logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-logo-icon {
  display: flex;
  color: var(--color-gold);
  filter: drop-shadow(0 0 6px rgba(212, 160, 32, 0.4));
  transition: filter 0.3s ease;
}
.nav-logo-icon :deep(svg) {
  width: 26px;
  height: 26px;
}
.nav-logo:hover .nav-logo-icon {
  filter: drop-shadow(0 0 12px rgba(212, 160, 32, 0.6));
}

.nav-logo-text {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-gold);
  text-shadow: 0 0 20px rgba(212, 160, 32, 0.15);
  transition: text-shadow 0.3s ease;
}
.nav-logo:hover .nav-logo-text {
  text-shadow: 0 0 24px rgba(212, 160, 32, 0.4), 0 0 48px rgba(212, 160, 32, 0.15);
}

/* ── Center links ── */
.nav-center {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.nav-link:hover {
  color: var(--color-text);
  background: rgba(212, 160, 32, 0.08);
}
.nav-link:hover .nav-link-icon {
  opacity: 1;
}

.nav-link.router-link-exact-active,
.nav-link.is-exact {
  color: var(--color-gold);
  background: rgba(212, 160, 32, 0.12);
}
.nav-link.router-link-exact-active .nav-link-icon,
.nav-link.is-exact .nav-link-icon {
  opacity: 1;
}
.nav-link.router-link-exact-active::after,
.nav-link.is-exact::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--color-gold);
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(212, 160, 32, 0.4);
}

/* Lobby: override inclusive active match */
.nav-link:first-child.router-link-active:not(.is-exact) {
  color: var(--color-text-muted);
  background: transparent;
}
.nav-link:first-child.router-link-active:not(.is-exact) .nav-link-icon {
  opacity: 0.7;
}
.nav-link:first-child.router-link-active:not(.is-exact)::after {
  display: none;
}

/* ── Right section ── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-chips {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.12), rgba(212, 160, 32, 0.06));
  border: 1px solid rgba(212, 160, 32, 0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  transition: all 0.25s ease;
}
.nav-chips:hover {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.2), rgba(212, 160, 32, 0.1));
  border-color: rgba(212, 160, 32, 0.4);
  box-shadow: 0 0 16px rgba(212, 160, 32, 0.15);
}

.nav-chips-icon {
  display: flex;
  color: var(--color-gold);
  filter: drop-shadow(0 0 4px rgba(212, 160, 32, 0.4));
}
.nav-chips-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.nav-chips-amount {
  color: var(--color-gold);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.nav-profile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  padding: 0.3rem 0.6rem 0.3rem 0.3rem;
  border-radius: 24px;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}
.nav-profile:hover {
  background: rgba(212, 160, 32, 0.06);
  border-color: rgba(212, 160, 32, 0.15);
}

.nav-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a020, #8b6914);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px rgba(212, 160, 32, 0.2);
}

.nav-avatar-text {
  color: #1a0f0a;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.nav-profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.nav-profile-name {
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
}

.nav-profile-level {
  color: var(--color-gold);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.8;
}

.nav-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(139, 105, 20, 0.15);
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.25s ease;
}
.nav-logout svg {
  width: 16px;
  height: 16px;
}
.nav-logout:hover {
  color: var(--color-error);
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.06);
}

/* ═══════════════════════════════════
   Mobile hamburger + right
   ═══════════════════════════════════ */
.nav-mobile-right {
  display: none;
  align-items: center;
  gap: 0.6rem;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  gap: 5px;
  background: none;
  border: 1px solid rgba(139, 105, 20, 0.2);
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}
.hamburger:hover {
  border-color: rgba(212, 160, 32, 0.3);
  background: rgba(212, 160, 32, 0.06);
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-text);
  border-radius: 1px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.hamburger--active {
  border-color: rgba(212, 160, 32, 0.4);
}
.hamburger--active .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
  background: var(--color-gold);
}
.hamburger--active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger--active .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
  background: var(--color-gold);
}

/* ═══════════════════════════════════
   Fullscreen mobile menu
   ═══════════════════════════════════ */
.mobile-overlay {
  position: fixed;
  inset: 0;
  top: 61px;
  z-index: 99;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: none;
}

.mobile-menu {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(
      180deg,
      rgba(42, 26, 16, 0.99) 0%,
      rgba(26, 15, 10, 1) 25%,
      rgba(20, 12, 8, 1) 100%
    );
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* ── Floating decorative icons ── */
.mobile-float {
  position: absolute;
  color: var(--color-gold);
  opacity: 0;
  pointer-events: none;
}
.mobile-float :deep(svg) {
  width: 20px;
  height: 20px;
}
.mobile-float--1 {
  top: 6%;
  right: 8%;
  animation: mobileFloat1 12s ease-in-out infinite, mobileFloatIn 0.6s 0.3s ease-out forwards;
}
.mobile-float--2 {
  top: 28%;
  left: 5%;
  animation: mobileFloat2 14s ease-in-out infinite, mobileFloatIn 0.6s 0.5s ease-out forwards;
}
.mobile-float--3 {
  bottom: 25%;
  right: 6%;
  animation: mobileFloat3 10s ease-in-out infinite, mobileFloatIn 0.6s 0.4s ease-out forwards;
}
.mobile-float--4 {
  top: 50%;
  right: 10%;
  animation: mobileFloat2 16s ease-in-out infinite, mobileFloatIn 0.6s 0.6s ease-out forwards;
}
.mobile-float--5 {
  bottom: 12%;
  left: 8%;
  animation: mobileFloat1 11s ease-in-out infinite, mobileFloatIn 0.6s 0.7s ease-out forwards;
}
.mobile-float--6 {
  top: 58%;
  left: 6%;
  animation: mobileFloat3 13s ease-in-out infinite, mobileFloatIn 0.6s 0.55s ease-out forwards;
}
.mobile-float--7 {
  top: 65%;
  right: 10%;
  animation: mobileFloat1 15s ease-in-out infinite, mobileFloatIn 0.6s 0.65s ease-out forwards;
}
.mobile-float--8 {
  top: 72%;
  left: 20%;
  animation: mobileFloat2 12s ease-in-out infinite, mobileFloatIn 0.6s 0.45s ease-out forwards;
}
.mobile-float--9 {
  top: 80%;
  right: 25%;
  animation: mobileFloat3 14s ease-in-out infinite, mobileFloatIn 0.6s 0.75s ease-out forwards;
}
.mobile-float--10 {
  top: 88%;
  left: 40%;
  animation: mobileFloat1 13s ease-in-out infinite, mobileFloatIn 0.6s 0.8s ease-out forwards;
}

/* ── Gold dust particles ── */
.mob-dust {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(212, 160, 32, 0.9), rgba(212, 160, 32, 0.3));
  opacity: 0;
}
/* Top section (cards area) — light sprinkle */
.mob-dust--1  { width: 3px; height: 3px; top: 4%;  left: 15%;  animation: dustDrift1 10s 0.2s ease-in-out infinite, dustFadeIn 0.5s 0.3s ease-out forwards; }
.mob-dust--2  { width: 2px; height: 2px; top: 10%; right: 20%; animation: dustDrift2 12s 0.4s ease-in-out infinite, dustFadeIn 0.5s 0.5s ease-out forwards; }
.mob-dust--3  { width: 4px; height: 4px; top: 18%; left: 45%;  animation: dustDrift3 9s  0.1s ease-in-out infinite, dustFadeIn 0.5s 0.2s ease-out forwards; }
.mob-dust--4  { width: 2px; height: 2px; top: 25%; right: 10%; animation: dustDrift1 14s 0.6s ease-in-out infinite, dustFadeIn 0.5s 0.6s ease-out forwards; }
.mob-dust--5  { width: 3px; height: 3px; top: 33%; left: 8%;   animation: dustDrift2 11s 0.3s ease-in-out infinite, dustFadeIn 0.5s 0.35s ease-out forwards; }
.mob-dust--6  { width: 2px; height: 2px; top: 40%; right: 35%; animation: dustDrift3 13s 0.5s ease-in-out infinite, dustFadeIn 0.5s 0.55s ease-out forwards; }
/* Mid section — transition zone */
.mob-dust--7  { width: 3px; height: 3px; top: 48%; left: 25%;  animation: dustDrift1 10s 0.7s ease-in-out infinite, dustFadeIn 0.5s 0.4s ease-out forwards; }
.mob-dust--8  { width: 4px; height: 4px; top: 52%; right: 12%; animation: dustDrift2 8s  0.2s ease-in-out infinite, dustFadeIn 0.5s 0.25s ease-out forwards; }
/* Bottom section — dense, fills the empty space */
.mob-dust--9  { width: 3px; height: 3px; top: 56%; left: 50%;  animation: dustDrift3 12s 0.4s ease-in-out infinite, dustFadeIn 0.5s 0.65s ease-out forwards; }
.mob-dust--10 { width: 4px; height: 4px; top: 60%; right: 20%; animation: dustDrift1 11s 0.1s ease-in-out infinite, dustFadeIn 0.5s 0.45s ease-out forwards; }
.mob-dust--11 { width: 3px; height: 3px; top: 63%; left: 10%;  animation: dustDrift2 14s 0.6s ease-in-out infinite, dustFadeIn 0.5s 0.7s ease-out forwards; }
.mob-dust--12 { width: 2px; height: 2px; top: 66%; right: 40%; animation: dustDrift3 9s  0.3s ease-in-out infinite, dustFadeIn 0.5s 0.5s ease-out forwards; }
.mob-dust--13 { width: 4px; height: 4px; top: 70%; left: 35%;  animation: dustDrift1 13s 0.5s ease-in-out infinite, dustFadeIn 0.5s 0.6s ease-out forwards; }
.mob-dust--14 { width: 3px; height: 3px; top: 73%; right: 8%;  animation: dustDrift2 10s 0.2s ease-in-out infinite, dustFadeIn 0.5s 0.3s ease-out forwards; }
.mob-dust--15 { width: 2px; height: 2px; top: 76%; left: 55%;  animation: dustDrift3 11s 0.7s ease-in-out infinite, dustFadeIn 0.5s 0.75s ease-out forwards; }
.mob-dust--16 { width: 4px; height: 4px; top: 79%; right: 28%; animation: dustDrift1 12s 0.4s ease-in-out infinite, dustFadeIn 0.5s 0.55s ease-out forwards; }
.mob-dust--17 { width: 3px; height: 3px; top: 82%; left: 18%;  animation: dustDrift2 9s  0.3s ease-in-out infinite, dustFadeIn 0.5s 0.4s ease-out forwards; }
.mob-dust--18 { width: 2px; height: 2px; top: 85%; right: 15%; animation: dustDrift3 14s 0.6s ease-in-out infinite, dustFadeIn 0.5s 0.65s ease-out forwards; }
.mob-dust--19 { width: 4px; height: 4px; top: 87%; left: 42%;  animation: dustDrift1 10s 0.1s ease-in-out infinite, dustFadeIn 0.5s 0.35s ease-out forwards; }
.mob-dust--20 { width: 3px; height: 3px; top: 89%; right: 35%; animation: dustDrift2 13s 0.5s ease-in-out infinite, dustFadeIn 0.5s 0.5s ease-out forwards; }
.mob-dust--21 { width: 2px; height: 2px; top: 91%; left: 8%;   animation: dustDrift3 11s 0.2s ease-in-out infinite, dustFadeIn 0.5s 0.7s ease-out forwards; }
.mob-dust--22 { width: 4px; height: 4px; top: 93%; right: 22%; animation: dustDrift1 8s  0.4s ease-in-out infinite, dustFadeIn 0.5s 0.45s ease-out forwards; }
.mob-dust--23 { width: 3px; height: 3px; top: 95%; left: 30%;  animation: dustDrift2 12s 0.7s ease-in-out infinite, dustFadeIn 0.5s 0.6s ease-out forwards; }
.mob-dust--24 { width: 2px; height: 2px; top: 97%; right: 45%; animation: dustDrift3 10s 0.3s ease-in-out infinite, dustFadeIn 0.5s 0.8s ease-out forwards; }

@keyframes dustFadeIn {
  from { opacity: 0; }
  to { opacity: 0.5; }
}
@keyframes dustDrift1 {
  0%, 100% { transform: translate(0, 0); opacity: 0.3; }
  25% { transform: translate(12px, -18px); opacity: 0.6; }
  50% { transform: translate(-8px, -30px); opacity: 0.4; }
  75% { transform: translate(16px, -12px); opacity: 0.55; }
}
@keyframes dustDrift2 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  33% { transform: translate(-14px, 10px); opacity: 0.6; }
  66% { transform: translate(8px, -16px); opacity: 0.35; }
}
@keyframes dustDrift3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.35; }
  50% { transform: translate(-10px, -22px); opacity: 0.6; }
}

@keyframes mobileFloatIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 0.1; transform: scale(1); }
}
@keyframes mobileFloat1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(8px, -12px) rotate(10deg); }
  50% { transform: translate(-4px, -20px) rotate(-5deg); }
  75% { transform: translate(12px, -8px) rotate(8deg); }
}
@keyframes mobileFloat2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-10px, 8px) rotate(-12deg); }
  66% { transform: translate(6px, -10px) rotate(6deg); }
}
@keyframes mobileFloat3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-8px, -14px) rotate(-8deg); }
}

/* ── Menu transition ── */
.mobile-overlay-enter-active {
  transition: opacity 0.3s ease;
}
.mobile-overlay-enter-active .mobile-menu {
  animation: menuSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.mobile-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.mobile-overlay-leave-active .mobile-menu {
  animation: menuSlideOut 0.2s ease-in forwards;
}
.mobile-overlay-enter-from { opacity: 0; }
.mobile-overlay-leave-to { opacity: 0; }

@keyframes menuSlideIn {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes menuSlideOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-8px); }
}

/* ── Stagger entrance ── */
.mob-stagger-1 { animation: mobItemIn 0.35s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-2 { animation: mobItemIn 0.35s 0.12s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-3 { animation: mobItemIn 0.35s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-4 { animation: mobItemIn 0.35s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-5 { animation: mobItemIn 0.35s 0.30s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-6 { animation: mobItemIn 0.35s 0.36s cubic-bezier(0.16, 1, 0.3, 1) both; }
.mob-stagger-7 { animation: mobItemIn 0.35s 0.42s cubic-bezier(0.16, 1, 0.3, 1) both; }

@keyframes mobItemIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════
   Mobile: Profile Hero Section
   ═══════════════════════════════════ */
.mobile-profile-hero {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-decoration: none;
  padding: 1.35rem 1.3rem;
  border-radius: 18px;
  border: 1px solid rgba(139, 105, 20, 0.18);
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.06), rgba(139, 105, 20, 0.03));
  margin-bottom: 0.85rem;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}
.mobile-profile-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.25), transparent);
}
.mobile-profile-hero:active {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.12), rgba(139, 105, 20, 0.06));
  border-color: rgba(212, 160, 32, 0.3);
  transform: scale(0.99);
}

/* Premium active effect for profile */
.mobile-profile-hero.router-link-exact-active {
  border-color: rgba(212, 160, 32, 0.4);
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.12), rgba(139, 105, 20, 0.06));
  box-shadow:
    0 0 20px rgba(212, 160, 32, 0.1),
    inset 0 0 20px rgba(212, 160, 32, 0.03);
  animation: activeCardPulse 3s ease-in-out infinite;
}
.mobile-profile-hero.router-link-exact-active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(212, 160, 32, 0.06) 45%, rgba(212, 160, 32, 0.1) 50%, rgba(212, 160, 32, 0.06) 55%, transparent 60%);
  animation: activeShimmer 4s ease-in-out infinite;
  pointer-events: none;
}
.mobile-profile-hero.router-link-exact-active .mobile-profile-hero-bg {
  background: radial-gradient(ellipse at 20% 50%, rgba(212, 160, 32, 0.1), transparent 70%);
}

.mobile-profile-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(212, 160, 32, 0.06), transparent 70%);
  pointer-events: none;
}

.mobile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a020, #8b6914);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px rgba(212, 160, 32, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.mobile-avatar-text {
  color: #1a0f0a;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.mobile-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid rgba(212, 160, 32, 0.25);
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { border-color: rgba(212, 160, 32, 0.2); transform: scale(1); }
  50% { border-color: rgba(212, 160, 32, 0.4); transform: scale(1.04); }
}

.mobile-profile-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.mobile-profile-name {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-xp-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-level-badge {
  background: linear-gradient(135deg, #d4a020, #b8860b);
  color: #1a0f0a;
  padding: 0.12rem 0.45rem;
  border-radius: 8px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.mobile-xp-bar {
  flex: 1;
  height: 6px;
  background: rgba(212, 160, 32, 0.1);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(212, 160, 32, 0.1);
}

.mobile-xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a020, #ffd700);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 6px rgba(212, 160, 32, 0.4);
  animation: xpGlow 2s ease-in-out infinite;
}

@keyframes xpGlow {
  0%, 100% { box-shadow: 0 0 4px rgba(212, 160, 32, 0.3); }
  50% { box-shadow: 0 0 10px rgba(212, 160, 32, 0.6); }
}

.mobile-xp-text {
  color: var(--color-text-muted);
  font-size: 0.6rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.mobile-profile-arrow {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  opacity: 0.4;
  flex-shrink: 0;
}

/* ═══════════════════════════════════
   Mobile: Wallet Card
   ═══════════════════════════════════ */
.mobile-wallet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  padding: 1.2rem 1.3rem;
  border-radius: 18px;
  border: 1px solid rgba(139, 105, 20, 0.18);
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.08), rgba(212, 160, 32, 0.03));
  margin-bottom: 0.85rem;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.mobile-wallet-card:active {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.15), rgba(212, 160, 32, 0.08));
  border-color: rgba(212, 160, 32, 0.35);
  transform: scale(0.99);
}

/* Premium active effect for wallet */
.mobile-wallet-card.router-link-exact-active {
  border-color: rgba(212, 160, 32, 0.4);
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.14), rgba(212, 160, 32, 0.06));
  box-shadow:
    0 0 20px rgba(212, 160, 32, 0.1),
    inset 0 0 20px rgba(212, 160, 32, 0.03);
  animation: activeCardPulse 3s ease-in-out infinite;
}
.mobile-wallet-card.router-link-exact-active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(212, 160, 32, 0.06) 45%, rgba(212, 160, 32, 0.1) 50%, rgba(212, 160, 32, 0.06) 55%, transparent 60%);
  animation: activeShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

.mobile-wallet-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-wallet-icon {
  display: flex;
  color: var(--color-gold);
  filter: drop-shadow(0 0 6px rgba(212, 160, 32, 0.5));
  animation: coinGlow 2.5s ease-in-out infinite;
}
.mobile-wallet-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

@keyframes coinGlow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(212, 160, 32, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(212, 160, 32, 0.7)); }
}

.mobile-wallet-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.mobile-wallet-amount {
  color: var(--color-gold);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.1;
}

.mobile-wallet-label {
  color: var(--color-text-muted);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mobile-wallet-action {
  color: var(--color-gold);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(212, 160, 32, 0.25);
  background: rgba(212, 160, 32, 0.06);
}

/* ── Separator ── */
.mobile-separator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--color-gold);
  opacity: 0.2;
}
.mobile-separator :deep(svg) {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.mobile-separator-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.5), transparent);
}

/* ── Lobby hero ── */
.mobile-lobby {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  padding: 1.3rem 1.3rem;
  border-radius: 18px;
  margin-bottom: 0.7rem;
  background:
    linear-gradient(
      135deg,
      rgba(212, 160, 32, 0.1) 0%,
      rgba(184, 134, 11, 0.04) 100%
    );
  border: 1px solid rgba(139, 105, 20, 0.18);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.mobile-lobby::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.3), transparent);
}
.mobile-lobby:active {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.18), rgba(184, 134, 11, 0.1));
  border-color: rgba(212, 160, 32, 0.4);
  transform: scale(0.99);
}

/* Reset inclusive active match — only glow when exact */
.mobile-lobby.router-link-active:not(.is-active) {
  border-color: rgba(139, 105, 20, 0.18);
  box-shadow: none;
}

/* Premium active effect for lobby */
.mobile-lobby.is-active {
  border-color: rgba(212, 160, 32, 0.45);
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.16), rgba(184, 134, 11, 0.08));
  box-shadow:
    0 0 20px rgba(212, 160, 32, 0.12),
    inset 0 0 20px rgba(212, 160, 32, 0.04);
  animation: activeCardPulse 3s ease-in-out infinite;
}
.mobile-lobby.is-active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(212, 160, 32, 0.06) 45%, rgba(212, 160, 32, 0.1) 50%, rgba(212, 160, 32, 0.06) 55%, transparent 60%);
  animation: activeShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

.mobile-lobby-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.2), rgba(212, 160, 32, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(212, 160, 32, 0.15);
  transition: all 0.25s ease;
}
.mobile-lobby.is-active .mobile-lobby-icon-wrap {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.3), rgba(212, 160, 32, 0.12));
  border-color: rgba(212, 160, 32, 0.3);
  box-shadow: 0 0 12px rgba(212, 160, 32, 0.2);
}

.mobile-lobby-icon {
  width: 24px;
  height: 24px;
  color: var(--color-gold);
}

.mobile-lobby-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.mobile-lobby-title {
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 1.1rem;
  line-height: 1.2;
}

.mobile-lobby-sub {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.mobile-lobby-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(212, 160, 32, 0.06), transparent 70%);
  pointer-events: none;
  opacity: 0.5;
}
.mobile-lobby.is-active .mobile-lobby-glow {
  animation: lobbyGlow 3s ease-in-out infinite;
  opacity: 1;
}

@keyframes lobbyGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.mobile-lobby-arrow {
  width: 20px;
  height: 20px;
  color: var(--color-gold);
  opacity: 0.4;
  flex-shrink: 0;
}
.mobile-lobby.is-active .mobile-lobby-arrow {
  animation: arrowPulse 2s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); opacity: 0.4; }
  50% { transform: translateX(3px); opacity: 0.8; }
}

/* ── Premium active keyframes (shared) ── */
@keyframes activeCardPulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(212, 160, 32, 0.1), inset 0 0 16px rgba(212, 160, 32, 0.03);
  }
  50% {
    box-shadow: 0 0 24px rgba(212, 160, 32, 0.18), inset 0 0 24px rgba(212, 160, 32, 0.05);
  }
}

@keyframes activeShimmer {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}

/* ── Mobile nav card grid ── */
.mobile-nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.mobile-nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  padding: 1.4rem 0.85rem;
  border-radius: 18px;
  border: 1px solid rgba(139, 105, 20, 0.15);
  background: rgba(212, 160, 32, 0.04);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.mobile-nav-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.2), transparent);
}
.mobile-nav-card:active {
  background: rgba(212, 160, 32, 0.1);
  border-color: rgba(212, 160, 32, 0.3);
  transform: scale(0.98);
}
.mobile-nav-card.router-link-exact-active {
  border-color: rgba(212, 160, 32, 0.4);
  background: rgba(212, 160, 32, 0.1);
  box-shadow:
    0 0 16px rgba(212, 160, 32, 0.1),
    inset 0 0 16px rgba(212, 160, 32, 0.03);
  animation: activeCardPulse 3s ease-in-out infinite;
}
.mobile-nav-card.router-link-exact-active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(212, 160, 32, 0.06) 45%, rgba(212, 160, 32, 0.1) 50%, rgba(212, 160, 32, 0.06) 55%, transparent 60%);
  animation: activeShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

.mobile-nav-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.12), rgba(212, 160, 32, 0.04));
  border: 1px solid rgba(212, 160, 32, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gold);
  opacity: 0.7;
  transition: all 0.25s ease;
}
.mobile-nav-card-icon svg {
  width: 24px;
  height: 24px;
}
.mobile-nav-card.router-link-exact-active .mobile-nav-card-icon {
  opacity: 1;
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.25), rgba(212, 160, 32, 0.1));
  border-color: rgba(212, 160, 32, 0.35);
  box-shadow: 0 0 14px rgba(212, 160, 32, 0.2);
  animation: iconGlow 2.5s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(212, 160, 32, 0.15); }
  50% { box-shadow: 0 0 18px rgba(212, 160, 32, 0.3); }
}

.mobile-nav-card-label {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: color 0.2s ease;
}
.mobile-nav-card.router-link-exact-active .mobile-nav-card-label {
  color: var(--color-gold);
}

.mobile-spacer {
  flex: 1;
}

/* ── Mobile logout ── */
.mobile-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  color: var(--color-error);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.05);
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s ease;
  letter-spacing: 0.04em;
  animation: logoutPulse 3s ease-in-out infinite;
}
.mobile-logout:active {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
  transform: scale(0.98);
}
.mobile-logout-icon {
  width: 20px;
  height: 20px;
}

@keyframes logoutPulse {
  0%, 100% {
    border-color: rgba(248, 113, 113, 0.15);
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
  }
  50% {
    border-color: rgba(248, 113, 113, 0.3);
    box-shadow: 0 0 12px rgba(248, 113, 113, 0.06);
  }
}

/* ── Bottom ornament ── */
.mobile-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 0 1rem;
  color: var(--color-gold);
  opacity: 0.15;
}
.mobile-ornament :deep(svg) {
  width: 22px;
  height: 22px;
}
.mobile-ornament-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.4), transparent);
}

/* ═══════════════════════════════════
   Main content
   ═══════════════════════════════════ */
.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════
   Responsive
   ═══════════════════════════════════ */
@media (max-width: 700px) {
  .nav-center,
  .nav-right {
    display: none;
  }
  .nav-mobile-right {
    display: flex;
  }
  .nav-inner {
    padding: 0 1rem;
    height: 56px;
  }
  .nav-logo-text {
    font-size: 1.1rem;
  }
  .nav-logo-icon :deep(svg) {
    width: 22px;
    height: 22px;
  }
  .mobile-overlay {
    top: 57px;
  }
  .main-content {
    padding: 1.25rem 1rem;
  }
}

@media (max-width: 380px) {
  .nav-logo-text {
    font-size: 1rem;
  }
  .nav-logo-icon :deep(svg) {
    width: 20px;
    height: 20px;
  }
  .mobile-profile-hero {
    padding: 0.85rem;
    gap: 0.65rem;
  }
  .mobile-avatar {
    width: 42px;
    height: 42px;
  }
  .mobile-avatar-text {
    font-size: 0.85rem;
  }
  .mobile-profile-name {
    font-size: 0.9rem;
  }
  .mobile-wallet-card {
    padding: 0.75rem 0.9rem;
  }
  .mobile-wallet-amount {
    font-size: 0.95rem;
  }
  .mobile-nav-grid {
    gap: 0.5rem;
  }
  .mobile-nav-card {
    padding: 0.85rem 0.5rem;
  }
  .main-content {
    padding: 1rem 0.75rem;
  }
}
</style>
