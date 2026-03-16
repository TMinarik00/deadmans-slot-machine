<!--
  Reusable form input with label, error state, and variants.
  Premium Wild West styling with gold focus glow.
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

.input-wrap {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: linear-gradient(
    180deg,
    rgba(16, 10, 6, 0.9) 0%,
    rgba(20, 12, 8, 0.95) 100%
  );
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.95rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.input::placeholder {
  color: rgba(160, 128, 96, 0.5);
}

.input:focus {
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
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
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
