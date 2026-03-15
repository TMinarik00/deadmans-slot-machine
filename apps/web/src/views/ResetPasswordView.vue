<!--
  Reset password page. User lands here from the email link.
  The token is in the URL query string (?token=xxx).
-->
<template>
  <div class="auth-card">
    <h2 class="card-title">Reset Password</h2>

    <form v-if="!success" @submit.prevent="handleReset" class="auth-form">
      <div class="field">
        <label for="password">New Password</label>
        <input id="password" v-model="password" type="password" placeholder="Min 8 characters" required minlength="8" />
      </div>

      <div class="field">
        <label for="confirm">Confirm Password</label>
        <input id="confirm" v-model="confirm" type="password" placeholder="Repeat password" required />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? "Resetting..." : "Reset Password" }}
      </button>
    </form>

    <div v-else class="success-msg">
      <p>Password reset successfully!</p>
      <RouterLink to="/login" class="link">Go to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const password = ref("");
const confirm = ref("");
const loading = ref(false);
const error = ref(null);
const success = ref(false);

async function handleReset() {
  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authStore.resetPassword(route.query.token, password.value);
    success.value = true;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
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

.auth-form { display: flex; flex-direction: column; gap: 1rem; }
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

.error-msg { color: var(--color-error); font-size: 0.85rem; text-align: center; margin: 0; }

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

.success-msg { text-align: center; color: var(--color-success); }
.success-msg .link { color: var(--color-gold); text-decoration: none; display: inline-block; margin-top: 1rem; }
</style>
