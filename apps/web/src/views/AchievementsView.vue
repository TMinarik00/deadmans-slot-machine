<!--
  Achievements page - Wild West bounty board.
  Premium card design with rich hover effects.
-->
<template>
  <div class="achievements-page">
    <div class="page-header fade-up">
      <div class="header-line"></div>
      <h1 class="title">Bounty Board</h1>
      <p class="subtitle">Track your outlaw accomplishments</p>
      <div class="header-line"></div>
    </div>

    <!-- Summary cards -->
    <div class="summary-row fade-up fade-up-1">
      <div class="summary-card summary-card--claimed">
        <div class="summary-icon-wrap">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </div>
        <span class="summary-num">{{ claimedCount }}</span>
        <span class="summary-label">Claimed</span>
      </div>
      <div class="summary-card summary-card--ready">
        <div class="summary-icon-wrap summary-icon-wrap--ready">
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <span class="summary-num">{{ unlockedCount }}</span>
        <span class="summary-label">Ready</span>
      </div>
      <div class="summary-card summary-card--progress">
        <div class="summary-icon-wrap summary-icon-wrap--progress">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        </div>
        <span class="summary-num">{{ lockedCount }}</span>
        <span class="summary-label">In Progress</span>
      </div>
    </div>

    <!-- Overall progress -->
    <div class="overall fade-up fade-up-1">
      <div class="overall-row">
        <span class="overall-label">Overall Completion</span>
        <span class="overall-pct">{{ overallPercent }}%</span>
      </div>
      <div class="overall-bar">
        <div class="overall-fill" :style="{ width: overallPercent + '%' }"></div>
      </div>
    </div>

    <!-- Reward toast -->
    <div v-if="rewardMsg" class="reward-toast">{{ rewardMsg }}</div>

    <!-- Category tabs -->
    <BaseTabs v-model="selectedCategory" :tabs="categories" compact class="ach-tabs fade-up fade-up-2" />

    <!-- Achievements list -->
    <div class="ach-list fade-up fade-up-3">
      <div
        v-for="ach in filteredAchievements"
        :key="ach.id"
        class="ach-card"
        :class="{
          'ach-card--ready': ach.unlocked && !ach.claimed,
          'ach-card--claimed': ach.claimed,
          'ach-card--locked': !ach.unlocked,
        }"
      >
        <!-- Left: status badge -->
        <div class="ach-badge">
          <div v-if="ach.claimed" class="ach-badge-inner ach-badge--claimed">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
          </div>
          <div v-else-if="ach.unlocked" class="ach-badge-inner ach-badge--ready">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <div v-else class="ach-badge-inner ach-badge--locked">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <!-- Center: info -->
        <div class="ach-info">
          <div class="ach-info-top">
            <span class="ach-name">{{ ach.name }}</span>
            <span class="ach-cat">{{ ach.category }}</span>
          </div>
          <span class="ach-desc">{{ ach.description }}</span>
          <div class="ach-progress-row">
            <div class="ach-bar">
              <div
                class="ach-bar-fill"
                :class="{
                  'ach-bar-fill--full': ach.unlocked && !ach.claimed,
                  'ach-bar-fill--claimed': ach.claimed,
                }"
                :style="{ width: barWidth(ach) + '%' }"
              ></div>
            </div>
            <span class="ach-progress-text">{{ ach.progress }}/{{ ach.threshold }}</span>
          </div>
        </div>

        <!-- Right: reward/action -->
        <div class="ach-reward">
          <button
            v-if="ach.unlocked && !ach.claimed"
            class="claim-btn"
            :disabled="claimingAch === ach.id"
            @click="claimAch(ach)"
          >
            <span class="claim-btn-text">{{ claimingAch === ach.id ? '...' : 'Claim' }}</span>
            <span v-if="claimingAch !== ach.id" class="claim-btn-amount">{{ ach.chipsReward }}</span>
          </button>
          <div v-else-if="ach.claimed" class="claimed-tag">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
            <span>Claimed</span>
          </div>
          <div v-else class="reward-preview">
            <span class="reward-preview-num">{{ ach.chipsReward }}</span>
            <span class="reward-preview-label">CHIPS</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="filteredAchievements.length === 0 && !profileStore.loading"
      class="empty-state fade-up fade-up-3"
    >
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 15l-2 5 2-1.5L14 20l-2-5z"/>
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"/>
        <circle cx="12" cy="8" r="7"/>
      </svg>
      <p>No achievements in this category yet.</p>
    </div>

    <p v-if="profileStore.error" class="error-msg">{{ profileStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProfileStore } from "../stores/profile.js";
import { useWalletStore } from "../stores/wallet.js";
import BaseTabs from "../components/ui/BaseTabs.vue";

const profileStore = useProfileStore();
const walletStore = useWalletStore();

const claimingAch = ref(null);
const rewardMsg = ref("");
const selectedCategory = ref("all");

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

const unlockedCount = computed(() =>
  profileStore.achievements.filter((a) => a.unlocked && !a.claimed).length
);

const lockedCount = computed(() =>
  profileStore.achievements.filter((a) => !a.unlocked).length
);

const overallPercent = computed(() => {
  const total = profileStore.achievements.length;
  if (!total) return 0;
  return Math.round((claimedCount.value / total) * 100);
});

const filteredAchievements = computed(() => {
  const achs = selectedCategory.value === "all"
    ? profileStore.achievements
    : profileStore.achievements.filter((a) => a.category === selectedCategory.value);
  // Sort: ready to claim first, then in-progress, then claimed
  return [...achs].sort((a, b) => {
    const order = (x) => (x.unlocked && !x.claimed ? 0 : !x.unlocked ? 1 : 2);
    return order(a) - order(b);
  });
});

function barWidth(ach) {
  if (ach.threshold <= 0) return 0;
  return Math.min(100, (ach.progress / ach.threshold) * 100);
}

function showReward(msg) {
  rewardMsg.value = msg;
  setTimeout(() => { rewardMsg.value = ""; }, 4000);
}

async function claimAch(ach) {
  claimingAch.value = ach.id;
  try {
    const data = await profileStore.claimAchievement(ach.id);
    walletStore.fetchWallets();
    let msg = `${ach.name}: +${data.chipsAwarded} CHIPS, +${data.xpAwarded} XP`;
    if (data.levelUpRewards > 0) {
      msg += ` | Level up!`;
    }
    showReward(msg);
  } catch {
    // error shown by store
  } finally {
    claimingAch.value = null;
  }
}

onMounted(() => {
  profileStore.fetchProfile();
  profileStore.fetchAchievements();
});
</script>

<style scoped>
.achievements-page {
  max-width: 680px;
  margin: 0 auto;
}

/* ── Page header ── */
.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.header-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 160, 32, 0.35), transparent);
  margin: 0.4rem 3rem;
}

