<!--
  Profile page - Wild West wanted poster design.
  Level, XP progress, stats, daily bonus, edit profile, delete account.
-->
<template>
  <div class="profile-page">
    <!-- Wanted poster hero -->
    <div class="wanted-poster fade-up">
      <!-- Decorative corner nails -->
      <div class="poster-nail poster-nail--tl"></div>
      <div class="poster-nail poster-nail--tr"></div>
      <div class="poster-nail poster-nail--bl"></div>
      <div class="poster-nail poster-nail--br"></div>

      <div class="poster-header">
        <div class="poster-line"></div>
        <h1 class="poster-title">WANTED</h1>
        <p class="poster-subtitle">Dead or Alive</p>
        <div class="poster-line"></div>
      </div>

      <div class="poster-body">
        <div class="avatar-frame">
          <div class="level-ring glow-pulse">
            <span class="level-num">{{ profileStore.level }}</span>
          </div>
          <span class="avatar-label">LEVEL</span>
        </div>

        <div class="poster-info">
          <h2 class="outlaw-name">
            {{ displayName || authStore.user?.username }}
          </h2>
          <p class="outlaw-email">{{ profileStore.profile?.email }}</p>
          <p class="outlaw-since">Outlaw since {{ joinDate }}</p>
        </div>
      </div>

      <div class="xp-section">
        <div class="xp-label-row">
          <span class="xp-label">Reputation</span>
          <span class="xp-value">{{ profileStore.xpProgress }} / {{ profileStore.xpNeeded }} XP</span>
        </div>
        <BaseProgressBar
          :value="profileStore.xpProgress"
          :max="profileStore.xpNeeded"
        />
      </div>

      <div class="reward-line">
        <span class="reward-text">REWARD</span>
        <span class="reward-amount">{{ formatNum(profileStore.stats.totalWon) }} CHIPS</span>
      </div>
    </div>

    <!-- Personal Info Section -->
    <div class="info-section fade-up fade-up-1" v-if="hasPersonalInfo">
      <h3 class="section-title">
        <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
        Personal Info
      </h3>
      <div class="info-grid">
        <div class="info-item" v-if="profileStore.profile?.firstName || profileStore.profile?.lastName">
          <span class="info-label">Full Name</span>
          <span class="info-value">{{ [profileStore.profile?.firstName, profileStore.profile?.lastName].filter(Boolean).join(' ') || '—' }}</span>
        </div>
        <div class="info-item" v-if="profileStore.profile?.phone">
          <span class="info-label">Phone</span>
          <span class="info-value">{{ profileStore.profile?.phone }}</span>
        </div>
        <div class="info-item" v-if="profileStore.profile?.country">
          <span class="info-label">Country</span>
          <span class="info-value">{{ countryLabel(profileStore.profile?.country) }}</span>
        </div>
        <div class="info-item" v-if="profileStore.profile?.dateOfBirth">
          <span class="info-label">Date of Birth</span>
          <span class="info-value">{{ formatDate(profileStore.profile?.dateOfBirth) }}</span>
        </div>
      </div>
    </div>

    <!-- Daily bonus card -->
    <div class="daily-card fade-up fade-up-1">
      <div class="daily-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2v4m0 12v4m-8-10H0m24 0h-4m-2.93-6.07l2.83-2.83M6.1 17.9l-2.83 2.83M17.9 17.9l2.83 2.83M6.1 6.1L3.27 3.27"/>
          <circle cx="12" cy="12" r="5"/>
        </svg>
      </div>
      <div class="daily-info">
        <span class="daily-title">Daily Bounty</span>
        <span class="daily-desc">{{ profileStore.canClaimDaily ? 'Your reward awaits, partner!' : `Next bounty in ${countdown}` }}</span>
      </div>
      <button
        class="daily-btn"
        :class="{ available: profileStore.canClaimDaily }"
        :disabled="!profileStore.canClaimDaily || claiming"
        @click="claimDaily"
      >
        <template v-if="claiming">...</template>
        <template v-else-if="profileStore.canClaimDaily">Claim</template>
        <template v-else>{{ countdown }}</template>
      </button>
    </div>

    <!-- Reward toast -->
    <div v-if="rewardMsg" class="reward-toast">{{ rewardMsg }}</div>

    <!-- Stats grid -->
    <h3 class="section-title fade-up fade-up-2">
      <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
      Criminal Record
    </h3>
    <div class="stats-grid fade-up fade-up-2">
      <div v-for="stat in statCards" :key="stat.label" class="stat-card">
        <span class="stat-icon">{{ stat.icon }}</span>
        <span class="stat-value" :class="{ 'stat-value--sm': stat.small }">{{ stat.value }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <!-- Actions -->
    <h3 class="section-title fade-up fade-up-3">
      <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
      Settings
    </h3>
    <div class="actions-section fade-up fade-up-3">
      <button class="action-btn action-btn--edit" @click="showEditModal = true">
        <svg class="action-btn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
        Edit Profile
      </button>
      <button class="action-btn action-btn--logout" @click="handleLogout">
        <svg class="action-btn-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 100-2H4V5h4a1 1 0 100-2H3zm11.707 3.293a1 1 0 010 1.414L12.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M17 10a1 1 0 00-1-1H9a1 1 0 100 2h7a1 1 0 001-1z" clip-rule="evenodd"/></svg>
        Logout
      </button>
    </div>

    <!-- KYC Verification -->
    <div class="kyc-section fade-up fade-up-3">
      <div class="kyc-status-row">
        <div class="kyc-status-info">
          <svg class="kyc-status-shield" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          <div>
            <span class="kyc-status-title">Identity Verification</span>
            <span class="kyc-status-badge" :class="`kyc-badge--${profileStore.kycStatus.toLowerCase()}`">
              {{ kycBadgeText }}
            </span>
          </div>
        </div>
        <button
          v-if="profileStore.kycStatus !== 'VERIFIED'"
          class="action-btn action-btn--edit"
          style="flex: none; padding: 0.5rem 1rem;"
          @click="showKycModal = true"
        >
          {{ profileStore.kycStatus === 'NONE' ? 'Verify Now' : 'Check Status' }}
        </button>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="danger-zone fade-up fade-up-4">
      <div class="danger-header">
        <svg class="danger-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <span>Danger Zone</span>
      </div>
      <p class="danger-desc">Permanently delete your account and all data. This cannot be undone.</p>
      <button class="action-btn action-btn--delete" @click="showDeleteModal = true">
        <svg class="action-btn-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        Delete Account
      </button>
    </div>

    <!-- Error -->
    <p v-if="profileStore.error" class="error-msg">{{ profileStore.error }}</p>

    <!-- Edit Profile Modal -->
    <BaseModal v-if="showEditModal" @close="closeEditModal" size="md">
      <template #header>Edit Profile</template>
      <form @submit.prevent="submitEdit" class="edit-form">

        <!-- Personal Info Section -->
        <div class="edit-section">
          <h4 class="edit-section-title">
            <svg class="edit-section-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
            Personal Info
          </h4>
          <div class="edit-row">
            <BaseInput
              v-model="editForm.firstName"
              label="First Name"
              type="text"
              placeholder="John"
              :maxlength="50"
            />
            <BaseInput
              v-model="editForm.lastName"
              label="Last Name"
              type="text"
              placeholder="Doe"
              :maxlength="50"
            />
          </div>
          <BaseInput
            v-model="editForm.phone"
            label="Phone"
            type="tel"
            placeholder="+387 61 234 567"
            :maxlength="20"
          />
          <BaseSelect
            v-model="editForm.country"
            label="Country"
            placeholder="Select your country"
            :options="countryOptions"
          />
        </div>

        <div class="modal-divider"></div>

        <!-- Account Section -->
        <div class="edit-section">
          <h4 class="edit-section-title">
            <svg class="edit-section-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/></svg>
            Account
          </h4>
          <BaseInput
            v-model="editForm.username"
            label="Username"
            :placeholder="authStore.user?.username"
          />
        </div>

        <div class="modal-divider"></div>

        <!-- Security Section -->
        <div class="edit-section">
          <h4 class="edit-section-title">
            <svg class="edit-section-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            Security
          </h4>
          <div>
            <BaseInput
              v-model="editForm.newPassword"
              label="New Password"
              type="password"
              placeholder="Leave blank to keep current"
            />
            <PasswordStrength :password="editForm.newPassword" />
          </div>
        </div>

        <div class="modal-divider"></div>

        <!-- Confirm -->
        <BaseInput
          v-model="editForm.currentPassword"
          label="Current Password"
          type="password"
          placeholder="Required to confirm changes"
          :error="editError"
        />
        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn--cancel" @click="closeEditModal">Cancel</button>
          <button type="submit" class="modal-btn modal-btn--save" :disabled="editLoading">
            {{ editLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Account Modal -->
    <BaseModal v-if="showDeleteModal" size="sm" @close="closeDeleteModal">
      <template #header>Delete Account</template>
      <div class="delete-modal-body">
        <div class="delete-warning">
          <svg class="delete-warning-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          <p>This will permanently delete your account, stats, wallets, achievements, and all data. This action <strong>cannot be undone</strong>.</p>
        </div>
        <form @submit.prevent="submitDelete">
          <BaseInput
            v-model="deletePassword"
            label="Enter your password to confirm"
            type="password"
            placeholder="Your password"
            :error="deleteError"
          />
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn--cancel" @click="closeDeleteModal">Cancel</button>
            <button type="submit" class="modal-btn modal-btn--danger" :disabled="deleteLoading">
              {{ deleteLoading ? 'Deleting...' : 'Delete Forever' }}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>

    <!-- KYC Modal -->
    <KycModal v-if="showKycModal" @close="showKycModal = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useProfileStore } from "../stores/profile.js";
import { useWalletStore } from "../stores/wallet.js";
import BaseProgressBar from "../components/ui/BaseProgressBar.vue";
import BaseModal from "../components/ui/BaseModal.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import BaseSelect from "../components/ui/BaseSelect.vue";
import PasswordStrength from "../components/ui/PasswordStrength.vue";
import KycModal from "../components/KycModal.vue";

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const walletStore = useWalletStore();

// Daily bonus
const claiming = ref(false);
const rewardMsg = ref("");
const countdown = ref("--:--:--");
let countdownTimer = null;

// Edit modal
const showEditModal = ref(false);
const editLoading = ref(false);
const editError = ref("");
const editForm = reactive({
  username: "",
  newPassword: "",
  currentPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
});

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

const displayName = computed(() => {
  const p = profileStore.profile;
  const parts = [p?.firstName, p?.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "";
});

const hasPersonalInfo = computed(() => {
  const p = profileStore.profile;
  return p?.firstName || p?.lastName || p?.phone || p?.country || p?.dateOfBirth;
});

function countryLabel(code) {
  if (!code) return "—";
  const found = countryOptions.find(o => o.value === code);
  return found ? found.label : code;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Delete modal
const showDeleteModal = ref(false);
const deleteLoading = ref(false);
const deleteError = ref("");
const deletePassword = ref("");
const showKycModal = ref(false);

const kycBadgeText = computed(() => {
  const s = profileStore.kycStatus;
  if (s === "VERIFIED") return "✓ Verified";
  if (s === "PENDING") return "⏳ Pending";
  if (s === "REJECTED") return "✗ Rejected";
  return "Not Verified";
});

const joinDate = computed(() => {
  const d = profileStore.profile?.createdAt;
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
});

const statCards = computed(() => [
  { icon: "🎰", value: formatNum(profileStore.stats.totalSpins), label: "Total Spins" },
  { icon: "🏆", value: formatNum(profileStore.stats.totalWins), label: "Total Wins" },
  { icon: "💰", value: formatNum(profileStore.stats.totalWagered), label: "Wagered" },
  { icon: "💵", value: formatNum(profileStore.stats.totalWon), label: "Total Won" },
  { icon: "⭐", value: formatNum(profileStore.stats.biggestWin), label: "Biggest Win" },
  { icon: "🎯", value: profileStore.stats.favoriteGameId || "—", label: "Favorite Game", small: true },
]);

function formatNum(val) {
  if (val == null) return "0";
  return Number(val).toLocaleString("en-US");
}

function showReward(msg) {
  rewardMsg.value = msg;
  setTimeout(() => { rewardMsg.value = ""; }, 4000);
}

async function claimDaily() {
  claiming.value = true;
  try {
    const data = await profileStore.claimDailyBonus();
    walletStore.fetchWallets();
    let msg = `+${data.chipsAwarded} CHIPS, +${data.xpAwarded} XP`;
    if (data.levelUpRewards > 0) {
      msg += ` | Level up! +${data.levelUpRewards} bonus CHIPS`;
    }
    showReward(msg);
    startCountdown();
  } catch {
    // error shown by store
  } finally {
    claiming.value = false;
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push("/login");
}

// Edit profile
// Pre-populate the form when modal opens
watch(showEditModal, (open) => {
  if (open) {
    const p = profileStore.profile;
    editForm.username = authStore.user?.username || "";
    editForm.firstName = p?.firstName || "";
    editForm.lastName = p?.lastName || "";
    editForm.phone = p?.phone || "";
    editForm.country = p?.country || "";
    editForm.newPassword = "";
    editForm.currentPassword = "";
  }
});

function closeEditModal() {
  showEditModal.value = false;
  editError.value = "";
}

async function submitEdit() {
  editError.value = "";
  if (!editForm.currentPassword) {
    editError.value = "Current password is required";
    return;
  }
  if (!editForm.username && !editForm.newPassword) {
    editError.value = "Change at least one field";
    return;
  }

  editLoading.value = true;
  try {
    const payload = { currentPassword: editForm.currentPassword };
    if (editForm.username && editForm.username !== authStore.user?.username) payload.username = editForm.username;
    if (editForm.newPassword) payload.newPassword = editForm.newPassword;
    // Include personal info fields (send even if empty to allow clearing)
    payload.firstName = editForm.firstName || null;
    payload.lastName = editForm.lastName || null;
    payload.phone = editForm.phone || null;
    payload.country = editForm.country || null;
    await profileStore.editProfile(payload);
    // Refresh auth user data
    await authStore.fetchMe();
    closeEditModal();
    showReward("Profile updated successfully!");
  } catch (e) {
    editError.value = e.message;
  } finally {
    editLoading.value = false;
  }
}

// Delete profile
function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteError.value = "";
  deletePassword.value = "";
}

async function submitDelete() {
  deleteError.value = "";
  if (!deletePassword.value) {
    deleteError.value = "Password is required";
    return;
  }

  deleteLoading.value = true;
  try {
    await profileStore.deleteProfile(deletePassword.value);
    await authStore.logout();
    closeDeleteModal();
    router.push("/login");
  } catch (e) {
    deleteError.value = e.message;
  } finally {
    deleteLoading.value = false;
  }
}

// Countdown
function startCountdown() {
  clearInterval(countdownTimer);
  countdownTimer = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function updateCountdown() {
  const next = profileStore.dailyBonus?.nextAvailableAt;
  if (!next || profileStore.canClaimDaily) {
    countdown.value = "00:00:00";
    clearInterval(countdownTimer);
    return;
  }
  const diff = new Date(next) - Date.now();
  if (diff <= 0) {
    countdown.value = "00:00:00";
    clearInterval(countdownTimer);
    profileStore.fetchProfile();
    return;
  }
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  countdown.value = `${h}:${m}:${s}`;
}

onMounted(() => {
  profileStore.fetchProfile();
  startCountdown();
});

onUnmounted(() => clearInterval(countdownTimer));
</script>

<style scoped>
.profile-page {
  max-width: 640px;
  margin: 0 auto;
}

/* ── Wanted Poster ── */
.wanted-poster {
  position: relative;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 28px,
      rgba(139, 105, 20, 0.05) 28px,
      rgba(139, 105, 20, 0.05) 29px
    ),
    linear-gradient(175deg, #3a2510 0%, #2a1a10 40%, #1f1209 100%);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(212, 160, 32, 0.08);
  overflow: hidden;
}

.wanted-poster::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(212, 160, 32, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(212, 160, 32, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

/* Corner nails */
.poster-nail {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, #8b7355, #5a4a3a);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  z-index: 1;
}
.poster-nail--tl { top: 12px; left: 12px; }
.poster-nail--tr { top: 12px; right: 12px; }
.poster-nail--bl { bottom: 12px; left: 12px; }
.poster-nail--br { bottom: 12px; right: 12px; }

/* Header */
.poster-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.poster-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.4), transparent);
  margin: 0.4rem 2rem;
}

.poster-title {
  font-family: var(--font-display);
  font-size: 2.6rem;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: 0.15em;
  text-shadow: 0 2px 8px rgba(212, 160, 32, 0.3);
}

.poster-subtitle {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0.1rem 0 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Body */
.poster-body {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.avatar-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.level-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid var(--color-gold);
  background: linear-gradient(145deg, rgba(212, 160, 32, 0.2), rgba(212, 160, 32, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(212, 160, 32, 0.15);
}

.level-num {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--color-gold);
}

.avatar-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
}

.poster-info {
  flex: 1;
  min-width: 0;
}

.outlaw-name {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-text);
  margin: 0 0 0.2rem;
}

.outlaw-email {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0 0 0.15rem;
}

.outlaw-since {
  font-size: 0.7rem;
  color: rgba(160, 128, 96, 0.7);
  margin: 0;
  font-style: italic;
}

/* XP Section */
.xp-section {
  margin-bottom: 1rem;
}

.xp-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.xp-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.xp-value {
  font-size: 0.72rem;
  color: var(--color-gold);
  font-weight: 600;
}

/* Reward line */
.reward-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.85rem;
  border-top: 1px dashed rgba(139, 105, 20, 0.3);
}

.reward-text {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  letter-spacing: 0.15em;
}

.reward-amount {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-gold);
  text-shadow: 0 1px 4px rgba(212, 160, 32, 0.25);
}

/* ── Personal Info Section ── */
.info-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  background: rgba(16, 10, 6, 0.6);
  border: 1px solid rgba(139, 105, 20, 0.12);
  border-radius: 8px;
  transition: border-color 0.2s;
}

.info-item:hover {
  border-color: rgba(212, 160, 32, 0.25);
}

.info-label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.info-value {
  font-size: 0.88rem;
  color: var(--color-text);
}

/* ── Edit Form Sections ── */
.edit-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-section-title {
  font-family: var(--font-display);
  font-size: 0.82rem;
  color: var(--color-gold);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: 0.04em;
}

.edit-section-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ── Daily Bonus Card ── */
.daily-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.daily-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  color: var(--color-gold);
}

.daily-icon svg {
  width: 100%;
  height: 100%;
}

.daily-info {
  flex: 1;
  min-width: 0;
}

.daily-title {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
}

.daily-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}

