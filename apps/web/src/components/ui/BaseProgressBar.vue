<!--
  Reusable progress bar with optional label.
  Usage: <BaseProgressBar :percent="65" /> or <BaseProgressBar :value="300" :max="500" label="300 / 500 XP" />
-->
<template>
  <div class="progress-wrap">
    <div class="progress-bar" :class="[`progress--${variant}`, sizeClass]">
      <div class="progress-fill" :style="{ width: barPercent + '%' }" />
    </div>
    <span v-if="label" class="progress-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  percent: { type: Number, default: undefined },
  value: { type: Number, default: undefined },
  max: { type: Number, default: 100 },
  label: { type: String, default: "" },
  variant: { type: String, default: "gold", validator: (v) => ["gold", "success", "info"].includes(v) },
  size: { type: String, default: "md", validator: (v) => ["sm", "md", "lg"].includes(v) },
});

const barPercent = computed(() => {
  if (props.percent !== undefined) return Math.min(100, Math.max(0, props.percent));
  if (props.value !== undefined && props.max > 0) return Math.min(100, (props.value / props.max) * 100);
  return 0;
});

const sizeClass = computed(() => props.size !== "md" ? `progress--${props.size}` : "");
</script>

<style scoped>
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(139, 105, 20, 0.2);
}

.progress--sm { height: 5px; }
.progress--lg { height: 12px; }

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress--gold .progress-fill {
  background: linear-gradient(90deg, #d4a020, #ffd700);
}

.progress--success .progress-fill {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.progress--info .progress-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}
</style>
