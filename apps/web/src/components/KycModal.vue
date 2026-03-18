<!--
  KYC Verification wizard modal. 3 steps, all super easy:
  1. Confirm personal info (pre-filled, just click "Looks good")
  2. Document upload (fake upload, click to "upload")
  3. Selfie (fake camera, click to "capture")
  Then auto-approves after ~3s.
-->
<template>
  <BaseModal @close="$emit('close')" size="md">
    <template #header>
      <div class="kyc-header">
        <svg class="kyc-shield" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        Identity Verification
      </div>
    </template>

    <!-- Demo banner -->
    <div class="kyc-demo-banner">
      <svg viewBox="0 0 20 20" fill="currentColor" class="kyc-demo-icon"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
      <span>Simulated KYC for demonstration purposes</span>
    </div>

    <!-- Steps indicator -->
    <div class="kyc-steps">
      <div v-for="i in 3" :key="i" class="kyc-step" :class="{ 'kyc-step--active': step === i, 'kyc-step--done': step > i }">
        <div class="kyc-step-dot">
          <svg v-if="step > i" viewBox="0 0 16 16" fill="currentColor" class="kyc-step-check"><path d="M5.5 11.5L2.5 8.5l1-1 2 2 5-5 1 1z"/></svg>
          <span v-else>{{ i }}</span>
        </div>
        <span class="kyc-step-label">{{ stepLabels[i - 1] }}</span>
      </div>
    </div>

    <!-- Step 1: Personal Info Confirmation -->
    <div v-if="step === 1" class="kyc-body">
      <p class="kyc-desc">Please confirm your personal information is correct.</p>
      <div class="kyc-info-grid">
        <div class="kyc-info-item">
          <span class="kyc-info-label">Full Name</span>
          <span class="kyc-info-value">{{ fullName || 'Not provided' }}</span>
        </div>
        <div class="kyc-info-item">
          <span class="kyc-info-label">Date of Birth</span>
          <span class="kyc-info-value">{{ dob || 'Not provided' }}</span>
        </div>
        <div class="kyc-info-item">
          <span class="kyc-info-label">Country</span>
          <span class="kyc-info-value">{{ country || 'Not provided' }}</span>
        </div>
        <div class="kyc-info-item">
          <span class="kyc-info-label">Email</span>
          <span class="kyc-info-value">{{ profileStore.profile?.email }}</span>
        </div>
      </div>
      <button class="kyc-next-btn" @click="step = 2">
        ✓ Information is Correct
      </button>
    </div>

    <!-- Step 2: Document Upload (fake) -->
    <div v-if="step === 2" class="kyc-body">
      <p class="kyc-desc">Upload a photo of your government-issued ID.</p>
      <div class="kyc-upload-zone" :class="{ 'kyc-upload-zone--done': docUploaded }" @click="simulateUpload">
        <template v-if="!docUploaded">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" class="kyc-upload-icon">
            <rect x="6" y="10" width="36" height="28" rx="4"/>
            <circle cx="18" cy="24" r="5"/>
            <path d="M6 34l10-8 8 6 8-10 10 12"/>
          </svg>
          <span class="kyc-upload-text">Click to upload document</span>
          <span class="kyc-upload-hint">Any file accepted (demo mode)</span>
        </template>
        <template v-else>
          <svg viewBox="0 0 48 48" fill="currentColor" class="kyc-upload-success"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30l-10-10 2.83-2.83L20 28.34l15.17-15.17L38 16 20 34z"/></svg>
          <span class="kyc-upload-text" style="color: var(--color-gold)">Document uploaded ✓</span>
        </template>
      </div>
      <button class="kyc-next-btn" :disabled="!docUploaded" @click="step = 3">
        Continue
      </button>
    </div>

    <!-- Step 3: Selfie (fake) -->
    <div v-if="step === 3" class="kyc-body">
      <p class="kyc-desc">Take a selfie to verify your identity.</p>
      <div class="kyc-camera" :class="{ 'kyc-camera--captured': selfieTaken }" @click="simulateSelfie">
        <template v-if="!selfieTaken">
          <div class="kyc-camera-frame">
            <div class="kyc-camera-oval"></div>
            <span class="kyc-camera-text">Click to capture</span>
          </div>
        </template>
        <template v-else>
          <svg viewBox="0 0 48 48" fill="currentColor" class="kyc-upload-success"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30l-10-10 2.83-2.83L20 28.34l15.17-15.17L38 16 20 34z"/></svg>
          <span class="kyc-upload-text" style="color: var(--color-gold)">Photo captured ✓</span>
        </template>
      </div>
      <button class="kyc-next-btn" :disabled="!selfieTaken || submitting" @click="submitKyc">
        {{ submitting ? 'Submitting...' : 'Submit Verification' }}
      </button>
    </div>

    <!-- Step 4: Result -->
    <div v-if="step === 4" class="kyc-body kyc-result">
      <div class="kyc-result-icon" :class="{ 'kyc-result-icon--verified': verified }">
        <svg v-if="!verified" class="kyc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="50" stroke-linecap="round"/></svg>
        <svg v-else viewBox="0 0 48 48" fill="currentColor"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30l-10-10 2.83-2.83L20 28.34l15.17-15.17L38 16 20 34z"/></svg>
      </div>
      <h3 class="kyc-result-title">{{ verified ? 'Verification Complete!' : 'Verifying...' }}</h3>
      <p class="kyc-result-desc">{{ verified ? 'Your identity has been verified. You now have full access to all features.' : 'Please wait while we verify your documents...' }}</p>
      <button v-if="verified" class="kyc-next-btn" @click="$emit('close')">Done</button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProfileStore } from "../stores/profile.js";
