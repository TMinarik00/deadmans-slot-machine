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

    <!-- Paytable toggle (old-style, redesign later) -->
    <button class="pt-toggle" @click="showPaytable = !showPaytable">
      {{ showPaytable ? 'Hide' : 'Show' }} Paytable
    </button>

    <div v-if="showPaytable" class="paytable">
      <h3 class="pt-title">Paytable</h3>
      <div class="pt-list">
        <div v-for="sym in game.symbols" :key="sym.id" class="pt-row">
          <span class="pt-emoji">{{ sym.emoji }}</span>
          <span class="pt-name">{{ sym.name }}</span>
          <BadgePill :variant="sym.type === 'wild' ? 'gold' : sym.type === 'scatter' ? 'info' : 'default'" class="pt-type">{{ sym.type }}</BadgePill>
          <div class="pt-pays">
            <template v-if="sym.payouts">
              <span v-for="(v, k) in sym.payouts" :key="k" class="pt-pay">&times;{{ k }}: {{ v }}</span>
            </template>
            <template v-if="sym.scatterPayouts">
              <span v-for="(v, k) in sym.scatterPayouts" :key="k" class="pt-pay scatter">&times;{{ k }}: {{ v }}&times;</span>
            </template>
          </div>
        </div>
      </div>
    </div>
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
import BadgePill from "./ui/BadgePill.vue";

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
const autoSummary = ref({ count: 0, totalBet: 0, totalWon: 0, net: 0, wins: 0, biggestWin: 0, xpEarned: 0 });
let xpTimer = null;
let autoStopRequested = false;
let isAutoSpinning = false;

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
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.2s;
}
.pt-toggle:hover { border-color: var(--color-gold); color: var(--color-gold); }

.paytable {
  margin-top: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem;
}

.pt-title {
  font-family: var(--font-display);
  color: var(--color-gold);
  text-align: center;
  margin: 0 0 0.6rem;
  font-size: 1rem;
}

.pt-list { display: flex; flex-direction: column; gap: 0.3rem; }

.pt-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.4rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.pt-emoji { font-size: 1.25rem; width: 1.8rem; text-align: center; flex-shrink: 0; }
.pt-name { font-size: 0.75rem; color: var(--color-text); min-width: 70px; }
.pt-type { flex-shrink: 0; }

.pt-pays { display: flex; gap: 0.3rem; margin-left: auto; flex-wrap: wrap; justify-content: flex-end; }

.pt-pay {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.12rem 0.3rem;
  border-radius: 3px;
}
.pt-pay.scatter { color: #7dd3fc; }
</style>
