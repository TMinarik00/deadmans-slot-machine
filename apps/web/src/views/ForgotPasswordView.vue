<!--
  Forgot password page. Sends a reset email request.
  Shows a success message regardless of whether the email exists
  (to prevent account enumeration).
-->
<template>
  <div class="auth-card fade-up">
    <h2 class="card-title">Forgot Password</h2>

    <form v-if="!sent" @submit.prevent="handleSubmit" class="auth-form">
      <p class="info-text fade-up fade-up-1">Enter your email and we'll send you a reset link.</p>

      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="cowboy@deadmans.com"
        :required="true"
        class="fade-up fade-up-2"
      />

      <BaseButton block :loading="loading" class="fade-up fade-up-3">
        {{ loading ? "Sending..." : "Send Reset Link" }}
      </BaseButton>
    </form>

    <div v-else class="success-msg fade-up">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40" class="success-icon">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
      </svg>
      <p>If that email is registered, a reset link has been sent.</p>
      <p class="success-hint">Check your inbox (or Mailpit at localhost:8025).</p>
    </div>

    <div class="auth-links fade-up fade-up-4">
      <RouterLink to="/login" class="link">Back to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";

const authStore = useAuthStore();
const email = ref("");
const loading = ref(false);
const sent = ref(false);

async function handleSubmit() {
  loading.value = true;
  await authStore.forgotPassword(email.value);
  sent.value = true;
  loading.value = false;
}
</script>

<style scoped>
.auth-card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(139, 105, 20, 0.2);
}

.card-title {
  font-family: var(--font-display);
  color: var(--color-gold);
  font-size: 1.5rem;
  text-align: center;
  margin: 0 0 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-text {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.success-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1rem 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.success-icon {
  color: var(--color-success);
}

.success-hint {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.auth-links {
  text-align: center;
  margin-top: 1.25rem;
}

.link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}
.link:hover { color: var(--color-gold); }

@media (max-width: 480px) {
  .auth-card { padding: 1.5rem; }
  .card-title { font-size: 1.3rem; margin-bottom: 1rem; }
}
</style>