.daily-btn {
  padding: 0.55rem 1.2rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.daily-btn.available {
  background: linear-gradient(135deg, #d4a020, #b8860b);
  border-color: var(--color-gold);
  color: #1a0f0a;
  animation: dailyPulse 2s ease-in-out infinite;
}

.daily-btn.available:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(212, 160, 32, 0.35);
}

.daily-btn:disabled:not(.available) {
  cursor: default;
  opacity: 0.7;
}

@keyframes dailyPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(212, 160, 32, 0.15); }
  50% { box-shadow: 0 0 20px rgba(212, 160, 32, 0.4); }
}

/* ── Reward toast ── */
.reward-toast {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-gold);
  padding: 0.65rem;
  margin-bottom: 1.25rem;
  background: rgba(212, 160, 32, 0.1);
  border: 1px solid rgba(212, 160, 32, 0.3);
  border-radius: 8px;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Section titles ── */
.section-title {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-gold);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

/* ── Stats grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.85rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: rgba(212, 160, 32, 0.4);
}

.stat-icon {
  font-size: 1.1rem;
  margin-bottom: 0.15rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-gold);
}

.stat-value--sm {
  font-size: 0.8rem;
  word-break: break-word;
}

.stat-label {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Profile actions ── */
.actions-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-btn--edit {
  background: rgba(212, 160, 32, 0.08);
  border: 1px solid rgba(212, 160, 32, 0.2);
  color: var(--color-gold);
}
.action-btn--edit:hover {
  background: rgba(212, 160, 32, 0.15);
  border-color: rgba(212, 160, 32, 0.35);
}

