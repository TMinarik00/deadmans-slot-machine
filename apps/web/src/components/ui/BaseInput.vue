<!--
  Reusable form input with label, error state, and variants.
  Usage: <BaseInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="errorMsg" />
-->
<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field-label" :for="inputId">{{ label }}</label>
    <div class="input-wrap">
      <input
        :id="inputId"
        class="input"
        :class="[sizeClass, { 'input--mono': mono }]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :min="min"
        :step="step"
        autocomplete="off"
        @input="$emit('update:modelValue', type === 'number' ? Number($event.target.value) : $event.target.value)"
        @blur="$emit('blur', $event)"
      />
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  error: { type: String, default: "" },
  hint: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: undefined },
  min: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
  mono: { type: Boolean, default: false },
  size: { type: String, default: "md", validator: (v) => ["sm", "md", "lg"].includes(v) },
});
defineEmits(["update:modelValue", "blur"]);

const inputId = computed(() => `input-${props.label?.replace(/\s/g, "-").toLowerCase() || Math.random().toString(36).slice(2, 8)}`);
const sizeClass = computed(() => props.size !== "md" ? `input--${props.size}` : "");
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px rgba(212, 160, 32, 0.1);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input--sm { padding: 0.4rem 0.6rem; font-size: 0.82rem; }
.input--lg { font-size: 1.4rem; font-weight: 700; text-align: center; padding: 0.7rem; }
.input--mono { font-family: "Courier New", monospace; letter-spacing: 0.05em; }

.field--error .input {
  border-color: var(--color-error);
}
.field--error .input:focus {
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.15);
}

.field-error {
  font-size: 0.72rem;
  color: var(--color-error);
}

.field-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}
</style>
