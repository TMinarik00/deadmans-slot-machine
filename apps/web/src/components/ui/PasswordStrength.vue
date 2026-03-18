<!--
  Password strength indicator. Shows a 4-segment bar that fills
  based on password complexity + a text label.
  Usage: <PasswordStrength :password="password" />
-->
<template>
  <div class="pw-strength" v-if="password.length > 0">
    <div class="pw-strength-bar">
      <div
        v-for="i in 4"
        :key="i"
        class="pw-strength-segment"
        :class="{ 'pw-strength-segment--active': i <= strength.level }"
        :style="{ '--seg-color': strength.color }"
      />
    </div>
    <span class="pw-strength-label" :style="{ color: strength.color }">{{ strength.label }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  password: { type: String, default: "" },
});

const strength = computed(() => {
  const pw = props.password;
  if (pw.length < 8) return { level: 1, label: "Weak", color: "#ef4444" };

  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score === 2) return { level: 2, label: "Fair", color: "#f97316" };
  if (score === 3) return { level: 3, label: "Good", color: "#a3e635" };
  return { level: 4, label: "Strong", color: "#22c55e" };
});
</script>

<style scoped>
.pw-strength {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pw-strength-bar {
  display: flex;
  gap: 3px;
  flex: 1;
}

.pw-strength-segment {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.3s ease;
}

.pw-strength-segment--active {
  background: var(--seg-color, #22c55e);
}

.pw-strength-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 3.5rem;
  text-align: right;
}
</style>
