<!--
  Auth layout - premium Wild West casino entrance.
  Features animated casino background, dramatic logo with brand mark,
  ornamental framing, and smooth page transitions.
-->
<template>
  <div class="auth-layout">
    <AnimatedBackground variant="auth" />

    <div class="auth-container">
      <!-- Ornamental corner brackets -->
      <div class="corner corner--tl" />
      <div class="corner corner--tr" />
      <div class="corner corner--bl" />
      <div class="corner corner--br" />

      <!-- Side ornaments -->
      <div class="side-ornament side-ornament--left">
        <IconBullet class="side-ornament__icon" />
        <IconBullet class="side-ornament__icon" />
        <IconBullet class="side-ornament__icon" />
      </div>
      <div class="side-ornament side-ornament--right">
        <IconBullet class="side-ornament__icon" />
        <IconBullet class="side-ornament__icon" />
        <IconBullet class="side-ornament__icon" />
      </div>

      <div class="auth-header">
        <!-- Top decorative line -->
        <div class="ornament-line">
          <IconStar class="ornament-line__star" />
        </div>

        <div class="logo-row">
          <IconRevolver class="logo-decor logo-decor--left" />
          <div class="logo-text">
            <h1 class="logo">Dead Man's</h1>
            <div class="logo-subtitle">
              <span class="subtitle-line" />
              <span class="subtitle-diamond" />
              <span class="subtitle-label">Slot Machine</span>
              <span class="subtitle-diamond" />
              <span class="subtitle-line" />
            </div>
          </div>
          <IconRevolver class="logo-decor logo-decor--right" />
        </div>

        <!-- Brand mark -->
        <div class="brand-mark">
          <IconSkull class="brand-mark__icon" />
        </div>

        <!-- Bottom decorative line -->
        <div class="ornament-line ornament-line--bottom">
          <IconStar class="ornament-line__star" />
        </div>
      </div>

      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import AnimatedBackground from "../components/ui/AnimatedBackground.vue";
import { IconRevolver, IconSkull, IconStar, IconBullet } from "../components/icons/index.js";
</script>

<style scoped>
.auth-layout {
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  padding: 2rem 1.5rem;
}

/* ── Ornamental corner brackets ── */
.corner {
  position: absolute;
  width: 32px;
  height: 32px;
  pointer-events: none;
}
.corner--tl {
  top: 0;
  left: 0;
  border-top: 2px solid var(--color-gold);
  border-left: 2px solid var(--color-gold);
  opacity: 0.35;
}
.corner--tr {
  top: 0;
  right: 0;
  border-top: 2px solid var(--color-gold);
  border-right: 2px solid var(--color-gold);
  opacity: 0.35;
}
.corner--bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid var(--color-gold);
  border-left: 2px solid var(--color-gold);
  opacity: 0.35;
}
.corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid var(--color-gold);
  border-right: 2px solid var(--color-gold);
  opacity: 0.35;
}

/* ── Side bullet ornaments ── */
.side-ornament {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0.12;
  pointer-events: none;
}
.side-ornament--left { left: -8px; }
.side-ornament--right { right: -8px; }
.side-ornament__icon {
  width: 8px;
  height: 20px;
  color: var(--color-gold);
}

/* ── Auth header ── */
.auth-header {
  text-align: center;
  margin-bottom: 1.75rem;
  animation: fadeUp 0.3s ease-out;
}

/* ── Ornamental divider lines ── */
.ornament-line {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  gap: 0;
}
.ornament-line--bottom {
  margin-bottom: 0;
  margin-top: 0.5rem;
}

.ornament-line::before,
.ornament-line::after {
  content: "";
  flex: 1;
  height: 1px;
  max-width: 100px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.3));
}
.ornament-line::after {
  background: linear-gradient(90deg, rgba(212, 160, 32, 0.3), transparent);
}

.ornament-line__star {
  width: 14px;
  height: 14px;
  color: var(--color-gold);
  opacity: 0.3;
  margin: 0 0.5rem;
  flex-shrink: 0;
}

