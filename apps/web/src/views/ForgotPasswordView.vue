<!--
  Forgot password page. Sends a reset email request.
  Shows a success message regardless of whether the email exists
  (to prevent account enumeration).
-->
<template>
  <div class="auth-card">
    <h2 class="card-title">Forgot Password</h2>

    <form v-if="!sent" @submit.prevent="handleSubmit" class="auth-form">
      <p class="info-text">Enter your email and we'll send you a reset link.</p>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="cowboy@deadmans.com" required />
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? "Sending..." : "Send Reset Link" }}
      </button>
    </form>

    <div v-else class="success-msg">
      <p>If that email is registered, a reset link has been sent. Check your inbox (or Mailpit at localhost:8025).</p>
    </div>

    <div class="auth-links">
      <RouterLink to="/login" class="link">Back to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

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
  border-radius: 12px;
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
}

.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label { font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 1px; }
.field input {
  padding: 0.7rem 0.9rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
}
.field input:focus { border-color: var(--color-gold); }

.btn-primary {
  padding: 0.75rem;
  background: var(--color-gold);
  color: var(--color-bg);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.success-msg {
  color: var(--color-success);
  text-align: center;
  padding: 1rem;
}

.auth-links { text-align: center; margin-top: 1.25rem; }
.link { color: var(--color-text-muted); font-size: 0.85rem; text-decoration: none; }
.link:hover { color: var(--color-gold); }

@media (max-width: 480px) {
  .auth-card { padding: 1.5rem; }
  .card-title { font-size: 1.3rem; margin-bottom: 1rem; }
}
</style>
