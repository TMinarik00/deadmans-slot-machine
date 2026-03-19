<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" fill="currentColor" aria-hidden="true">
    <!-- Main trunk -->
    <rect x="18" y="8" width="12" height="50" rx="6" />
    <!-- Left arm -->
    <path d="M18 28 L10 28 C6 28 4 30 4 34 L4 38 C4 42 6 44 10 44 L10 44 C10 40 10 36 10 36 L18 36Z" />
    <!-- Extend left arm upward -->
    <rect x="6" y="20" width="8" height="16" rx="4" />
    <!-- Right arm -->
    <path d="M30 20 L38 20 C42 20 44 22 44 26 L44 30 C44 34 42 36 38 36 L38 36 C38 32 38 28 38 28 L30 28Z" />
    <!-- Extend right arm upward -->
    <rect x="34" y="10" width="8" height="18" rx="4" />
    <!-- Trunk lines for texture -->
    <line x1="22" y1="12" x2="22" y2="56" stroke="var(--color-bg, #1a0f0a)" stroke-width="0.6" opacity="0.2" />
    <line x1="26" y1="12" x2="26" y2="56" stroke="var(--color-bg, #1a0f0a)" stroke-width="0.6" opacity="0.2" />
    <!-- Ground base -->
    <ellipse cx="24" cy="58" rx="14" ry="3" opacity="0.3" />
  </svg>
</template>
