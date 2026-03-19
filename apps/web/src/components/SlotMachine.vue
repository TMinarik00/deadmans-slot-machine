<!--
  PixiJS-powered slot machine.
  All reel visuals, controls, and win effects rendered in WebGL canvas.
  Vue handles business logic (API calls, auto-spin, modals, toasts).
-->
<template>
  <div class="slot-machine">
    <!-- PixiJS canvas + overlays -->
    <div ref="canvasRef" class="canvas-wrap">
      <!-- XP / Level-up toast (overlays bottom of canvas) -->
      <div v-if="showXpToast" class="xp-toast" :class="{ 'xp-toast--levelup': gameStore.levelUp }">
        <span class="xp-toast-text">+{{ gameStore.xpEarned }} XP</span>
        <span v-if="gameStore.levelUp" class="xp-toast-level">
          Level {{ gameStore.levelUp.newLevel }}! +{{ gameStore.levelUp.reward }} CHIPS
        </span>
      </div>
    </div>

    <!-- LEVEL UP celebration modal -->
    <BaseModal v-if="showLevelUp" size="sm" center @close="dismissLevelUp">
      <div class="lvl-modal">
        <div class="lvl-glow"></div>
        <div class="lvl-badge">
          <svg class="lvl-star" viewBox="0 0 48 48" fill="none">
            <path d="M24 2l6.5 13.2L45 17.5l-10 9.7 2.4 13.8L24 34.2 10.6 41l2.4-13.8-10-9.7L17.5 15.2z" fill="url(#ls)"/>
            <defs><linearGradient id="ls" x1="24" y1="2" x2="24" y2="41">
              <stop stop-color="#FFD700"/><stop offset="1" stop-color="#B8860B"/>
            </linearGradient></defs>
          </svg>
          <span class="lvl-number">{{ levelUpData?.newLevel }}</span>
        </div>
        <h2 class="lvl-title">Level Up!</h2>
        <p class="lvl-subtitle">You reached <strong>Level {{ levelUpData?.newLevel }}</strong></p>
        <div class="lvl-reward">
          <span class="lvl-reward-amount">+{{ levelUpData?.reward?.toLocaleString() }}</span>
          <span class="lvl-reward-chip">CHIPS</span>
        </div>
        <BaseButton block variant="primary" class="lvl-btn" @click="dismissLevelUp">
          Awesome!
        </BaseButton>
      </div>
    </BaseModal>

    <!-- ACHIEVEMENT UNLOCKED modal -->
    <BaseModal v-if="showAchievement" size="sm" center @close="dismissAchievement">
      <div class="ach-modal">
        <div class="ach-glow"></div>
        <div class="ach-icon-wrap">
          <svg class="ach-icon" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="url(#ag)" stroke="#FFD700" stroke-width="2"/>
            <path d="M16 24l6 6 10-12" stroke="#1a0f0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="ag" x1="24" y1="4" x2="24" y2="44">
              <stop stop-color="#FFD700"/><stop offset="1" stop-color="#DAA520"/>
            </linearGradient></defs>
          </svg>
        </div>
        <h2 class="ach-title">Achievement Unlocked!</h2>
        <p class="ach-name">{{ achievementData?.name }}</p>
        <p class="ach-desc">{{ achievementData?.description }}</p>
        <div class="ach-rewards">
          <div v-if="achievementData?.chipsReward" class="ach-reward-item">
            <span class="ach-reward-val">{{ achievementData.chipsReward }}</span>
            <span class="ach-reward-label">CHIPS</span>
          </div>
          <div v-if="achievementData?.xpReward" class="ach-reward-item">
            <span class="ach-reward-val">{{ achievementData.xpReward }}</span>
            <span class="ach-reward-label">XP</span>
          </div>
        </div>
        <p class="ach-claim-hint">Visit Achievements to claim your reward</p>
        <BaseButton block variant="primary" class="ach-btn" @click="dismissAchievement">
          Got it!
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Auto-spin summary modal -->
    <BaseModal v-if="showAutoSummary" size="sm" center @close="showAutoSummary = false">
      <template #header>
        <span class="asr-header-text">Auto-Spin Complete</span>
      </template>

      <!-- Hero: big total won -->
      <div class="asr-hero">
        <div class="asr-hero-glow"></div>
        <svg class="asr-trophy" viewBox="0 0 48 48" fill="none">
          <path d="M14 8h20v4c0 8-4 14-10 16-6-2-10-8-10-16V8z" fill="url(#tg)"/>
          <path d="M10 8H6c0 6 2 10 6 12v-4c-2-2-2-4-2-8z" fill="#B8860B"/>
          <path d="M38 8h4c0 6-2 10-6 12v-4c2-2 2-4 2-8z" fill="#B8860B"/>
          <rect x="20" y="28" width="8" height="6" rx="1" fill="#B8860B"/>
          <rect x="16" y="34" width="16" height="4" rx="2" fill="#DAA520"/>
          <defs><linearGradient id="tg" x1="24" y1="8" x2="24" y2="28">
            <stop stop-color="#FFD700"/><stop offset="1" stop-color="#B8860B"/>
          </linearGradient></defs>
        </svg>
        <div class="asr-hero-label">Total Won</div>
        <div class="asr-hero-amount" :class="{ 'asr-hero-amount--zero': autoSummary.totalWon === 0 }">
          {{ autoSummary.totalWon.toLocaleString() }}
          <span class="asr-hero-chip">CHIPS</span>
        </div>
      </div>

      <!-- Net result badge -->
      <div class="asr-net" :class="autoSummary.net >= 0 ? 'asr-net--profit' : 'asr-net--loss'">
        <svg class="asr-net-icon" viewBox="0 0 16 16" fill="currentColor">
          <path v-if="autoSummary.net >= 0" d="M8 1l2.5 5 5.5.8-4 3.9.9 5.3L8 13.5 3.1 16l.9-5.3-4-3.9L5.5 6z"/>
          <path v-else d="M8 1a7 7 0 100 14A7 7 0 008 1zm3 9.5L9.5 12 8 10.5 6.5 12 5 10.5 6.5 9 5 7.5 6.5 6 8 7.5 9.5 6 11 7.5 9.5 9z"/>
        </svg>
        <span>{{ autoSummary.net >= 0 ? '+' : '' }}{{ autoSummary.net.toLocaleString() }} net</span>
      </div>

      <!-- Stats list -->
      <div class="asr-stats">
        <div class="asr-row">
          <span class="asr-row-icon">🎰</span>
          <span class="asr-row-label">Spins</span>
          <span class="asr-row-val">{{ autoSummary.count }}</span>
        </div>
        <div class="asr-row">
          <span class="asr-row-icon">💰</span>
          <span class="asr-row-label">Total Bet</span>
          <span class="asr-row-val">{{ autoSummary.totalBet.toLocaleString() }}</span>
        </div>
        <div class="asr-row">
          <span class="asr-row-icon">🏆</span>
          <span class="asr-row-label">Wins</span>
          <span class="asr-row-val">{{ autoSummary.wins }} / {{ autoSummary.count }}</span>
        </div>
        <div class="asr-row">
          <span class="asr-row-icon">⚡</span>
          <span class="asr-row-label">Biggest Win</span>
          <span class="asr-row-val asr-row-val--gold">{{ autoSummary.biggestWin.toLocaleString() }}</span>
        </div>
        <div class="asr-row">
          <span class="asr-row-icon">✨</span>
          <span class="asr-row-label">XP Earned</span>
          <span class="asr-row-val asr-row-val--xp">+{{ autoSummary.xpEarned }}</span>
        </div>
      </div>

      <BaseButton block variant="primary" class="asr-claim-btn" @click="showAutoSummary = false">
        <svg class="asr-claim-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        Claim
      </BaseButton>
    </BaseModal>

    <!-- Error -->
    <p v-if="gameStore.error" class="error-bar">{{ gameStore.error }}</p>

    <!-- Feature teaser -->
    <div v-if="gameStore.lastFeature" class="feature-bar">
      {{ gameStore.lastFeature.message }} <span class="soon">Coming soon</span>
    </div>

    <!-- Paytable button -->
    <button class="pt-toggle" @click="showPaytable = true">
      <svg class="pt-toggle-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/></svg>
      Paytable
    </button>

    <!-- Paytable Modal -->
    <PaytableModal v-if="showPaytable" :game="game" @close="showPaytable = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/game.js";
