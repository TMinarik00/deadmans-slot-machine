<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
    <!-- Skull dome -->
    <path
      d="M32 4 C16 4 8 16 8 28 C8 36 12 42 18 46 L18 52 C18 54 20 56 22 56 L42 56 C44 56 46 54 46 52 L46 46 C52 42 56 36 56 28 C56 16 48 4 32 4Z"
    />
    <!-- Eye sockets -->
    <ellipse cx="23" cy="28" rx="6" ry="7" fill="var(--color-bg, #1a0f0a)" />
    <ellipse cx="41" cy="28" rx="6" ry="7" fill="var(--color-bg, #1a0f0a)" />
    <!-- Nose -->
    <path d="M30 38 L32 42 L34 38 Z" fill="var(--color-bg, #1a0f0a)" />
    <!-- Teeth -->
    <rect x="22" y="48" width="4" height="6" rx="1" fill="var(--color-bg, #1a0f0a)" />
    <rect x="28" y="48" width="4" height="6" rx="1" fill="var(--color-bg, #1a0f0a)" />
    <rect x="34" y="48" width="4" height="6" rx="1" fill="var(--color-bg, #1a0f0a)" />
    <rect x="40" y="48" width="4" height="6" rx="1" fill="var(--color-bg, #1a0f0a)" />
    <!-- Jaw line -->
    <path d="M22 48 L42 48" stroke="var(--color-bg, #1a0f0a)" stroke-width="1.5" />
    <!-- Crossbones -->
    <g opacity="0.9">
      <path d="M8 58 L56 62" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      <path d="M8 62 L56 58" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      <circle cx="6" cy="57" r="3" />
      <circle cx="6" cy="63" r="3" />
      <circle cx="58" cy="57" r="3" />
      <circle cx="58" cy="63" r="3" />
    </g>
  </svg>
</template>
