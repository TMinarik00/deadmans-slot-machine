<!--
  Animated casino background with ambient floating particles, ember glows,
  drifting smoke, and Wild West icon silhouettes.
  All animations are seamless infinite loops - no visible restart.
-->
<template>
  <div class="animated-bg" :class="`animated-bg--${variant}`">
    <!-- Radial glows -->
    <div class="bg-glow bg-glow--primary" />
    <div class="bg-glow bg-glow--secondary" />
    <div class="bg-glow bg-glow--warm" />

    <!-- Noise texture overlay -->
    <div class="bg-noise" />

    <!-- Vignette -->
    <div class="bg-vignette" />

    <!-- Smoke wisps -->
    <div
      v-for="s in smokeWisps"
      :key="'s-' + s.id"
      class="smoke-wisp"
      :style="s.style"
    />

    <!-- Dust particles -->
    <span
      v-for="p in particles"
      :key="'p-' + p.id"
      class="dust-particle"
      :class="p.animClass"
      :style="p.style"
    />

    <!-- Ember glows -->
    <span
      v-for="e in embers"
      :key="'e-' + e.id"
      class="ember-glow"
      :class="e.animClass"
      :style="e.style"
    />

    <!-- Floating icons -->
    <component
      v-for="icon in floatingIcons"
      :key="'i-' + icon.id"
      :is="icon.component"
      class="floating-icon"
      :class="icon.animClass"
      :style="icon.style"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  IconRevolver,
  IconCard,
  IconDice,
  IconHorseshoe,
  IconStar,
  IconSkull,
  IconBullet,
  IconTarget,
  IconCactus,
  IconHat,
} from "../icons/index.js";

const props = defineProps({
  variant: {
    type: String,
    default: "auth",
    validator: (v) => ["auth", "default"].includes(v),
  },
});

const allIcons = [
  IconRevolver, IconCard, IconDice, IconHorseshoe, IconStar,
  IconSkull, IconBullet, IconTarget, IconCactus, IconHat,
];

// 3 different float animation variants to avoid everything moving in sync
const floatVariants = ["float-a", "float-b", "float-c"];

