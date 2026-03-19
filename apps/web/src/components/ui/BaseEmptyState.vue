<!--
  Reusable empty/placeholder state component.
  Usage: <BaseEmptyState icon="cards" message="No games yet" />
-->
<template>
  <div class="empty-state">
    <span v-if="icon" class="empty-icon">{{ icons[icon] || icon }}</span>
    <p class="empty-message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: "Nothing here yet" },
  icon: { type: String, default: "" },
});

const icons = {
  cards: "\uD83C\uDCCF",
  trophy: "\uD83C\uDFC6",
  chart: "\uD83D\uDCC8",
  wallet: "\uD83D\uDCB0",
  search: "\uD83D\uDD0D",
  star: "\u2B50",
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.empty-message {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  margin: 0;
  line-height: 1.4;
}
</style>