import { useWalletStore } from "../stores/wallet.js";
import { useProfileStore } from "../stores/profile.js";
import { SlotApp } from "../pixi/SlotApp.js";
import BaseModal from "./ui/BaseModal.vue";
import BaseButton from "./ui/BaseButton.vue";
import PaytableModal from "./PaytableModal.vue";

const props = defineProps({ game: { type: Object, required: true } });

const gameStore = useGameStore();
const walletStore = useWalletStore();
const profileStore = useProfileStore();
const router = useRouter();

const canvasRef = ref(null);
let slotApp = null;

// ── UI state ──
const showPaytable = ref(false);
const showXpToast = ref(false);
const showAutoSummary = ref(false);
const showLevelUp = ref(false);
const showAchievement = ref(false);
const levelUpData = ref(null);
const achievementData = ref(null);
const autoSummary = ref({ count: 0, totalBet: 0, totalWon: 0, net: 0, wins: 0, biggestWin: 0, xpEarned: 0 });
let xpTimer = null;
let autoStopRequested = false;
let isAutoSpinning = false;
let previousUnlockedIds = new Set(); // track previously unlocked achievements

// Achievement check: compare unlocked list before/after spins
async function checkForNewAchievements() {
  try {
    await profileStore.fetchAchievements();
    const allAchs = profileStore.achievements;
    const nowUnlocked = allAchs.filter(a => a.unlocked && !a.claimed);
    const newlyUnlocked = nowUnlocked.find(a => !previousUnlockedIds.has(a.id));
    // Update tracked set
    previousUnlockedIds = new Set(nowUnlocked.map(a => a.id));
    return newlyUnlocked || null;
  } catch {
    return null;
  }
}

