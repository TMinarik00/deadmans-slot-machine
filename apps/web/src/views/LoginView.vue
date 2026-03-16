<!--
  Login page. Submits email + password to the auth store.
  On success, redirects to /app (the game).
-->
<template>
  <div class="auth-card fade-up">
    <h2 class="card-title">Welcome Back</h2>

    <form @submit.prevent="handleLogin" class="auth-form">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="cowboy@deadmans.com"
        :required="true"
        class="fade-up fade-up-1"
      />

      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        placeholder="Your password"
        :required="true"
        class="fade-up fade-up-2"
      />

      <p v-if="authStore.error" class="error-msg">{{ authStore.error }}</p>

      <BaseButton block :loading="authStore.loading" class="fade-up fade-up-3">
        {{ authStore.loading ? "Signing in..." : "Sign In" }}
      </BaseButton>
    </form>

    <div class="auth-links fade-up fade-up-4">
      <RouterLink to="/forgot-password" class="link">Forgot password?</RouterLink>
      <RouterLink to="/register" class="link">Create account</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value);
    router.push("/app");
  } catch {
    // Error is already in authStore.error
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

.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
}

.link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}
.link:hover {
  color: var(--color-gold);
}

@media (max-width: 480px) {
  .auth-card { padding: 1.5rem; }
  .card-title { font-size: 1.3rem; margin-bottom: 1rem; }
  .auth-links { flex-direction: column; align-items: center; gap: 0.5rem; }
}
</style>
