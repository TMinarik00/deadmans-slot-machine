<!--
  Reusable tab bar component.
  Usage: <BaseTabs :tabs="[{ value: 'all', label: 'All' }]" v-model="selected" />
-->
<template>
  <div class="tabs" :class="{ 'tabs--compact': compact }">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tab"
      :class="{ active: modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >{{ tab.label }}</button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true },
  compact: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tabs--compact { gap: 0.25rem; }

.tab {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
}

.tab:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.tab.active {
  background: rgba(212, 160, 32, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.tabs--compact .tab {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
}
</style>