function seededRandom(seed) {
  let x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const isMobile =
  typeof window !== "undefined" && window.innerWidth < 700;

const particleCount = computed(() => (isMobile ? 18 : 45));
const emberCount = computed(() => (isMobile ? 8 : 20));
const iconCount = computed(() => (isMobile ? 8 : 20));
const smokeCount = computed(() => (isMobile ? 3 : 6));

// ── Dust particles: grid-placed with jitter for even spread ──
const particles = computed(() => {
  const count = particleCount.value;
  const cols = Math.ceil(Math.sqrt(count * 1.8));
  const rows = Math.ceil(count / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const items = [];
  for (let i = 0; i < count; i++) {
    const r = (s) => seededRandom(i * 17 + s);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = (col + 0.1 + r(1) * 0.8) * cellW;
    const top = (row + 0.1 + r(2) * 0.8) * cellH;

    const size = 2 + r(3) * 4;
    const duration = 8 + r(4) * 14;
    const delay = r(5) * -20;
    const opacity = 0.2 + r(6) * 0.45;
    const driftX = 10 + r(7) * 30;
    const driftY = 8 + r(8) * 20;
    const animVariant = floatVariants[i % 3];

    items.push({
      id: i,
      animClass: animVariant,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        "--drift-x": `${driftX}px`,
        "--drift-y": `${driftY}px`,
        "--base-opacity": opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
  }
  return items;
});

// ── Ember glows: grid-placed warm pulsing dots ──
const embers = computed(() => {
  const count = emberCount.value;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const items = [];
  for (let i = 0; i < count; i++) {
    const r = (s) => seededRandom(i * 23 + s + 200);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = (col + 0.1 + r(1) * 0.8) * cellW;
    const top = (row + 0.1 + r(2) * 0.8) * cellH;

    const size = 2 + r(3) * 4;
    const duration = 5 + r(4) * 8;
    const delay = r(5) * -12;
    const opacity = 0.3 + r(6) * 0.5;
    const driftX = 6 + r(7) * 16;
    const driftY = 5 + r(8) * 14;
    const animVariant = floatVariants[(i + 1) % 3];

    items.push({
      id: i,
      animClass: animVariant,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        "--drift-x": `${driftX}px`,
        "--drift-y": `${driftY}px`,
        "--base-opacity": opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
  }
  return items;
});

// ── Smoke wisps: slow horizontal drift ──
const smokeWisps = computed(() => {
  const items = [];
  for (let i = 0; i < smokeCount.value; i++) {
    const r = (s) => seededRandom(i * 41 + s + 300);
    const width = 200 + r(1) * 400;
    const height = 50 + r(2) * 80;
    const left = -5 + r(3) * 70;
    const top = 10 + r(4) * 80;
    const duration = 20 + r(5) * 25;
    const delay = r(6) * -20;
    const opacity = 0.04 + r(7) * 0.06;

    items.push({
      id: i,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}%`,
        top: `${top}%`,
        "--s-opacity": opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
  }
  return items;
});

// ── Floating icons: grid-based placement for even distribution ──
const floatingIcons = computed(() => {
  const count = iconCount.value;
  // Calculate grid dimensions to cover the viewport evenly
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const items = [];
  for (let i = 0; i < count; i++) {
    const r = (s) => seededRandom(i * 31 + s + 100);
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Place within grid cell with jitter (30% padding from edges)
    const jitterX = 0.15 + r(1) * 0.7; // 15%-85% within cell
    const jitterY = 0.15 + r(2) * 0.7;
    const left = (col + jitterX) * cellW;
    const top = (row + jitterY) * cellH;

    const size = 32 + r(3) * 40;
    const duration = 12 + r(4) * 18;
    const delay = r(5) * -25;
    const opacity = 0.12 + r(6) * 0.16;
    const baseRotate = -10 + r(7) * 20;
    const iconIdx = Math.floor(r(8) * allIcons.length);
    const driftX = 8 + r(9) * 18;
    const driftY = 6 + r(10) * 16;
    const rotateRange = 4 + r(11) * 10;
    const animVariant = floatVariants[(i + 2) % 3];

    items.push({
      id: i,
      component: allIcons[iconIdx],
      animClass: animVariant,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        "--drift-x": `${driftX}px`,
        "--drift-y": `${driftY}px`,
        "--base-opacity": opacity,
        "--base-rotate": `${baseRotate}deg`,
        "--rotate-range": `${rotateRange}deg`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    });
  }
  return items;
});
</script>

<style scoped>
.animated-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  contain: strict;
}

/* ══════════════════════════════════════
   Radial Glows
   ══════════════════════════════════════ */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.bg-glow--primary {
  width: 600px;
  height: 600px;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(212, 160, 32, 0.1) 0%,
    rgba(212, 160, 32, 0.04) 40%,
    transparent 70%
  );
  animation: glowPulse1 4s ease-in-out infinite;
}

.bg-glow--secondary {
  width: 900px;
  height: 900px;
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(212, 160, 32, 0.05) 0%,
    rgba(139, 105, 20, 0.025) 40%,
    transparent 65%
  );
  animation: glowPulse2 7s ease-in-out infinite;
}

.bg-glow--warm {
  width: 500px;
  height: 500px;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgba(180, 100, 20, 0.06) 0%,
    rgba(139, 60, 10, 0.02) 50%,
    transparent 70%
  );
  animation: glowPulse3 5s ease-in-out infinite;
}

@keyframes glowPulse1 {
  0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}
@keyframes glowPulse2 {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.9; transform: translateX(-50%) scale(1.06); }
}
@keyframes glowPulse3 {
  0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.12); }
}

/* ══════════════════════════════════════
   Noise Texture
   ══════════════════════════════════════ */
.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* ══════════════════════════════════════
   Vignette
   ══════════════════════════════════════ */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 30%,
    rgba(10, 6, 3, 0.55) 100%
  );
  pointer-events: none;
}
.animated-bg--default .bg-vignette {
  background: radial-gradient(
    ellipse at center,
    transparent 45%,
    rgba(10, 6, 3, 0.4) 100%
  );
}

/* ══════════════════════════════════════
   Three seamless float animation variants
   Elements bob in place - never leave viewport
   ══════════════════════════════════════ */

/* Variant A: figure-eight-ish loop */
.float-a {
  animation: floatA var(--dur, 12s) ease-in-out infinite;
}
@keyframes floatA {
  0%, 100% {
    transform: translate(0, 0);
    opacity: var(--base-opacity);
  }
  25% {
    transform: translate(var(--drift-x), calc(var(--drift-y) * -1));
    opacity: calc(var(--base-opacity) * 1.2);
  }
  50% {
    transform: translate(calc(var(--drift-x) * -0.5), var(--drift-y));
    opacity: var(--base-opacity);
  }
  75% {
    transform: translate(calc(var(--drift-x) * -1), calc(var(--drift-y) * -0.6));
    opacity: calc(var(--base-opacity) * 0.85);
  }
}

/* Variant B: elliptical orbit */
.float-b {
  animation: floatB var(--dur, 12s) ease-in-out infinite;
}
@keyframes floatB {
  0%, 100% {
    transform: translate(0, 0);
    opacity: var(--base-opacity);
  }
  25% {
    transform: translate(calc(var(--drift-x) * -1), calc(var(--drift-y) * -0.8));
    opacity: calc(var(--base-opacity) * 0.9);
  }
  50% {
    transform: translate(0, calc(var(--drift-y) * 1));
    opacity: calc(var(--base-opacity) * 1.3);
  }
  75% {
    transform: translate(var(--drift-x), calc(var(--drift-y) * -0.5));
    opacity: var(--base-opacity);
  }
}

/* Variant C: lazy drift */
.float-c {
  animation: floatC var(--dur, 12s) ease-in-out infinite;
}
@keyframes floatC {
  0%, 100% {
    transform: translate(0, 0);
    opacity: calc(var(--base-opacity) * 0.9);
  }
  33% {
    transform: translate(var(--drift-x), var(--drift-y));
    opacity: var(--base-opacity);
  }
  66% {
    transform: translate(calc(var(--drift-x) * -0.7), calc(var(--drift-y) * -1));
    opacity: calc(var(--base-opacity) * 1.15);
  }
}

/* ══════════════════════════════════════
   Smoke Wisps - slow horizontal sway
   ══════════════════════════════════════ */
.smoke-wisp {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(212, 160, 32, 0.12) 0%,
    rgba(160, 120, 60, 0.04) 40%,
    transparent 70%
  );
  opacity: var(--s-opacity);
  will-change: transform, opacity;
  animation: driftSmoke ease-in-out infinite;
  filter: blur(30px);
}

@keyframes driftSmoke {
  0%, 100% {
    transform: translateX(0) scaleX(1);
    opacity: var(--s-opacity);
  }
  30% {
    transform: translateX(8vw) scaleX(1.2);
    opacity: calc(var(--s-opacity) * 1.3);
  }
  70% {
    transform: translateX(-6vw) scaleX(0.9);
    opacity: calc(var(--s-opacity) * 0.8);
  }
}

/* ══════════════════════════════════════
   Dust Particles
   ══════════════════════════════════════ */
.dust-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 160, 32, 1) 0%,
    rgba(212, 160, 32, 0.4) 100%
  );
  will-change: transform, opacity;
}

/* ══════════════════════════════════════
   Ember Glows - warm pulsing dots
   ══════════════════════════════════════ */
.ember-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 200, 60, 1) 0%,
    rgba(255, 160, 30, 0.7) 40%,
    rgba(212, 120, 20, 0) 100%
  );
  box-shadow: 0 0 6px rgba(255, 180, 40, 0.4);
  will-change: transform, opacity;
}

/* ══════════════════════════════════════
   Floating Icons - sway with rotation
   ══════════════════════════════════════ */
.floating-icon {
  position: absolute;
  color: #d4a020;
  will-change: transform, opacity;
  filter: drop-shadow(0 0 3px rgba(212, 160, 32, 0.2));
}

/* Override the float keyframes for icons to include rotation */
.floating-icon.float-a {
  animation: iconFloatA var(--dur, 12s) ease-in-out infinite;
}
.floating-icon.float-b {
  animation: iconFloatB var(--dur, 12s) ease-in-out infinite;
}
.floating-icon.float-c {
  animation: iconFloatC var(--dur, 12s) ease-in-out infinite;
}

@keyframes iconFloatA {
  0%, 100% {
    transform: translate(0, 0) rotate(var(--base-rotate));
    opacity: var(--base-opacity);
  }
  25% {
    transform: translate(var(--drift-x), calc(var(--drift-y) * -1)) rotate(calc(var(--base-rotate) + var(--rotate-range)));
    opacity: calc(var(--base-opacity) * 1.2);
  }
  50% {
    transform: translate(calc(var(--drift-x) * -0.5), var(--drift-y)) rotate(var(--base-rotate));
    opacity: var(--base-opacity);
  }
  75% {
    transform: translate(calc(var(--drift-x) * -1), calc(var(--drift-y) * -0.6)) rotate(calc(var(--base-rotate) - var(--rotate-range)));
    opacity: calc(var(--base-opacity) * 0.85);
  }
}

@keyframes iconFloatB {
  0%, 100% {
    transform: translate(0, 0) rotate(var(--base-rotate));
    opacity: var(--base-opacity);
  }
  25% {
    transform: translate(calc(var(--drift-x) * -1), calc(var(--drift-y) * -0.8)) rotate(calc(var(--base-rotate) - var(--rotate-range)));
    opacity: calc(var(--base-opacity) * 0.9);
  }
  50% {
    transform: translate(0, calc(var(--drift-y) * 1)) rotate(calc(var(--base-rotate) + var(--rotate-range)));
    opacity: calc(var(--base-opacity) * 1.3);
  }
  75% {
    transform: translate(var(--drift-x), calc(var(--drift-y) * -0.5)) rotate(var(--base-rotate));
    opacity: var(--base-opacity);
  }
}

@keyframes iconFloatC {
  0%, 100% {
    transform: translate(0, 0) rotate(var(--base-rotate));
    opacity: calc(var(--base-opacity) * 0.9);
  }
  33% {
    transform: translate(var(--drift-x), var(--drift-y)) rotate(calc(var(--base-rotate) + var(--rotate-range)));
    opacity: var(--base-opacity);
  }
  66% {
    transform: translate(calc(var(--drift-x) * -0.7), calc(var(--drift-y) * -1)) rotate(calc(var(--base-rotate) - var(--rotate-range)));
    opacity: calc(var(--base-opacity) * 1.15);
  }
}

/* ══════════════════════════════════════
   Reduced Motion
   ══════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .dust-particle,
  .ember-glow,
  .floating-icon,
  .smoke-wisp,
  .bg-glow--primary,
  .bg-glow--secondary,
  .bg-glow--warm {
    animation: none !important;
  }
}
</style>