async function initAchievementTracking() {
  try {
    await profileStore.fetchAchievements();
    const allAchs = profileStore.achievements;
    previousUnlockedIds = new Set(
      allAchs.filter(a => a.unlocked && !a.claimed).map(a => a.id)
    );
  } catch { /* ignore */ }
}

// Notification queue for sequential popups
const notificationQueue = [];
let isShowingNotification = false;

function queueNotification(type, data) {
  notificationQueue.push({ type, data });
  if (!isShowingNotification) showNextNotification();
}

function showNextNotification() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }
  isShowingNotification = true;
  const { type, data } = notificationQueue.shift();
  if (type === 'levelUp') {
    levelUpData.value = data;
    showLevelUp.value = true;
  } else if (type === 'achievement') {
    achievementData.value = data;
    showAchievement.value = true;
  }
}

function dismissLevelUp() {
  showLevelUp.value = false;
  levelUpData.value = null;
  showNextNotification();
}

function dismissAchievement() {
  showAchievement.value = false;
  achievementData.value = null;
  showNextNotification();
}

async function handlePostSpinNotifications(data) {
  // Queue level up first
  if (data.levelUp) {
    queueNotification('levelUp', data.levelUp);
  }
  // Check for newly unlocked achievements
  const newAch = await checkForNewAchievements();
  if (newAch) {
    queueNotification('achievement', newAch);
  }
}

const displayBalance = computed(() => gameStore.balance || walletStore.chipsBalance);
const insufficientBalance = computed(() => displayBalance.value < (gameStore.selectedBet || 0) * gameStore.selectedSpins);

// summaryStats removed — template uses autoSummary directly

// ── Mount PixiJS ──

onMounted(async () => {
  try {
    slotApp = new SlotApp();
    await slotApp.init(canvasRef.value, props.game);

    // Set initial state
    slotApp.setBalance(displayBalance.value);

    // Wire callbacks
    slotApp.onSpin = handleSpinClick;
    slotApp.onBetChange = (bet) => gameStore.setBet(bet);
    slotApp.onAutoChange = (count) => {
      gameStore.setSpins(count);
      slotApp.setAutoCount(count);
    };
    slotApp.onBack = () => router.replace({ name: "game" });
    slotApp.onAutoStop = () => { autoStopRequested = true; };

    // Initialize achievement tracking baseline
    initAchievementTracking();
  } catch (e) {
    console.error("[SlotMachine] Failed to initialize:", e);
    gameStore.error = "Failed to load slot machine. Please refresh.";
  }
});

onUnmounted(() => {
  clearTimeout(xpTimer);
  if (slotApp) {
    slotApp.destroy();
    slotApp = null;
  }
});

// ── Spin logic ──

function handleSpinClick() {
  if (gameStore.spinning || isAutoSpinning || insufficientBalance.value) return;

  if (gameStore.selectedSpins > 1) {
    runAutoSpin();
  } else {
    runSingleSpin();
  }
}

