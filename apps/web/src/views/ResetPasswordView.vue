<!--
  Reset password page. User lands here from the email link.
  The token is in the URL query string (?token=xxx).
-->
<template>
  <div class="auth-card fade-up">
    <h2 class="card-title">Reset Password</h2>

    <form v-if="!success" @submit.prevent="handleReset" class="auth-form">
      <BaseInput
        v-model="password"
        label="New Password"
        type="password"
        placeholder="Min 8 characters"
        :required="true"
        class="fade-up fade-up-1"
      />

      <BaseInput
        v-model="confirm"
        label="Confirm Password"
        type="password"
        placeholder="Repeat password"
        :required="true"
        class="fade-up fade-up-2"
      />

      <p v-if="error" class="error-msg">{{ error }}</p>

      <BaseButton block :loading="loading" class="fade-up fade-up-3">
        {{ loading ? "Resetting..." : "Reset Password" }}
      </BaseButton>
    </form>

    <div v-else class="success-msg fade-up">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40" class="success-icon">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
      </svg>
      <p>Password reset successfully!</p>
      <RouterLink to="/login" class="link link--gold">Go to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";

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

.error-msg {
  color: var(--color-error);
  font-size: 0.82rem;
  text-align: center;
  margin: 0;
  padding: 0.5rem;
  background: rgba(248, 113, 113, 0.08);
  border-radius: 6px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.success-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1rem 0;
  color: var(--color-text);
  font-size: 0.95rem;
}

.success-icon {
  color: var(--color-success);
}

.link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}
.link:hover { color: var(--color-gold); }
.link--gold { color: var(--color-gold); font-weight: 600; }

@media (max-width: 480px) {
  .auth-card { padding: 1.5rem; }
  .card-title { font-size: 1.3rem; margin-bottom: 1rem; }
}
</style>
