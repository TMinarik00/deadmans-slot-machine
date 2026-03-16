<!--
  Leaderboard page - top 20 players with type selector (totalWon, biggestWin, level).
-->
<template>
  <div class="lb-page">
    <h1 class="title">Hall of Fame</h1>

    <!-- Type tabs -->
    <div class="lb-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="lb-tab"
        :class="{ active: profileStore.leaderboardType === tab.value }"
        @click="switchType(tab.value)"
      >{{ tab.label }}</button>
    </div>

    <!-- Table -->
    <div class="lb-table" v-if="profileStore.leaderboard.length">
      <div class="lb-header">
        <span class="lb-col lb-col--rank">#</span>
        <span class="lb-col lb-col--name">Player</span>
        <span class="lb-col lb-col--level">Level</span>
        <span class="lb-col lb-col--stat">{{ statLabel }}</span>
      </div>

      <div
        v-for="entry in profileStore.leaderboard"
        :key="entry.rank"
        class="lb-row"
        :class="{
          'lb-self': entry.username === authStore.user?.username,
          'lb-top3': entry.rank <= 3,
        }"
      >
        <span class="lb-col lb-col--rank">
          <span v-if="entry.rank === 1" class="rank-medal">1</span>
          <span v-else-if="entry.rank === 2" class="rank-medal rank-silver">2</span>
          <span v-else-if="entry.rank === 3" class="rank-medal rank-bronze">3</span>
          <span v-else>{{ entry.rank }}</span>
        </span>
        <span class="lb-col lb-col--name">{{ entry.username }}</span>
        <span class="lb-col lb-col--level">
          <span class="level-pill">{{ entry.level }}</span>
        </span>
        <span class="lb-col lb-col--stat">{{ formatStat(entry) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!profileStore.error" class="empty-state">
      No data yet. Start playing to climb the ranks!
    </div>

    <!-- Error -->
    <p v-if="profileStore.error" class="error-msg">{{ profileStore.error }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { useProfileStore } from "../stores/profile.js";

const authStore = useAuthStore();
const profileStore = useProfileStore();

const tabs = [
  { value: "totalWon", label: "Total Won" },
  { value: "biggestWin", label: "Biggest Win" },
  { value: "level", label: "Level" },
];

const statLabel = computed(() => {
  const map = { totalWon: "Total Won", biggestWin: "Biggest Win", level: "Level" };
  return map[profileStore.leaderboardType] || "Value";
});

function switchType(type) {
  profileStore.fetchLeaderboard(type);
}

function formatStat(entry) {
  const type = profileStore.leaderboardType;
  if (type === "totalWon") return Number(entry.totalWon || 0).toLocaleString();
  if (type === "biggestWin") return Number(entry.biggestWin || 0).toLocaleString();
  if (type === "level") return entry.level;
  return "—";
}

onMounted(() => {
  profileStore.fetchLeaderboard(profileStore.leaderboardType);
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
  margin: 0 0 1.5rem;
}

/* ── Tabs ── */
.lb-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.lb-tab {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.45rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
}

.lb-tab:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.lb-tab.active {
  background: rgba(212, 160, 32, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

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
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lb-row {
  display: flex;
  padding: 0.65rem 1rem;
  align-items: center;
  border-bottom: 1px solid rgba(139, 105, 20, 0.15);
  transition: background 0.15s;
}

.lb-row:last-child {
  border-bottom: none;
}

.lb-row:hover {
  background: rgba(212, 160, 32, 0.04);
}

.lb-self {
  background: rgba(212, 160, 32, 0.1) !important;
  border-left: 3px solid var(--color-gold);
}

.lb-top3 {
  font-weight: 600;
}

.lb-col {
  font-size: 0.88rem;
  color: var(--color-text);
}

.lb-col--rank {
  width: 44px;
  flex-shrink: 0;
  text-align: center;
}

.lb-col--name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-col--level {
  width: 56px;
  flex-shrink: 0;
  text-align: center;
}

.lb-col--stat {
  width: 100px;
  flex-shrink: 0;
  text-align: right;
  font-weight: 600;
  color: var(--color-gold);
}

/* Rank medals */
.rank-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d4a020, #7a5c10);
  color: #1a0f0a;
  font-weight: 800;
  font-size: 0.75rem;
  box-shadow: 0 2px 6px rgba(212, 160, 32, 0.3);
}

.rank-silver {
  background: linear-gradient(145deg, #c0c0c0, #808080);
}

.rank-bronze {
  background: linear-gradient(145deg, #cd7f32, #8b5a2b);
  color: #fff;
}

/* Level pill */
.level-pill {
  display: inline-block;
  background: rgba(212, 160, 32, 0.15);
  color: var(--color-gold);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── Empty / Error ── */
.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

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
  .lb-tab { padding: 0.4rem 0.7rem; font-size: 0.78rem; }
  .lb-row { padding: 0.55rem 0.7rem; }
  .lb-col { font-size: 0.82rem; }
  .lb-col--stat { width: 80px; }
  .rank-medal { width: 22px; height: 22px; font-size: 0.65rem; }
}

@media (max-width: 380px) {
  .lb-tabs { gap: 0.25rem; }
  .lb-tab { padding: 0.35rem 0.5rem; font-size: 0.72rem; }
  .lb-col--rank { width: 36px; }
  .lb-col--level { width: 44px; }
  .lb-col--stat { width: 68px; font-size: 0.75rem; }
}
</style>
