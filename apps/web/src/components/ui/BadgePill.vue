<!--
  Reusable badge/pill component for displaying small info tags.
-->
<template>
  <span class="badge-pill" :class="`badge-${variant}`">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "default", validator: (v) => ["default", "gold", "info"].includes(v) },
});
</script>

<style scoped>
.badge-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-default {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-gold {
  background: rgba(212, 160, 32, 0.15);
  color: var(--color-gold);
  border: 1px solid rgba(212, 160, 32, 0.25);
}

.badge-info {
  background: rgba(100, 200, 255, 0.12);
  color: #7dd3fc;
  border: 1px solid rgba(100, 200, 255, 0.2);
}
</style>
