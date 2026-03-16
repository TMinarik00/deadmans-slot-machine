<!--
  Profile page - level, XP progress, stats, daily bonus, and achievements.
-->
<template>
  <div class="profile-page">
    <h1 class="title">Wanted Board</h1>

    <!-- Hero: level + XP -->
    <div class="hero-card">
      <div class="hero-top">
        <div class="level-ring">
          <span class="level-num">{{ profileStore.level }}</span>
        </div>
        <div class="hero-info">
          <h2 class="hero-name">{{ authStore.user?.username }}</h2>
          <div class="xp-bar-wrap">
            <div class="xp-bar" :style="{ width: profileStore.xpPercent + '%' }"></div>
          </div>
          <span class="xp-text">{{ profileStore.xpProgress }} / {{ profileStore.xpNeeded }} XP</span>
        </div>
      </div>

      <!-- Daily bonus -->
      <button
        class="daily-btn"
        :class="{ available: profileStore.canClaimDaily }"
        :disabled="!profileStore.canClaimDaily || claiming"
        @click="claimDaily"
      >
        <template v-if="claiming">Claiming...</template>
        <template v-else-if="profileStore.canClaimDaily">Claim Daily Bonus</template>
        <template v-else>Next bonus in {{ countdown }}</template>
      </button>
    </div>

    <!-- Reward toast -->
    <div v-if="rewardMsg" class="reward-toast">{{ rewardMsg }}</div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ formatNum(profileStore.stats.totalSpins) }}</span>
        <span class="stat-label">Total Spins</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNum(profileStore.stats.totalWins) }}</span>
        <span class="stat-label">Total Wins</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNum(profileStore.stats.totalWagered) }}</span>
        <span class="stat-label">Wagered</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNum(profileStore.stats.totalWon) }}</span>
        <span class="stat-label">Total Won</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNum(profileStore.stats.biggestWin) }}</span>
        <span class="stat-label">Biggest Win</span>
      </div>
      <div class="stat-card stat-card--wide">
        <span class="stat-value stat-value--sm">{{ profileStore.stats.favoriteGame || '—' }}</span>
        <span class="stat-label">Favorite Game</span>
      </div>
    </div>

    <!-- Achievements -->
    <div class="ach-section">
      <h2 class="section-title">
        Achievements
        <span class="ach-counter">{{ claimedCount }} / {{ profileStore.achievements.length }}</span>
      </h2>

      <!-- Category filter -->
      <div class="cat-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="cat-tab"
          :class="{ active: selectedCategory === cat.value }"
          @click="selectedCategory = cat.value"
        >{{ cat.label }}</button>
      </div>

      <div class="ach-grid">
        <div
          v-for="ach in filteredAchievements"
          :key="ach.id"
          class="ach-card"
          :class="{ unlocked: ach.unlocked, claimed: ach.claimed }"
        >
          <span class="ach-icon">{{ categoryIcon(ach.category) }}</span>
          <span class="ach-name">{{ ach.name }}</span>
          <span class="ach-desc">{{ ach.description }}</span>
          <div class="ach-bar-wrap">
            <div class="ach-bar" :style="{ width: achPercent(ach) + '%' }"></div>
          </div>
          <span class="ach-progress">{{ ach.progress }} / {{ ach.threshold }}</span>
          <button
            v-if="ach.unlocked && !ach.claimed"
            class="ach-claim-btn"
            :disabled="claimingAch === ach.id"
            @click="claimAch(ach)"
          >
            {{ claimingAch === ach.id ? '...' : `Claim ${ach.chipsReward} CHIPS` }}
          </button>
          <span v-else-if="ach.claimed" class="ach-claimed-tag">Claimed</span>
        </div>
      </div>
    </div>

    <!-- Error -->
    <p v-if="profileStore.error" class="error-msg">{{ profileStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { useProfileStore } from "../stores/profile.js";
import { useWalletStore } from "../stores/wallet.js";

const authStore = useAuthStore();
const profileStore = useProfileStore();
const walletStore = useWalletStore();

const claiming = ref(false);
const claimingAch = ref(null);
const rewardMsg = ref("");
const selectedCategory = ref("all");
const countdown = ref("--:--:--");
let countdownTimer = null;

const categories = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "wins", label: "Wins" },
  { value: "levels", label: "Levels" },
  { value: "game", label: "Games" },
];