.title {
  font-family: var(--font-display);
  font-size: 2.4rem;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: 0.08em;
  text-shadow: 0 2px 8px rgba(212, 160, 32, 0.25);
}

.subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0.15rem 0 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── Summary row ── */
.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 1rem 0.5rem;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  border-color: rgba(212, 160, 32, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.summary-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
  color: var(--color-success);
}

.summary-icon-wrap svg { width: 14px; height: 14px; }

.summary-icon-wrap--ready {
  background: rgba(212, 160, 32, 0.12);
  color: var(--color-gold);
}

.summary-icon-wrap--progress {
  background: rgba(139, 105, 20, 0.1);
  color: var(--color-text-muted);
}

.summary-card--claimed { border-color: rgba(74, 222, 128, 0.2); }
.summary-card--ready { border-color: rgba(212, 160, 32, 0.25); }

.summary-num {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-text);
}

.summary-card--claimed .summary-num { color: var(--color-success); }
.summary-card--ready .summary-num { color: var(--color-gold); }

.summary-label {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

/* ── Overall progress ── */
.overall {
  margin-bottom: 1.25rem;
}

.overall-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.overall-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.overall-pct {
  font-size: 0.72rem;
  color: var(--color-gold);
  font-weight: 700;
}

.overall-bar {
  height: 6px;
  background: rgba(139, 105, 20, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.overall-fill {
  height: 100%;
  background: linear-gradient(90deg, #b8860b, #d4a020);
  border-radius: 3px;
  transition: width 0.5s ease;
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

/* ── Tabs ── */
.ach-tabs {
  margin-bottom: 1rem;
  justify-content: center;
}

/* ── Achievement list ── */
.ach-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ach-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.ach-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

/* Ready to claim - glowing gold */
.ach-card--ready {
  border-color: rgba(212, 160, 32, 0.45);
  background:
    linear-gradient(175deg, rgba(58, 37, 16, 0.95) 0%, rgba(42, 26, 16, 0.9) 100%);
  box-shadow: 0 0 20px rgba(212, 160, 32, 0.08);
}

.ach-card--ready:hover {
  border-color: rgba(212, 160, 32, 0.6);
  box-shadow: 0 6px 24px rgba(212, 160, 32, 0.15);
}

/* Claimed - subtle success accent */
.ach-card--claimed {
  border-color: rgba(74, 222, 128, 0.18);
}

.ach-card--claimed:hover {
  border-color: rgba(74, 222, 128, 0.3);
}

/* Locked - still fully visible, just different accent */
.ach-card--locked {
  border-color: rgba(139, 105, 20, 0.18);
}

.ach-card--locked:hover {
  border-color: rgba(212, 160, 32, 0.3);
}

/* ── Badge (left icon) ── */
.ach-badge {
  flex-shrink: 0;
  width: 42px;
  display: flex;
  justify-content: center;
}

.ach-badge-inner {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.ach-card:hover .ach-badge-inner {
  transform: scale(1.08);
}

.ach-badge-inner svg {
  width: 18px;
  height: 18px;
}

.ach-badge--claimed {
  background: rgba(74, 222, 128, 0.1);
  border: 1.5px solid rgba(74, 222, 128, 0.3);
  color: var(--color-success);
}

.ach-badge--ready {
  background: rgba(212, 160, 32, 0.12);
  border: 1.5px solid rgba(212, 160, 32, 0.4);
  color: var(--color-gold);
  animation: readyGlow 2.5s ease-in-out infinite;
}

@keyframes readyGlow {
  0%, 100% { box-shadow: 0 0 4px rgba(212, 160, 32, 0.1); }
  50% { box-shadow: 0 0 16px rgba(212, 160, 32, 0.3); }
}

.ach-badge--locked {
  background: rgba(139, 105, 20, 0.08);
  border: 1.5px solid rgba(139, 105, 20, 0.2);
  color: rgba(212, 160, 32, 0.5);
}

/* ── Info ── */
.ach-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ach-info-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ach-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: color 0.2s;
}

.ach-card--claimed .ach-name { color: rgba(160, 128, 96, 0.8); }
.ach-card--ready .ach-name { color: var(--color-gold); }

.ach-cat {
  font-size: 0.55rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(139, 105, 20, 0.1);
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
}

.ach-desc {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  line-height: 1.35;
}

/* ── Progress bar ── */
.ach-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.ach-bar {
  flex: 1;
  height: 5px;
  background: rgba(139, 105, 20, 0.12);
  border-radius: 3px;
  overflow: hidden;
}

.ach-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(212, 160, 32, 0.3), rgba(212, 160, 32, 0.45));
  border-radius: 3px;
  transition: width 0.4s ease;
}

.ach-bar-fill--full {
  background: linear-gradient(90deg, #b8860b, #d4a020);
}

.ach-bar-fill--claimed {
  background: linear-gradient(90deg, rgba(74, 222, 128, 0.35), rgba(74, 222, 128, 0.2));
}

.ach-progress-text {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 38px;
  text-align: right;
  font-weight: 600;
}

/* ── Reward column ── */
.ach-reward {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.claim-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #d4a020, #b8860b);
  color: #1a0f0a;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.claim-btn-text {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.claim-btn-amount {
  font-family: var(--font-display);
  font-size: 0.85rem;
}

.claim-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(212, 160, 32, 0.35);
}

.claim-btn:disabled { opacity: 0.6; cursor: default; }

.claimed-tag {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  color: var(--color-success);
  font-size: 0.68rem;
  font-weight: 600;
}

.claimed-tag svg {
  width: 12px;
  height: 12px;
}

.reward-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  background: rgba(212, 160, 32, 0.06);
  border: 1px solid rgba(212, 160, 32, 0.12);
  transition: border-color 0.2s, background 0.2s;
}

.ach-card:hover .reward-preview {
  border-color: rgba(212, 160, 32, 0.25);
  background: rgba(212, 160, 32, 0.1);
}

.reward-preview-num {
  font-family: var(--font-display);
  font-size: 0.88rem;
  color: var(--color-gold);
  line-height: 1;
}

.reward-preview-label {
  font-size: 0.48rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin: 0;
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
  .title { font-size: 1.8rem; }
  .header-line { margin: 0.3rem 1.5rem; }
  .summary-num { font-size: 1.2rem; }
  .summary-card { padding: 0.75rem 0.4rem; }
  .summary-icon-wrap { width: 24px; height: 24px; }
  .summary-icon-wrap svg { width: 12px; height: 12px; }
  .ach-card { padding: 0.8rem; gap: 0.65rem; }
  .ach-badge { width: 36px; }
  .ach-badge-inner { width: 32px; height: 32px; }
  .ach-badge-inner svg { width: 15px; height: 15px; }
}

@media (max-width: 380px) {
  .summary-row { gap: 0.4rem; }
  .ach-name { font-size: 0.82rem; }
}
</style>
