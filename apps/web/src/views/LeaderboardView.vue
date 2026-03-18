<!--
  Leaderboard page - Hall of Fame with podium for top 3.
-->
<template>
  <div class="lb-page">
    <h1 class="title fade-up">Hall of Fame</h1>

    <!-- Type tabs -->
    <BaseTabs
      v-model="currentType"
      :tabs="tabs"
      class="lb-tabs fade-up fade-up-1"
    />

    <!-- Podium for top 3 -->
    <div v-if="top3.length >= 3" class="podium fade-up fade-up-2">
      <!-- 2nd place -->
      <div class="podium-item podium-item--2nd">
        <div class="podium-avatar">
          <span class="podium-initial">{{ top3[1].username?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="podium-name">{{ top3[1].username }}</span>
        <span class="podium-stat">{{ formatStat(top3[1]) }}</span>
        <div class="podium-pillar podium-pillar--2nd">
          <span class="podium-rank">2</span>
        </div>
      </div>
      <!-- 1st place -->
      <div class="podium-item podium-item--1st">
        <div class="podium-crown">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M19 19H5a1 1 0 010-2h14a1 1 0 010 2z"/></svg>
        </div>
        <div class="podium-avatar podium-avatar--gold">
          <span class="podium-initial">{{ top3[0].username?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="podium-name podium-name--gold">{{ top3[0].username }}</span>
        <span class="podium-stat podium-stat--gold">{{ formatStat(top3[0]) }}</span>
        <div class="podium-pillar podium-pillar--1st">
          <span class="podium-rank">1</span>
        </div>
      </div>
      <!-- 3rd place -->
      <div class="podium-item podium-item--3rd">
        <div class="podium-avatar podium-avatar--bronze">
          <span class="podium-initial">{{ top3[2].username?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="podium-name">{{ top3[2].username }}</span>
        <span class="podium-stat">{{ formatStat(top3[2]) }}</span>
        <div class="podium-pillar podium-pillar--3rd">
          <span class="podium-rank">3</span>
        </div>
      </div>
    </div>

    <!-- Table for remaining players (rank 4+) or all if < 3 -->
    <div class="lb-table fade-up fade-up-3" v-if="remainingPlayers.length">
      <div class="lb-header">
        <span class="lb-col lb-col--rank">#</span>
        <span class="lb-col lb-col--name">Player</span>
        <span class="lb-col lb-col--level">Lvl</span>
        <span class="lb-col lb-col--stat">{{ statLabel }}</span>
      </div>

      <div
        v-for="entry in remainingPlayers"
        :key="entry.rank"
        class="lb-row"
        :class="{ 'lb-self': entry.username === authStore.user?.username }"
      >
        <span class="lb-col lb-col--rank">
          <span class="rank-num">{{ entry.rank }}</span>
        </span>
        <span class="lb-col lb-col--name">
          <span class="player-initial">{{ entry.username?.charAt(0).toUpperCase() }}</span>
          {{ entry.username }}
        </span>
        <span class="lb-col lb-col--level">
          <span class="level-pill">{{ entry.level }}</span>
        </span>
        <span class="lb-col lb-col--stat">{{ formatStat(entry) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="profileStore.leaderboard.length === 0 && !profileStore.error"
      class="empty-state fade-up fade-up-2"
    >
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 15l-2 5 2-1.5L14 20l-2-5z"/>
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"/>
        <circle cx="12" cy="8" r="7"/>
      </svg>
      <p class="empty-text">No data yet. Start playing to climb the ranks!</p>
    </div>

    <!-- Error -->
    <p v-if="profileStore.error" class="error-msg">{{ profileStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { useProfileStore } from "../stores/profile.js";
import BaseTabs from "../components/ui/BaseTabs.vue";

const authStore = useAuthStore();
const profileStore = useProfileStore();

const tabs = [
  { value: "totalWon", label: "Total Won" },
  { value: "biggestWin", label: "Biggest Win" },
  { value: "level", label: "Level" },
];

const currentType = ref("totalWon");

const statLabel = computed(() => {
  const map = { totalWon: "Total Won", biggestWin: "Biggest Win", level: "Level" };
  return map[currentType.value] || "Value";
});

const top3 = computed(() => profileStore.leaderboard.slice(0, 3));
const remainingPlayers = computed(() => {
  if (profileStore.leaderboard.length < 3) return profileStore.leaderboard;
  return profileStore.leaderboard.slice(3);
});

watch(currentType, (type) => {
  profileStore.fetchLeaderboard(type);
});

function formatStat(entry) {
  if (currentType.value === "totalWon") return Number(entry.totalWon || 0).toLocaleString();
  if (currentType.value === "biggestWin") return Number(entry.biggestWin || 0).toLocaleString();
  if (currentType.value === "level") return entry.level;
  return "\u2014";
}

onMounted(() => {
  profileStore.fetchLeaderboard(currentType.value);
});
</script>

<style scoped>
.lb-page {
  max-width: 640px;
  margin: 0 auto;
}

.title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--color-gold);
  text-align: center;
  margin: 0 0 1.25rem;
  letter-spacing: 0.05em;
}

/* ── Type tabs ── */
.lb-tabs {
  justify-content: center;
  margin-bottom: 1.25rem;
}

/* ── Podium ── */
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0 1rem;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex: 1;
  max-width: 140px;
}

.podium-crown {
  color: var(--color-gold);
  margin-bottom: -0.15rem;
  animation: crownFloat 3s ease-in-out infinite;
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.podium-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(192, 192, 192, 0.25), rgba(192, 192, 192, 0.08));
  border: 2px solid #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.podium-avatar--gold {
  width: 52px;
  height: 52px;
  background: linear-gradient(145deg, rgba(212, 160, 32, 0.3), rgba(212, 160, 32, 0.08));
  border-color: var(--color-gold);
  box-shadow: 0 0 16px rgba(212, 160, 32, 0.2);
}

.podium-avatar--bronze {
  background: linear-gradient(145deg, rgba(205, 127, 50, 0.25), rgba(205, 127, 50, 0.08));
  border-color: #cd7f32;
}

.podium-initial {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-text);
}

.podium-avatar--gold .podium-initial {
  font-size: 1.2rem;
  color: var(--color-gold);
}

.podium-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-name--gold {
  color: var(--color-gold);
}

.podium-stat {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.podium-stat--gold {
  color: var(--color-gold);
}

.podium-pillar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
  margin-top: 0.25rem;
}

.podium-pillar--1st {
  height: 72px;
  background: linear-gradient(180deg, rgba(212, 160, 32, 0.25), rgba(212, 160, 32, 0.08));
  border: 1px solid rgba(212, 160, 32, 0.3);
  border-bottom: none;
}

.podium-pillar--2nd {
  height: 52px;
  background: linear-gradient(180deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.05));
  border: 1px solid rgba(192, 192, 192, 0.25);
  border-bottom: none;
}

.podium-pillar--3rd {
  height: 36px;
  background: linear-gradient(180deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.05));
  border: 1px solid rgba(205, 127, 50, 0.25);
  border-bottom: none;
}

.podium-rank {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.podium-pillar--1st .podium-rank { color: var(--color-gold); font-size: 1.4rem; }
.podium-pillar--2nd .podium-rank { color: #c0c0c0; }
.podium-pillar--3rd .podium-rank { color: #cd7f32; }

/* ── Table ── */
.lb-table {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.lb-header {
  display: flex;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.68rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lb-row {
  display: flex;
  padding: 0.6rem 1rem;
  align-items: center;
  border-bottom: 1px solid rgba(139, 105, 20, 0.1);
  transition: background 0.15s;
}

.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: rgba(212, 160, 32, 0.04); }

.lb-self {
  background: rgba(212, 160, 32, 0.08) !important;
  border-left: 3px solid var(--color-gold);
}

.lb-col { font-size: 0.85rem; color: var(--color-text); }
.lb-col--rank { width: 40px; flex-shrink: 0; text-align: center; }
.lb-col--name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lb-col--level { width: 48px; flex-shrink: 0; text-align: center; }
.lb-col--stat { width: 100px; flex-shrink: 0; text-align: right; font-weight: 600; color: var(--color-gold); }

.rank-num {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.player-initial {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(139, 105, 20, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-gold);
  flex-shrink: 0;
}

.level-pill {
  display: inline-block;
  background: rgba(212, 160, 32, 0.15);
  color: var(--color-gold);
  padding: 0.12rem 0.4rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-text {
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
  .title { font-size: 1.7rem; margin-bottom: 1rem; }
  .podium { gap: 0.35rem; padding: 0; }
  .podium-avatar { width: 36px; height: 36px; }
  .podium-avatar--gold { width: 44px; height: 44px; }
  .podium-name { font-size: 0.68rem; }
  .podium-pillar--1st { height: 56px; }
  .podium-pillar--2nd { height: 40px; }
  .podium-pillar--3rd { height: 28px; }
  .lb-row { padding: 0.5rem 0.7rem; }
  .lb-col { font-size: 0.8rem; }
  .lb-col--stat { width: 80px; }
}

@media (max-width: 380px) {
  .lb-col--rank { width: 32px; }
  .lb-col--level { width: 40px; }
  .lb-col--stat { width: 68px; font-size: 0.72rem; }
  .player-initial { width: 20px; height: 20px; font-size: 0.55rem; }
}
</style>
