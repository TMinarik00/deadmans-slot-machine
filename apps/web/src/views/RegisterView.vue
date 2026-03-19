<!--
  Register page. Creates a new account and auto-logs in on success.
  Fields: First/Last Name (P2), Email, Phone (P2), Username,
  Country (P1), Date of Birth (P0), Password + Strength (P0/P1),
  Confirm Password (P0), T&C Checkbox (P0).
-->
<template>
  <div class="auth-card auth-card--register">
    <div class="auth-card-inner" />
    <div class="auth-card-bottom-line" />

    <div class="auth-card-icon">
      <IconStar />
    </div>
    <h2 class="auth-card-title">Join the Game</h2>

    <form @submit.prevent="handleRegister" class="auth-form">
      <!-- P2: First & Last Name (side by side) -->
      <div class="form-row fade-up fade-up-1">
        <BaseInput
          v-model="firstName"
          label="First Name"
          type="text"
          placeholder="John"
          :maxlength="50"
        />
        <BaseInput
          v-model="lastName"
          label="Last Name"
          type="text"
          placeholder="Doe"
          :maxlength="50"
        />
      </div>

      <!-- Email -->
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="cowboy@deadmans.com"
        :required="true"
        class="fade-up fade-up-2"
      />

      <!-- P2: Phone -->
      <BaseInput
        v-model="phone"
        label="Phone"
        type="tel"
        placeholder="+387 61 234 567"
        :maxlength="20"
        class="fade-up fade-up-3"
      />

      <!-- Username -->
      <BaseInput
        v-model="username"
        label="Username"
        type="text"
        placeholder="wild_bill"
        :required="true"
        :maxlength="20"
        class="fade-up fade-up-4"
      />

      <!-- P1: Country -->
      <BaseSelect
        v-model="country"
        label="Country"
        placeholder="Select your country"
        :options="countryOptions"
        class="fade-up fade-up-5"
      />

      <!-- P0: Date of Birth -->
      <div class="fade-up fade-up-6">
        <label class="dob-label">Date of Birth</label>
        <div class="dob-row">
          <BaseSelect
            v-model="dobDay"
            placeholder="Day"
            :options="dayOptions"
          />
          <BaseSelect
            v-model="dobMonth"
            placeholder="Month"
            :options="monthOptions"
          />
          <BaseSelect
            v-model="dobYear"
            placeholder="Year"
            :options="yearOptions"
          />
        </div>
        <span class="dob-hint">You must be at least 18 years old</span>
      </div>

      <!-- Password + P1: Strength indicator -->
      <div class="fade-up fade-up-7">
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          :required="true"
        />
        <PasswordStrength :password="password" />
      </div>

      <!-- P0: Confirm Password -->
      <BaseInput
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        :required="true"
        :error="confirmPasswordError"
        class="fade-up fade-up-8"
      />

      <!-- P0: Terms & Conditions -->
      <BaseCheckbox
        v-model="acceptTerms"
        :error="termsError"
        class="fade-up fade-up-9"
      >
        I accept the <a href="#" @click.prevent>Terms &amp; Conditions</a> and
        <a href="#" @click.prevent>Privacy Policy</a>
      </BaseCheckbox>

      <p v-if="authStore.error" class="auth-error">{{ authStore.error }}</p>

      <BaseButton block :loading="authStore.loading" class="fade-up fade-up-10">
        {{ authStore.loading ? "Creating account..." : "Create Account" }}
      </BaseButton>
    </form>

    <div class="auth-links fade-up fade-up-11" style="justify-content: center">
      <RouterLink to="/login" class="auth-link">Already have an account? Sign in</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import BaseSelect from "../components/ui/BaseSelect.vue";
import BaseCheckbox from "../components/ui/BaseCheckbox.vue";
import PasswordStrength from "../components/ui/PasswordStrength.vue";
import { IconStar } from "../components/icons/index.js";

const authStore = useAuthStore();
const router = useRouter();