const claimedCount = computed(() =>
  profileStore.achievements.filter((a) => a.claimed).length
);

const filteredAchievements = computed(() => {
  if (selectedCategory.value === "all") return profileStore.achievements;
  return profileStore.achievements.filter((a) => a.category === selectedCategory.value);
});

function categoryIcon(cat) {
  const icons = { general: "\u2B50", wins: "\uD83C\uDFC6", levels: "\uD83D\uDCC8", game: "\uD83C\uDFB0" };
  return icons[cat] || "\u2B50";
}

function achPercent(ach) {
  if (!ach.threshold) return 0;
  return Math.min(100, (ach.progress / ach.threshold) * 100);
}

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
    if (data.levelUpRewards?.length) {
      msg += ` | Level up! +${data.levelUpRewards.reduce((s, r) => s + r.reward, 0)} bonus CHIPS`;
    }
    showReward(msg);
    startCountdown();
  } catch {
    // error shown by store
  } finally {
    claiming.value = false;
  }
}

async function claimAch(ach) {
  claimingAch.value = ach.id;
  try {
    const data = await profileStore.claimAchievement(ach.id);
    walletStore.fetchWallets();
    let msg = `${ach.name}: +${data.chipsAwarded} CHIPS, +${data.xpAwarded} XP`;
    if (data.levelUpRewards?.length) {
      msg += ` | Level up!`;
    }
    showReward(msg);
  } catch {
    // error shown by store
  } finally {
    claimingAch.value = null;
  }
}

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
  profileStore.fetchAchievements();
  startCountdown();
});

onUnmounted(() => clearInterval(countdownTimer));
</script>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--color-gold);
  text-align: center;
  margin: 0 0 1.5rem;
}

/* ── Hero card ── */
.hero-card {
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(212, 160, 32, 0.08) 100%);
  border: 2px solid var(--color-gold);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.level-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--color-gold);
  background: linear-gradient(145deg, rgba(212, 160, 32, 0.2), rgba(212, 160, 32, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(212, 160, 32, 0.2);
}

.level-num {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--color-gold);
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.xp-bar-wrap {
  height: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.xp-bar {
  height: 100%;
  background: linear-gradient(90deg, #d4a020, #ffd700);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.xp-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  display: block;
}

/* Daily bonus */
.daily-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
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

/* ── Stats grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 0.75rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-card--wide {
  grid-column: span 2;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
}

.stat-value--sm {
  font-size: 1rem;
  word-break: break-word;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Achievements ── */
.ach-section {
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-gold);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ach-counter {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.cat-tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.cat-tab {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
}

.cat-tab:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.cat-tab.active {
  background: rgba(212, 160, 32, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.ach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.ach-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  opacity: 0.55;
  transition: all 0.2s;
}

.ach-card.unlocked {
  opacity: 1;
  border-color: var(--color-gold);
}

.ach-card.claimed {
  opacity: 0.8;
  border-color: var(--color-border);
}

.ach-icon {
  font-size: 1.5rem;
}

.ach-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-text);
}

.ach-desc {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.ach-bar-wrap {
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.15rem;
}

.ach-bar {
  height: 100%;
  background: linear-gradient(90deg, #d4a020, #ffd700);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.ach-progress {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.ach-claim-btn {
  margin-top: 0.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #d4a020, #b8860b);
  color: #1a0f0a;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.ach-claim-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(212, 160, 32, 0.3);
}

.ach-claim-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.ach-claimed-tag {
  font-size: 0.7rem;
  color: var(--color-success);
  font-weight: 600;
  margin-top: 0.2rem;
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
  .title { font-size: 1.7rem; margin-bottom: 1rem; }
  .hero-card { padding: 1.25rem; }
  .level-ring { width: 52px; height: 52px; }
  .level-num { font-size: 1.3rem; }
  .hero-name { font-size: 1rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-card--wide { grid-column: span 2; }
  .ach-grid { grid-template-columns: 1fr; }
}

@media (max-width: 380px) {
  .hero-top { gap: 0.75rem; }
  .level-ring { width: 44px; height: 44px; }
  .level-num { font-size: 1.1rem; }
  .stat-value { font-size: 1.1rem; }
  .stats-grid { gap: 0.5rem; }
}
</style>