async function runSingleSpin() {
  try {
    slotApp.hideWins();
    slotApp.setSpinButtonState(false);
    showXpToast.value = false;
    clearTimeout(xpTimer);

    const data = await gameStore.doSpin();
    await slotApp.animateSpin(data.grid);

    if (data.totalWin > 0) {
      slotApp.showWins(data.wins, data.totalWin);
    }

    slotApp.setBalance(data.balance);

    // XP toast
    if (data.xpEarned > 0) {
      const delay = data.totalWin > 0 ? 1200 : 300;
      xpTimer = setTimeout(() => {
        showXpToast.value = true;
        xpTimer = setTimeout(() => { showXpToast.value = false; }, 3500);
      }, delay);
    }

    walletStore.fetchWallets();
    profileStore.fetchProfile();

    // Check for level-up / achievement popups
    handlePostSpinNotifications(data);
  } catch {
    // error handled by store
  } finally {
    gameStore.setSpinning(false);
    slotApp?.setSpinButtonState(true);
  }
}

async function runAutoSpin() {
  const count = gameStore.selectedSpins;
  const bet = gameStore.selectedBet;

  isAutoSpinning = true;
  autoStopRequested = false;
  showAutoSummary.value = false;
  slotApp.showAutoProgress(0, count);

  const summary = { count: 0, totalBet: 0, totalWon: 0, net: 0, wins: 0, biggestWin: 0, xpEarned: 0 };

  for (let i = 0; i < count; i++) {
    if (autoStopRequested) break;

    const currentBal = gameStore.balance || walletStore.chipsBalance;
    if (currentBal < bet) break;

    slotApp.showAutoProgress(i + 1, count);

    try {
      slotApp.hideWins();
      slotApp.setSpinButtonState(false);

      const data = await gameStore.doSpin();
      await slotApp.animateSpin(data.grid);

      summary.count++;
      summary.totalBet += bet;
      summary.totalWon += data.totalWin;
      summary.xpEarned += data.xpEarned || 0;

      if (data.totalWin > 0) {
        summary.wins++;
        if (data.totalWin > summary.biggestWin) summary.biggestWin = data.totalWin;
        slotApp.showWins(data.wins, data.totalWin);
        await delay(1200);
        slotApp.hideWins();
      } else {
        await delay(400);
      }

      slotApp.setBalance(data.balance);
    } catch {
      break;
    } finally {
      gameStore.setSpinning(false);
    }
  }

  summary.net = summary.totalWon - summary.totalBet;
  autoSummary.value = summary;
  isAutoSpinning = false;
  slotApp?.hideAutoProgress();
  slotApp?.setSpinButtonState(true);

  if (summary.count > 0) {
    showAutoSummary.value = true;
  }

  walletStore.fetchWallets();
  profileStore.fetchProfile();

  // Check for level-up / achievement popups (after auto-spin summary closes)
  // We use the last spin's data for level up check
  const lastSpinData = { levelUp: gameStore.levelUp };
  handlePostSpinNotifications(lastSpinData);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
</script>

<style scoped>
.slot-machine {
  max-width: 820px;
  margin: 0 auto;
  user-select: none;
}

.canvas-wrap {
  width: 100%;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

/* Mobile: fill full viewport, center game vertically */
@media (max-width: 600px) {
  .slot-machine {
    max-width: 100%;
    margin: 0;
    padding: 0;
    min-height: calc(100vh - 56px);
    min-height: calc(100dvh - 56px);
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0a0604;
    overflow: hidden;
  }

  .canvas-wrap {
    max-width: 100%;
    width: 100%;
    margin: 0;
    flex-shrink: 0;
  }
}

/* ── XP Toast (overlays bottom of canvas) ── */
.xp-toast {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  background: rgba(10, 6, 4, 0.88);
  border: 1px solid rgba(212, 160, 32, 0.35);
  backdrop-filter: blur(6px);
  animation: xpFadeIn 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

.xp-toast--levelup {
  background: linear-gradient(135deg, rgba(10, 6, 4, 0.92), rgba(30, 20, 6, 0.9));
  border-color: var(--color-gold);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.15);
}

.xp-toast-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-gold);
}

.xp-toast-level {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
}

