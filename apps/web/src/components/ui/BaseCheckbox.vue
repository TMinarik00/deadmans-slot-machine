<!--
  Styled checkbox component matching the Wild West theme.
  Usage: <BaseCheckbox v-model="accepted" label="I accept the Terms" />
-->
<template>
  <label class="checkbox-wrap" :class="{ 'checkbox-wrap--error': error }">
    <input
      type="checkbox"
      class="checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="checkbox-box">
      <svg v-if="modelValue" viewBox="0 0 16 16" fill="none" class="checkbox-check">
        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
  <span v-if="error" class="checkbox-error">{{ error }}</span>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: "" },
  error: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.checkbox-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    rgba(16, 10, 6, 0.9) 0%,
    rgba(20, 12, 8, 0.95) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  margin-top: 1px;
}

.checkbox-input:checked + .checkbox-box {
  border-color: var(--color-gold);
  background: linear-gradient(
    135deg,
    rgba(212, 160, 32, 0.25) 0%,
    rgba(212, 160, 32, 0.1) 100%
  );
  box-shadow: 0 0 8px rgba(212, 160, 32, 0.15);
}

.checkbox-input:focus-visible + .checkbox-box {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(212, 160, 32, 0.1);
}

.checkbox-check {
  width: 14px;
  height: 14px;
  color: var(--color-gold);
}

.checkbox-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.checkbox-label a {
  color: var(--color-gold);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.checkbox-label a:hover {
  color: var(--color-text);
}

.checkbox-wrap--error .checkbox-box {
  border-color: var(--color-error);
}

.checkbox-error {
  font-size: 0.72rem;
  color: var(--color-error);
  margin-top: -0.2rem;
}
</style>
