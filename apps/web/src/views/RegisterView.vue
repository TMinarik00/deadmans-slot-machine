<!--
  Register page. Creates a new account and auto-logs in on success.
-->
<template>
  <div class="auth-card">
    <h2 class="card-title">Join the Game</h2>

    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="cowboy@deadmans.com" required />
      </div>

      <div class="field">
        <label for="username">Username</label>
        <input id="username" v-model="username" type="text" placeholder="wild_bill" required minlength="3" maxlength="20" />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" placeholder="Min 8 characters" required minlength="8" />
      </div>

      <p v-if="authStore.error" class="error-msg">{{ authStore.error }}</p>

      <button type="submit" class="btn-primary" :disabled="authStore.loading">
        {{ authStore.loading ? "Creating account..." : "Create Account" }}
      </button>
    </form>

    <div class="auth-links">
      <RouterLink to="/login" class="link">Already have an account? Sign in</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const username = ref("");
const password = ref("");

async function handleRegister() {
  try {
    await authStore.register(email.value, username.value, password.value);
    router.push("/app");
  } catch {
    // Error is in authStore.error
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.field input {
  padding: 0.7rem 0.9rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.field input:focus {
  border-color: var(--color-gold);
}

.error-msg {
  color: var(--color-error);
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

.btn-primary {
  padding: 0.75rem;
  background: var(--color-gold);
  color: var(--color-bg);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 0.5rem;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-links {
  text-align: center;
  margin-top: 1.25rem;
}

.link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
}
.link:hover { color: var(--color-gold); }

@media (max-width: 480px) {
  .auth-card { padding: 1.5rem; }
  .card-title { font-size: 1.3rem; margin-bottom: 1rem; }
}
</style>
