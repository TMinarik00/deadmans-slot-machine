<!--
  Reusable card wrapper with consistent surface styling.
  Usage: <BaseCard><template #header>Title</template>Content</BaseCard>
-->
<template>
  <div class="card" :class="[`card--${variant}`, { 'card--glow': glow, 'card--hover': hoverable }]">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body" :class="{ 'card-body--flush': flush }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "default", validator: (v) => ["default", "gold", "subtle"].includes(v) },
  glow: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: false },
  flush: { type: Boolean, default: false },
});
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  transition: all 0.25s ease;
}

.card--gold {
  border: 2px solid var(--color-gold);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(212, 160, 32, 0.06) 100%);
}

.card--subtle {
  border-color: rgba(139, 105, 20, 0.3);
  background: rgba(42, 26, 16, 0.6);
}

.card--glow {
  box-shadow: 0 0 20px rgba(212, 160, 32, 0.1);
}

.card--hover:hover {
  border-color: var(--color-gold);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(212, 160, 32, 0.12);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.card-body {
  padding: 1.25rem;
}

.card-body--flush {
  padding: 0;
}

.card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 480px) {
  .card { border-radius: 10px; }
  .card-body { padding: 1rem; }
  .card-header, .card-footer { padding: 0.75rem 1rem; }
}
</style>
