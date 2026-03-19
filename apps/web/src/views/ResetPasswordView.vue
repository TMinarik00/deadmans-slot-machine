<!--
  Reset password page. User lands here from the email link.
  The token is in the URL query string (?token=xxx).
-->
<template>
  <div class="auth-card">
    <div class="auth-card-inner" />
    <div class="auth-card-bottom-line" />

    <div class="auth-card-icon">
      <IconHorseshoe />
    </div>
    <h2 class="auth-card-title">Reset Password</h2>

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

      <p v-if="error" class="auth-error">{{ error }}</p>

      <BaseButton block :loading="loading" class="fade-up fade-up-3">
        {{ loading ? "Resetting..." : "Reset Password" }}
      </BaseButton>
    </form>

    <div v-else class="auth-success fade-up">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" class="auth-success-icon">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
      </svg>
      <p>Password reset successfully!</p>
      <RouterLink to="/login" class="auth-link auth-link--gold">Go to login</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { IconHorseshoe } from "../components/icons/index.js";

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
