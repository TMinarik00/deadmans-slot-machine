<!--
  Reusable styled select dropdown matching BaseInput design.
  Usage: <BaseSelect v-model="value" label="Country" :options="options" />
-->
<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field-label" :for="selectId">{{ label }}</label>
    <div class="select-wrap">
      <select
        :id="selectId"
        class="select-input"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <svg class="select-chevron" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
      </svg>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Select..." },
  options: { type: Array, default: () => [] },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);

const selectId = computed(() =>
  `select-${props.label?.replace(/\s/g, "-").toLowerCase() || Math.random().toString(36).slice(2, 8)}`
);
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  transition: color 0.2s ease;
}

.field:focus-within .field-label {
  color: var(--color-gold);
}

.select-wrap {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 0.85rem;
  background: linear-gradient(
    180deg,
    rgba(16, 10, 6, 0.9) 0%,
    rgba(20, 12, 8, 0.95) 100%
  );
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.95rem;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow:
    0 0 0 3px rgba(212, 160, 32, 0.1),
    0 0 16px rgba(212, 160, 32, 0.08),
    inset 0 0 8px rgba(212, 160, 32, 0.03);
  background: linear-gradient(
    180deg,
    rgba(20, 12, 8, 0.95) 0%,
    rgba(26, 16, 10, 0.98) 100%
  );
}

.select-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-input option {
  background: #1a0e08;
  color: var(--color-text);
}

.select-chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.field--error .select-input {
  border-color: var(--color-error);
}
.field--error .select-input:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
}

.field-error {
  font-size: 0.72rem;
  color: var(--color-error);
}
</style>
