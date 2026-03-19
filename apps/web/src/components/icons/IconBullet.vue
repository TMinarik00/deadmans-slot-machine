<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64" fill="currentColor" aria-hidden="true">
    <!-- Bullet tip -->
    <path d="M12 2 C8 2 5 10 5 18 L19 18 C19 10 16 2 12 2Z" />
    <!-- Casing -->
    <rect x="4" y="18" width="16" height="36" rx="1" />
    <!-- Casing rim -->
    <rect x="3" y="54" width="18" height="4" rx="2" />
    <!-- Crimp line -->
    <path d="M5 18 L19 18" stroke="var(--color-bg, #1a0f0a)" stroke-width="1.5" opacity="0.4" />
    <!-- Casing lines -->
    <path d="M5 28 L19 28" stroke="var(--color-bg, #1a0f0a)" stroke-width="0.5" opacity="0.2" />
    <path d="M5 38 L19 38" stroke="var(--color-bg, #1a0f0a)" stroke-width="0.5" opacity="0.2" />
    <!-- Primer -->
    <circle cx="12" cy="57" r="3" fill="var(--color-bg, #1a0f0a)" opacity="0.3" />
  </svg>
</template>
