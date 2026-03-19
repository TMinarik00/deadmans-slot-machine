<!--
  Reusable form input with label, error state, and variants.
  Premium Wild West styling with gold focus glow.
  Usage: <BaseInput v-model="email" label="Email" type="email" placeholder="you@example.com" :error="errorMsg" />
-->
<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field-label" :for="inputId">{{ label }}</label>
    <div class="input-wrap" :class="{ 'input-wrap--has-toggle': isPassword }">
      <input
        :id="inputId"
        class="input"
        :class="[sizeClass, { 'input--mono': mono, 'input--has-toggle': isPassword }]"
        :type="computedType"
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
      <button
        v-if="isPassword"
        type="button"
        class="toggle-pw"
        tabindex="-1"
        @click="showPw = !showPw"
        :title="showPw ? 'Hide password' : 'Show password'"
      >
        <!-- Eye open -->
        <svg v-if="!showPw" viewBox="0 0 20 20" fill="currentColor" class="toggle-pw-icon">
          <path d="M10 3C5.5 3 1.7 5.9.5 10c1.2 4.1 5 7 9.5 7s8.3-2.9 9.5-7c-1.2-4.1-5-7-9.5-7zm0 11.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/>
          <circle cx="10" cy="10" r="2.5"/>
        </svg>
        <!-- Eye closed -->
        <svg v-else viewBox="0 0 20 20" fill="currentColor" class="toggle-pw-icon">
          <path d="M2.94 4.35a.75.75 0 011.06-.06l13 11.5a.75.75 0 01-1 1.12l-2.3-2.04A9.2 9.2 0 0110 16c-4.5 0-8.3-2.9-9.5-7a10.7 10.7 0 013.8-4.9L2.88 5.4a.75.75 0 01.06-1.06zM6.2 7.1A8.4 8.4 0 00.5 10c1.2 4.1 5 7 9.5 7 1.3 0 2.5-.2 3.6-.7l-1.7-1.5a4.5 4.5 0 01-5.7-5.1L6.2 7.1z"/>
          <path d="M10 5.5c.7 0 1.4.1 2 .4l-1.4 1.2a4.5 4.5 0 013.3 3.8l1.5 1.3A8.4 8.4 0 0019.5 10c-1.2-4.1-5-7-9.5-7-.9 0-1.7.1-2.5.3L9 4.5c.3-.03.6-.05 1-.05z"/>
        </svg>
      </button>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const showPw = ref(false);

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
const isPassword = computed(() => props.type === "password");
const computedType = computed(() => isPassword.value && showPw.value ? "text" : props.type);
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

/* ── Date input consistency across iOS/Android ── */
.input[type="date"] {
  color-scheme: dark;
  -webkit-text-fill-color: var(--color-text);
  min-height: 2.75rem;
}

.input[type="date"]::-webkit-date-and-time-value {
  text-align: left;
}

/* ── Password toggle ── */
.input--has-toggle {
  padding-right: 2.8rem;
}

.toggle-pw {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-pw:hover {
  color: var(--color-gold);
}
.toggle-pw-icon {
  width: 18px;
  height: 18px;
}
</style>