import BaseModal from "./ui/BaseModal.vue";

const emit = defineEmits(["close"]);
const profileStore = useProfileStore();

const step = ref(1);
const docUploaded = ref(false);
const selfieTaken = ref(false);
const submitting = ref(false);
const verified = ref(false);

const stepLabels = ["Personal Info", "Document", "Selfie"];

const fullName = computed(() => {
  const p = profileStore.profile;
  return [p?.firstName, p?.lastName].filter(Boolean).join(" ");
});

const dob = computed(() => {
  const d = profileStore.profile?.dateOfBirth;
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
});

const country = computed(() => profileStore.profile?.country || null);

function simulateUpload() {
  docUploaded.value = true;
}

function simulateSelfie() {
  selfieTaken.value = true;
}

async function submitKyc() {
  submitting.value = true;
  step.value = 4;
  try {
    await profileStore.submitKyc();
    // Poll for verification (auto-approves in ~3s)
    const poll = setInterval(async () => {
      await profileStore.fetchProfile();
      if (profileStore.kycStatus === "VERIFIED") {
        verified.value = true;
        clearInterval(poll);
      }
    }, 1000);
  } catch {
    // error shown by store
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.kyc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kyc-shield {
  width: 20px;
  height: 20px;
  color: var(--color-gold);
}

/* Demo banner */
.kyc-demo-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(212, 160, 32, 0.08);
  border: 1px solid rgba(212, 160, 32, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: var(--color-gold);
}

.kyc-demo-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Steps */
.kyc-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.15);
}

.kyc-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.kyc-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(139, 105, 20, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all 0.3s;
}

.kyc-step--active .kyc-step-dot {
  border-color: var(--color-gold);
  background: rgba(212, 160, 32, 0.15);
  color: var(--color-gold);
  box-shadow: 0 0 10px rgba(212, 160, 32, 0.2);
}

.kyc-step--done .kyc-step-dot {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.kyc-step-check {
  width: 14px;
  height: 14px;
}

.kyc-step-label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.kyc-step--active .kyc-step-label {
  color: var(--color-gold);
}

/* Body */
.kyc-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kyc-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Info grid */
.kyc-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.kyc-info-item {
  padding: 0.6rem 0.75rem;
  background: rgba(16, 10, 6, 0.6);
  border: 1px solid rgba(139, 105, 20, 0.12);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.kyc-info-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.kyc-info-value {
  font-size: 0.85rem;
  color: var(--color-text);
}

/* Upload zone */
.kyc-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed rgba(139, 105, 20, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(16, 10, 6, 0.4);
}

.kyc-upload-zone:hover {
  border-color: var(--color-gold);
  background: rgba(212, 160, 32, 0.05);
}

.kyc-upload-zone--done {
  border-color: rgba(34, 197, 94, 0.4);
  border-style: solid;
  background: rgba(34, 197, 94, 0.05);
}

.kyc-upload-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
}

.kyc-upload-success {
  width: 48px;
  height: 48px;
  color: #22c55e;
}

.kyc-upload-text {
  font-size: 0.85rem;
  color: var(--color-text);
}

.kyc-upload-hint {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Camera */
.kyc-camera {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px solid rgba(139, 105, 20, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(16, 10, 6, 0.6);
}

.kyc-camera:hover {
  border-color: var(--color-gold);
}

.kyc-camera--captured {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.05);
}

.kyc-camera-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.kyc-camera-oval {
  width: 80px;
  height: 100px;
  border: 2px dashed var(--color-text-muted);
  border-radius: 50%;
  opacity: 0.5;
}

.kyc-camera-text {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

/* Next button */
.kyc-next-btn {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #d4a020, #b8860b);
  border: 1px solid var(--color-gold);
  color: #1a0f0a;
  transition: all 0.2s;
}

.kyc-next-btn:hover:not(:disabled) {
  box-shadow: 0 2px 12px rgba(212, 160, 32, 0.3);
  transform: translateY(-1px);
}

.kyc-next-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Result */
.kyc-result {
  align-items: center;
  text-align: center;
  padding: 1rem 0;
}

.kyc-result-icon {
  width: 64px;
  height: 64px;
  color: var(--color-gold);
}

.kyc-result-icon--verified {
  color: #22c55e;
}

.kyc-result-title {
  font-family: var(--font-display);
  color: var(--color-gold);
  margin: 0;
}

.kyc-result-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Spinner */
.kyc-spinner {
  width: 100%;
  height: 100%;
  animation: kycSpin 1s linear infinite;
}

@keyframes kycSpin {
  to { transform: rotate(360deg); }
}
</style>
