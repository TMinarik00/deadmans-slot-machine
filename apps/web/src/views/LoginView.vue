<!--
  Login page. Submits email + password to the auth store.
  On success, redirects to /app (the game).
-->
<template>
  <div class="auth-card">
    <div class="auth-card-inner" />
    <div class="auth-card-bottom-line" />

    <div class="auth-card-icon">
      <IconRevolver style="transform: scaleX(-1) rotate(-20deg)" />
      <IconRevolver style="transform: rotate(20deg)" />
    </div>
    <h2 class="auth-card-title">Welcome Back</h2>

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

      <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>

      <BaseButton block :loading="authStore.loading" class="fade-up fade-up-3">
        {{ authStore.loading ? "Signing in..." : "Sign In" }}
      </BaseButton>
    </form>

    <div class="auth-links fade-up fade-up-4" style="justify-content: center">
      <RouterLink to="/register" class="auth-link">Create account</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { IconRevolver } from "../components/icons/index.js";

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