.action-btn--logout {
  background: rgba(248, 113, 113, 0.06);
  border: 1px solid rgba(248, 113, 113, 0.15);
  color: var(--color-error);
}
.action-btn--logout:hover {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.3);
}

/* ── KYC Section ── */
.kyc-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
}

.kyc-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.kyc-status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.kyc-status-shield {
  width: 28px;
  height: 28px;
  color: var(--color-gold);
  flex-shrink: 0;
}

.kyc-status-title {
  display: block;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-text);
}

.kyc-status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.15rem;
}

.kyc-badge--none {
  background: rgba(248, 113, 113, 0.1);
  color: var(--color-error);
}

.kyc-badge--pending {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
}

.kyc-badge--verified {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.kyc-badge--rejected {
  background: rgba(248, 113, 113, 0.1);
  color: var(--color-error);
}

/* ── Danger zone ── */
.danger-zone {
  background: rgba(248, 113, 113, 0.04);
  border: 1px solid rgba(248, 113, 113, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.danger-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-error);
  margin-bottom: 0.4rem;
}

.danger-icon {
  width: 18px;
  height: 18px;
}

.danger-desc {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0 0 1rem;
  line-height: 1.4;
}

.action-btn--delete {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: var(--color-error);
  flex: none;
}
.action-btn--delete:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.4);
}

