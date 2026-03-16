<!--
  Register page. Creates a new account and auto-logs in on success.
-->
<template>
  <div class="auth-card">
    <div class="auth-card-inner" />
    <div class="auth-card-bottom-line" />

    <div class="auth-card-icon">
      <IconStar />
    </div>
    <h2 class="auth-card-title">Join the Game</h2>

    <form @submit.prevent="handleRegister" class="auth-form">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="cowboy@deadmans.com"
        :required="true"
        class="fade-up fade-up-1"
      />

      <BaseInput
        v-model="username"
        label="Username"
        type="text"
        placeholder="wild_bill"
        :required="true"
        :maxlength="20"
        class="fade-up fade-up-2"
      />

      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        placeholder="Min 8 characters"
        :required="true"
        class="fade-up fade-up-3"
      />

      <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>

      <BaseButton block :loading="authStore.loading" class="fade-up fade-up-4">
        {{ authStore.loading ? "Creating account..." : "Create Account" }}
      </BaseButton>
    </form>

    <div class="auth-links fade-up fade-up-5" style="justify-content: center">
      <RouterLink to="/login" class="auth-link">Already have an account? Sign in</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { IconStar } from "../components/icons/index.js";

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