@keyframes xpFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Error / Feature ── */
.error-bar {
  text-align: center;
  color: var(--color-error);
  font-size: 0.82rem;
  margin: 0.5rem 0 0;
  padding: 0.45rem;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 6px;
}

.feature-bar {
  text-align: center;
  margin-top: 0.6rem;
  padding: 0.6rem;
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.12), rgba(100, 150, 255, 0.08));
  border: 1px solid rgba(100, 200, 255, 0.25);
  border-radius: 8px;
  color: #7dd3fc;
  font-weight: 600;
  font-size: 0.85rem;
}

.soon {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-top: 0.15rem;
}

/* ── Auto-spin summary (premium redesign) ── */
.asr-header-text {
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

/* Hero section */
.asr-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 0 0.75rem;
  position: relative;
  overflow: hidden;
}

.asr-hero-glow {
  position: absolute;
  top: -20px;
  width: 200px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(212, 160, 32, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.asr-trophy {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
  animation: trophyPulse 2s ease-in-out infinite;
}

@keyframes trophyPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3)); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(255, 215, 0, 0.5)); }
}

.asr-hero-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: 0.2rem;
}

.asr-hero-amount {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--color-gold);
  text-shadow: 0 0 24px rgba(212, 160, 32, 0.25);
  line-height: 1.1;
  animation: amountFadeIn 0.6s ease;
}

.asr-hero-amount--zero {
  color: var(--color-text-muted);
  text-shadow: none;
}

.asr-hero-chip {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  margin-left: 0.25rem;
}

@keyframes amountFadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Net result badge */
.asr-net {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.5rem auto 0.75rem;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  width: fit-content;
}

.asr-net-icon {
  width: 14px;
  height: 14px;
}

.asr-net--profit {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.asr-net--loss {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Stats rows */
.asr-stats {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.asr-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
}

.asr-row-icon {
  font-size: 1.05rem;
  width: 1.4rem;
  text-align: center;
  flex-shrink: 0;
}

.asr-row-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex: 1;
}

.asr-row-val {
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--color-text);
}

.asr-row-val--gold { color: var(--color-gold); }
.asr-row-val--xp { color: #a78bfa; }

/* Claim button */
.asr-claim-btn {
  font-weight: 800;
  letter-spacing: 0.06em;
}

.asr-claim-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.3rem;
}

/* ── Paytable (temporary, redesign later) ── */
.pt-toggle {
  display: block;
  margin: 0.75rem auto 0;
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pt-toggle-icon {
  width: 14px;
  height: 14px;
}

.pt-toggle:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* ═══════════════════════════════════
   Level Up Modal
   ═══════════════════════════════════ */
.lvl-modal {
  text-align: center;
  padding: 0.5rem 0;
  position: relative;
}

.lvl-glow {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: lvl-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes lvl-pulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
}

.lvl-badge {
  position: relative;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.lvl-star {
  width: 80px;
  height: 80px;
  animation: lvl-spin 0.8s ease-out;
}

@keyframes lvl-spin {
  0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.lvl-number {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: #1a0f0a;
  font-weight: 800;
}

.lvl-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
  margin: 0 0 0.2rem;
}

.lvl-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
}

.lvl-reward {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 0.5rem 1.2rem;
  background: rgba(212, 160, 32, 0.1);
  border: 1px solid rgba(212, 160, 32, 0.25);
  border-radius: 20px;
  margin-bottom: 1rem;
}

.lvl-reward-amount {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-gold);
}

.lvl-reward-chip {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ═══════════════════════════════════
   Achievement Unlocked Modal
   ═══════════════════════════════════ */
.ach-modal {
  text-align: center;
  padding: 0.5rem 0;
  position: relative;
}

.ach-glow {
  position: absolute;
  top: -10px; left: 50%;
  transform: translateX(-50%);
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: ach-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ach-pulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

.ach-icon-wrap {
  margin-bottom: 0.5rem;
}

.ach-icon {
  width: 64px;
  height: 64px;
  animation: ach-pop 0.5s ease-out;
}

@keyframes ach-pop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.ach-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: #4ade80;
  margin: 0 0 0.4rem;
}

.ach-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.2rem;
}

.ach-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
}

.ach-rewards {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.ach-reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.4rem 1rem;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
}

.ach-reward-val {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: #4ade80;
}

.ach-reward-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 700;
}

.ach-claim-hint {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin: 0.5rem 0 0.75rem;
  font-style: italic;
}
</style>
