<!--
  Reusable button component with variant styling.
  Premium Wild West gold treatment.
  Variants: primary (gold), secondary (outline), ghost (text only), danger (red)
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
  variant: { type: String, default: "primary", validator: (v) => ["primary", "secondary", "ghost", "danger"].includes(v) },
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
  padding: 0.6rem 1.3rem;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Primary - premium gold fill */
.btn-primary {
  background: linear-gradient(
    150deg,
    #ffd700 0%,
    #d4a020 40%,
    #b8860b 100%
  );
  color: #1a0f0a;
  border-color: rgba(212, 160, 32, 0.8);
  box-shadow:
    0 2px 10px rgba(212, 160, 32, 0.25),
    inset 0 1px 0 rgba(255, 215, 0, 0.3);
  text-shadow: 0 1px 0 rgba(255, 215, 0, 0.2);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(
    150deg,
    #ffe44d 0%,
    #e8b630 40%,
    #c49a14 100%
  );
  transform: translateY(-2px);
  box-shadow:
    0 6px 24px rgba(212, 160, 32, 0.4),
    0 0 30px rgba(212, 160, 32, 0.12),
    inset 0 1px 0 rgba(255, 215, 0, 0.4);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    0 2px 8px rgba(212, 160, 32, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Secondary - outline with gold hover */
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 12px rgba(212, 160, 32, 0.1);
}

/* Danger - destructive action */
.btn-danger {
  background: linear-gradient(150deg, #ef4444, #dc2626);
  color: #fff;
  border-color: #dc2626;
}
.btn-danger:hover:not(:disabled) {
  background: linear-gradient(150deg, #f87171, #ef4444);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35);
}
.btn-danger:active:not(:disabled) {
  transform: translateY(0);
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
.btn-sm { padding: 0.3rem 0.7rem; font-size: 0.75rem; border-radius: 8px; }
.btn-lg { padding: 0.8rem 2rem; font-size: 1.1rem; border-radius: 12px; }

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
