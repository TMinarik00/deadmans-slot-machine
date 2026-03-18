<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" fill="currentColor" aria-hidden="true">
    <!-- Card body -->
    <rect x="2" y="2" width="44" height="60" rx="4" fill="currentColor" opacity="0.15" />
    <rect x="2" y="2" width="44" height="60" rx="4" fill="none" stroke="currentColor" stroke-width="2" />
    <!-- Spade symbol center -->
    <path d="M24 18 C24 18 14 28 14 33 C14 37 17 39 20 38 C22 37 23 36 24 34 C25 36 26 37 28 38 C31 39 34 37 34 33 C34 28 24 18 24 18Z" />
    <!-- Spade stem -->
    <rect x="22" y="35" width="4" height="8" rx="1" />
    <!-- Spade base -->
    <path d="M19 43 Q24 40 29 43Z" />
    <!-- Corner pip top-left -->
    <text x="7" y="13" font-size="9" font-weight="bold" fill="currentColor" font-family="serif">A</text>
    <path d="M8 15 C8 15 5 18 5 19.5 C5 21 6.5 21 7 20.5 C7 21 8.5 21 8.5 19.5 C8.5 18 8 15 8 15Z" transform="scale(0.7) translate(3,8)" />
    <!-- Corner pip bottom-right (rotated) -->
    <text x="41" y="57" font-size="9" font-weight="bold" fill="currentColor" font-family="serif" transform="rotate(180, 41, 53)">A</text>
  </svg>
</template>