/* ── Logo section ── */
.logo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  font-family: var(--font-display);
  font-size: 2.8rem;
  color: var(--color-gold);
  margin: 0;
  line-height: 1.1;
  text-shadow:
    0 0 10px rgba(212, 160, 32, 0.4),
    0 2px 20px rgba(212, 160, 32, 0.2),
    0 0 50px rgba(212, 160, 32, 0.1);
  animation: logoGlow 3s ease-in-out infinite;
  background: linear-gradient(180deg, #ffd700, #d4a020, #b8860b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(212, 160, 32, 0.3));
}

.logo-decor {
  width: 36px;
  height: 36px;
  color: var(--color-gold);
  opacity: 0.35;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(212, 160, 32, 0.2));
}
.logo-decor--left {
  transform: scaleX(-1) rotate(-10deg);
}
.logo-decor--right {
  transform: rotate(10deg);
}

@keyframes logoGlow {
  0%, 100% {
    filter: drop-shadow(0 2px 8px rgba(212, 160, 32, 0.3));
  }
  50% {
    filter: drop-shadow(0 2px 16px rgba(212, 160, 32, 0.5))
           drop-shadow(0 0 40px rgba(212, 160, 32, 0.15));
  }
}

/* ── Subtitle with ornamental lines ── */
.logo-subtitle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.subtitle-label {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.subtitle-line {
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.35));
  flex-shrink: 0;
}
.subtitle-line:last-of-type {
  background: linear-gradient(90deg, rgba(212, 160, 32, 0.35), transparent);
}

.subtitle-diamond {
  width: 4px;
  height: 4px;
  background: var(--color-gold);
  transform: rotate(45deg);
  opacity: 0.4;
  flex-shrink: 0;
}

/* ── Brand mark (skull) ── */
.brand-mark {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}
.brand-mark__icon {
  width: 28px;
  height: 28px;
  color: var(--color-gold);
  opacity: 0.15;
  filter: drop-shadow(0 0 6px rgba(212, 160, 32, 0.2));
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .auth-container {
    max-width: 100%;
    padding: 1.25rem 1rem;
  }
  .auth-header {
    margin-bottom: 1.25rem;
  }
  .logo {
    font-size: 2.1rem;
  }
  .logo-decor {
    width: 26px;
    height: 26px;
  }
  .subtitle-label {
    font-size: 0.75rem;
    letter-spacing: 2.5px;
  }
  .corner {
    width: 20px;
    height: 20px;
  }
  .side-ornament {
    display: none;
  }
  .brand-mark__icon {
    width: 22px;
    height: 22px;
  }
}

/* ── Short viewport scaling (laptops, short browsers) ── */
@media (max-height: 750px) {
  .auth-container {
    padding: 1rem 1.5rem;
  }
  .auth-header {
    margin-bottom: 1rem;
  }
  .logo {
    font-size: 2.2rem;
  }
  .brand-mark {
    margin-top: 0.25rem;
  }
  .brand-mark__icon {
    width: 22px;
    height: 22px;
  }
  .ornament-line {
    margin-bottom: 0.4rem;
  }
  .ornament-line--bottom {
    margin-top: 0.25rem;
  }
  .logo-decor {
    width: 28px;
    height: 28px;
  }
}

@media (max-height: 620px) {
  .auth-container {
    padding: 0.5rem 1.25rem;
  }
  .auth-header {
    margin-bottom: 0.5rem;
  }
  .logo {
    font-size: 1.8rem;
  }
  .logo-decor {
    width: 22px;
    height: 22px;
  }
  .brand-mark {
    display: none;
  }
  .ornament-line {
    margin-bottom: 0.3rem;
  }
  .ornament-line--bottom {
    margin-top: 0.15rem;
  }
  .subtitle-label {
    font-size: 0.7rem;
    letter-spacing: 2px;
  }
}
</style>