/* ── Modals ── */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.modal-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 105, 20, 0.3), transparent);
  margin: 0.25rem 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.modal-btn {
  flex: 1;
  padding: 0.65rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn--cancel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
.modal-btn--cancel:hover {
  background: rgba(139, 105, 20, 0.1);
}

.modal-btn--save {
  background: linear-gradient(135deg, #d4a020, #b8860b);
  border: 1px solid var(--color-gold);
  color: #1a0f0a;
}
.modal-btn--save:hover:not(:disabled) {
  box-shadow: 0 2px 12px rgba(212, 160, 32, 0.3);
}
.modal-btn--save:disabled {
  opacity: 0.6;
  cursor: default;
}

.modal-btn--danger {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border: 1px solid #dc2626;
  color: #fff;
}
.modal-btn--danger:hover:not(:disabled) {
  box-shadow: 0 2px 12px rgba(220, 38, 38, 0.3);
}
.modal-btn--danger:disabled {
  opacity: 0.6;
  cursor: default;
}

.delete-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delete-warning {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 8px;
}

.delete-warning-icon {
  width: 20px;
  height: 20px;
  color: var(--color-error);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.delete-warning p {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.delete-warning strong {
  color: var(--color-error);
}

/* ── Error ── */
.error-msg {
  text-align: center;
  color: var(--color-error);
  font-size: 0.85rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .wanted-poster { padding: 1.25rem 1rem; }
  .poster-title { font-size: 2rem; }
  .level-ring { width: 60px; height: 60px; }
  .level-num { font-size: 1.5rem; }
  .outlaw-name { font-size: 1.15rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-section { flex-direction: column; }
}

@media (max-width: 380px) {
  .poster-body { gap: 0.75rem; }
  .level-ring { width: 52px; height: 52px; }
  .level-num { font-size: 1.2rem; }
  .stat-value { font-size: 1rem; }
  .stats-grid { gap: 0.5rem; }
}
</style>
