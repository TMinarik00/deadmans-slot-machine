<!--
  Reusable button component with variant styling.
  Variants: primary (gold), secondary (outline), ghost (text only)
-->
<template>
  <button
    class="base-btn"
    :class="[
      `btn-${variant}`,
      { 'btn-block': block, 'btn-sm': size === 'sm', 'btn-lg': size === 'lg' },
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn-spinner" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "primary", validator: (v) => ["primary", "secondary", "ghost"].includes(v) },
  size: { type: String, default: "md", validator: (v) => ["sm", "md", "lg"].includes(v) },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 1.2rem;
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  white-space: nowrap;
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Primary - golden fill */
.btn-primary {
  background: linear-gradient(145deg, #d4a020, #8b6914);
  color: #1a0f0a;
  border-color: var(--color-gold);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(145deg, #e8b630, #a07a18);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(212, 160, 32, 0.3);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary - outline */
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* Ghost - text only */
.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
  border-color: transparent;
  padding: 0.4rem 0.6rem;
}
.btn-ghost:hover:not(:disabled) {
  color: var(--color-gold);
}

/* Sizes */
.btn-sm { padding: 0.3rem 0.7rem; font-size: 0.75rem; border-radius: 6px; }
.btn-lg { padding: 0.75rem 2rem; font-size: 1.1rem; border-radius: 10px; }

/* Block */
.btn-block { width: 100%; }

/* Spinner */
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