// Form state
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phone = ref("");
const username = ref("");
const country = ref("");
const dobDay = ref("");
const dobMonth = ref("");
const dobYear = ref("");
const password = ref("");
const confirmPassword = ref("");
const acceptTerms = ref(false);

// Assemble YYYY-MM-DD from separate selects
const dateOfBirth = computed(() => {
  if (dobYear.value && dobMonth.value && dobDay.value) {
    return `${dobYear.value}-${dobMonth.value.padStart(2, '0')}-${dobDay.value.padStart(2, '0')}`;
  }
  return "";
});

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const monthOptions = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 100 }, (_, i) => ({
  value: String(currentYear - 18 - i),
  label: String(currentYear - 18 - i),
}));

// Client-side validation
const confirmPasswordError = computed(() => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    return "Passwords do not match";
  }
  return "";
});

const termsError = ref("");

const countryOptions = [
  { value: "BA", label: "🇧🇦 Bosnia & Herzegovina" },
  { value: "HR", label: "🇭🇷 Croatia" },
  { value: "RS", label: "🇷🇸 Serbia" },
  { value: "ME", label: "🇲🇪 Montenegro" },
  { value: "SI", label: "🇸🇮 Slovenia" },
  { value: "MK", label: "🇲🇰 North Macedonia" },
  { value: "AL", label: "🇦🇱 Albania" },
  { value: "XK", label: "🇽🇰 Kosovo" },
  { value: "AT", label: "🇦🇹 Austria" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "CH", label: "🇨🇭 Switzerland" },
  { value: "IT", label: "🇮🇹 Italy" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "ES", label: "🇪🇸 Spain" },
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "IE", label: "🇮🇪 Ireland" },
  { value: "NL", label: "🇳🇱 Netherlands" },
  { value: "BE", label: "🇧🇪 Belgium" },
  { value: "SE", label: "🇸🇪 Sweden" },
  { value: "NO", label: "🇳🇴 Norway" },
  { value: "DK", label: "🇩🇰 Denmark" },
  { value: "FI", label: "🇫🇮 Finland" },
  { value: "PL", label: "🇵🇱 Poland" },
  { value: "CZ", label: "🇨🇿 Czech Republic" },
  { value: "SK", label: "🇸🇰 Slovakia" },
  { value: "HU", label: "🇭🇺 Hungary" },
  { value: "RO", label: "🇷🇴 Romania" },
  { value: "BG", label: "🇧🇬 Bulgaria" },
  { value: "GR", label: "🇬🇷 Greece" },
  { value: "TR", label: "🇹🇷 Turkey" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "NZ", label: "🇳🇿 New Zealand" },
  { value: "BR", label: "🇧🇷 Brazil" },
  { value: "MX", label: "🇲🇽 Mexico" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "KR", label: "🇰🇷 South Korea" },
  { value: "IN", label: "🇮🇳 India" },
];

async function handleRegister() {
  // Client-side checks before sending
  termsError.value = "";

  if (!acceptTerms.value) {
    termsError.value = "You must accept the Terms & Conditions";
    return;
  }

  if (password.value !== confirmPassword.value) {
    return; // confirmPasswordError computed will show the message
  }

  try {
    await authStore.register({
      email: email.value,
      username: username.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      dateOfBirth: dateOfBirth.value,
      acceptTerms: acceptTerms.value,
      country: country.value || undefined,
      firstName: firstName.value || undefined,
      lastName: lastName.value || undefined,
      phone: phone.value || undefined,
    });
    router.push("/app");
  } catch {
    // Error is in authStore.error
  }
}
</script>

<style scoped>
.auth-card--register {
  max-width: 440px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  min-width: 0;
}

/* Stack name fields on very small screens */
@media (max-width: 360px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Date of Birth row */
.dob-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  display: block;
  margin-bottom: 0.35rem;
}

.dob-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.1fr;
  gap: 0.5rem;
}

.dob-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  display: block;
  margin-top: 0.35rem;
}
</style>
