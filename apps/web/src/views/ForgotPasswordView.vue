<!--
  Forgot password page. Sends a reset email request.
  Shows a success message regardless of whether the email exists
  (to prevent account enumeration).
-->
<template>
  <div class="auth-card">
    <div class="auth-card-inner" />
    <div class="auth-card-bottom-line" />

    <div class="auth-card-icon">
      <IconTarget />
    </div>
    <h2 class="auth-card-title">Forgot Password</h2>

    <form v-if="!sent" @submit.prevent="handleSubmit" class="auth-form">
      <p class="auth-info fade-up fade-up-1">Enter your email and we'll send you a reset link.</p>

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

    <div v-else class="auth-success fade-up">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" class="auth-success-icon">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
      </svg>
      <p>If that email is registered, a reset link has been sent.</p>
      <p class="auth-success-hint">Check your inbox (or Mailpit at localhost:8025).</p>
    </div>

    <div class="auth-links fade-up fade-up-4" style="justify-content: center">
      <RouterLink to="/login" class="auth-link">Back to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { IconTarget } from "../components/icons/index.js";

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
