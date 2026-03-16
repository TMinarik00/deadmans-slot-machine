<!--
  Slot machine with professional reel animation.
  Reel strips scroll via CSS translateY with staggered stopping.
  Wins are shown by glowing the winning symbol cells (no SVG lines).
-->
<template>
  <div class="slot-machine">
    <!-- Header -->
    <div class="machine-header">
      <BaseButton variant="ghost" size="sm" @click="$emit('back')">&#8592; Lobby</BaseButton>
      <h2 class="machine-title">{{ game.name }}</h2>
      <BadgePill variant="gold">{{ game.ways.toLocaleString() }} ways</BadgePill>
    </div>

    <!-- Win banner -->
    <div class="win-banner" :class="{ active: showWin }">
      <span v-if="showWin" class="win-text">
        WIN <strong>{{ animatedWin.toLocaleString() }}</strong> CHIPS
      </span>
    </div>

    <!-- Auto-spin progress -->
    <div v-if="autoSpinning" class="auto-progress">
      <span class="auto-progress-text">Spin {{ autoSpinCurrent }} / {{ autoSpinTotal }}</span>
      <button class="auto-stop-btn" @click="stopAutoSpin">STOP</button>
    </div>

    <!-- Auto-spin summary popup -->
    <div v-if="showAutoSummary" class="auto-overlay" @click.self="showAutoSummary = false">
      <div class="auto-summary">
        <h3 class="auto-summary-title">Auto-Spin Complete</h3>
        <div class="auto-summary-grid">
          <div class="auto-stat">
            <span class="auto-stat-label">Spins</span>
            <span class="auto-stat-val">{{ autoSummary.count }}</span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">Total Bet</span>
            <span class="auto-stat-val">{{ autoSummary.totalBet.toLocaleString() }}</span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">Total Won</span>
            <span class="auto-stat-val auto-stat-val--gold">{{ autoSummary.totalWon.toLocaleString() }}</span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">Net Result</span>
            <span class="auto-stat-val" :class="autoSummary.net >= 0 ? 'auto-stat-val--gold' : 'auto-stat-val--red'">
              {{ autoSummary.net >= 0 ? '+' : '' }}{{ autoSummary.net.toLocaleString() }}
            </span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">Wins</span>
            <span class="auto-stat-val">{{ autoSummary.wins }} / {{ autoSummary.count }}</span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">Biggest Win</span>
            <span class="auto-stat-val auto-stat-val--gold">{{ autoSummary.biggestWin.toLocaleString() }}</span>
          </div>
          <div class="auto-stat">
            <span class="auto-stat-label">XP Earned</span>
            <span class="auto-stat-val">+{{ autoSummary.xpEarned }}</span>
          </div>
        </div>
        <button class="auto-close-btn" @click="showAutoSummary = false">Close</button>
      </div>
    </div>

    <!-- XP / Level-up toast -->
    <div v-if="showXpToast" class="xp-toast" :class="{ 'xp-toast--levelup': gameStore.levelUp }">
      <span class="xp-toast-text">+{{ gameStore.xpEarned }} XP</span>
      <span v-if="gameStore.levelUp" class="xp-toast-level">
        Level {{ gameStore.levelUp.newLevel }}! +{{ gameStore.levelUp.reward }} CHIPS
      </span>
    </div>

    <!-- Reel frame -->
    <div class="reels-frame" ref="reelsFrameRef">
      <div class="reels-grid" :style="{ '--cols': game.reels, '--rows': game.rows }">
        <div v-for="(_, reelIdx) in game.reels" :key="reelIdx" class="reel-col">
          <div class="reel-viewport" :style="{ height: game.rows * cellHeight + 'px' }">
            <div
              class="reel-strip"
              :style="stripStyles[reelIdx]"
            >
              <div
                v-for="(symId, i) in strips[reelIdx]"
                :key="i"
                class="sym-cell"
                :class="{
                  'sym-win': showWin && isWinPos(reelIdx, i - paddingCount),
                  'sym-scatter': showWin && isScatterPos(reelIdx, i - paddingCount),
                }"
                :style="{ height: cellHeight + 'px', fontSize: symFontSize + 'px' }"
              >
                {{ resolveEmoji(symId) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="ctrl-section">
        <span class="ctrl-label">BET</span>
        <div class="bet-row">
          <button
            v-for="opt in game.betOptions"
            :key="opt"
            class="bet-chip"
            :class="{ active: gameStore.selectedBet === opt }"
            :disabled="isLocked"
            @click="gameStore.setBet(opt)"
          >{{ opt }}</button>
        </div>
        <span class="ctrl-label">AUTO</span>
        <div class="bet-row">
          <button
            v-for="opt in spinOptions"
            :key="opt"
            class="bet-chip"
            :class="{ active: gameStore.selectedSpins === opt }"
            :disabled="isLocked"
            @click="gameStore.setSpins(opt)"
          >{{ opt === 1 ? '1x' : opt + 'x' }}</button>
        </div>
      </div>

      <button
        class="spin-btn"
        :class="{ pulsing: isLocked }"
        :disabled="isLocked || insufficientBalance"
        @click="onSpinClick"
      >
        <span v-if="!isLocked">{{ gameStore.selectedSpins > 1 ? `SPIN ${gameStore.selectedSpins}x` : 'SPIN' }}</span>
        <span v-else class="spin-dots">&#8226;&#8226;&#8226;</span>
      </button>

      <div class="ctrl-section ctrl-right">
        <span class="ctrl-label">BALANCE</span>
        <span class="balance-val">{{ displayBalance.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Error -->
    <p v-if="gameStore.error" class="error-bar">{{ gameStore.error }}</p>

    <!-- Feature teaser -->
    <div v-if="gameStore.lastFeature" class="feature-bar">
      {{ gameStore.lastFeature.message }} <span class="soon">Coming soon</span>
    </div>

    <!-- Paytable -->
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
import { ref, computed, nextTick, onUnmounted } from "vue";
import { useGameStore } from "../stores/game.js";
import { useWalletStore } from "../stores/wallet.js";
import { useProfileStore } from "../stores/profile.js";
import BaseButton from "./ui/BaseButton.vue";
import BadgePill from "./ui/BadgePill.vue";

const props = defineProps({ game: { type: Object, required: true } });
defineEmits(["back"]);

const gameStore = useGameStore();
const walletStore = useWalletStore();
const profileStore = useProfileStore();

// ── Layout constants ──
const cellHeight = computed(() => (props.game.rows <= 4 ? 76 : props.game.rows === 5 ? 64 : 56));
const symFontSize = computed(() => (props.game.rows <= 4 ? 32 : props.game.rows === 5 ? 26 : 22));
const paddingCount = 25; // random symbols above the result for scroll illusion

// ── Reel strips ──
// Each strip = [padding0..paddingN, result0..resultN]
// Final position (idle): translateY = -(paddingCount * cellHeight)px to show result
// Spin start: translateY = 0 (shows padding at top)
// Spin transition: animate from 0 to final position
const strips = ref(buildIdleStrips());
const stripStyles = ref(buildIdleStyles());
const reelsFrameRef = ref(null);

// ── Win state ──
const showWin = ref(false);
const animatedWin = ref(0);
const showPaytable = ref(false);
const showXpToast = ref(false);
let winTimer = null;
let xpToastTimer = null;

// ── Auto-spin state ──
const spinOptions = [1, 5, 10, 100];
const autoSpinning = ref(false);
const autoSpinCurrent = ref(0);
const autoSpinTotal = ref(0);
const showAutoSummary = ref(false);
const autoSummary = ref({ count: 0, totalBet: 0, totalWon: 0, net: 0, wins: 0, biggestWin: 0, xpEarned: 0 });
let autoStopRequested = false;

// ── Derived ──
const isLocked = computed(() => gameStore.spinning || autoSpinning.value);
const displayBalance = computed(() => gameStore.balance || walletStore.chipsBalance);
const insufficientBalance = computed(() => displayBalance.value < (gameStore.selectedBet || 0) * gameStore.selectedSpins);

// ── Helpers ──

function randomSymbolId() {
  const syms = props.game.symbols;
  return syms[Math.floor(Math.random() * syms.length)].id;
}

function buildIdleStrips() {
  // Before first spin: show placeholder strip with random symbols
  const result = [];
  for (let r = 0; r < props.game.reels; r++) {
    const padding = Array.from({ length: paddingCount }, () => randomSymbolId());
    const visible = Array.from({ length: props.game.rows }, () => randomSymbolId());
    result.push([...padding, ...visible]);
  }
  return result;
}

function buildIdleStyles() {
  // Position strip to show the last `rows` symbols (the result area)
  const offset = -(paddingCount * cellHeight.value);
  return Array.from({ length: props.game.reels }, () => ({
    transform: `translateY(${offset}px)`,
    transition: "none",
  }));
}

function resolveEmoji(symId) {
  if (gameStore.symbolMap[symId]) return gameStore.symbolMap[symId].emoji;
  const s = props.game.symbols.find((x) => x.id === symId);
  return s ? s.emoji : "?";
}

function isWinPos(reel, row) {
  if (row < 0 || row >= props.game.rows) return false;
  return gameStore.winPositions.has(`${reel}-${row}`);
}

function isScatterPos(reel, row) {
  if (row < 0 || row >= props.game.rows) return false;
  const sw = gameStore.wins.find((w) => w.isScatter);
  if (!sw) return false;
  return sw.positions.some(([r, ro]) => r === reel && ro === row);
}

// ── Spin flow ──

async function onSpinClick() {
  if (isLocked.value) return;
  if (gameStore.selectedSpins > 1) {
    handleAutoSpin();
    return;
  }

  // Single spin
  try {
    const data = await handleSpin();

    // Show wins
    if (data.totalWin > 0) {
      showWin.value = true;
      animateWinAmount(data.totalWin);
    }

    // XP toast
    if (data.xpEarned > 0) {
      xpToastTimer = setTimeout(() => {
        showXpToast.value = true;
        xpToastTimer = setTimeout(() => { showXpToast.value = false; }, 3500);
      }, data.totalWin > 0 ? 1200 : 300);
    }

    walletStore.fetchWallets();
    profileStore.fetchProfile();
  } catch {
    // Error handled by store
  } finally {
    gameStore.setSpinning(false);
  }
}

// Single spin with full animation
async function handleSpin() {
  // Reset win display
  showWin.value = false;
  showXpToast.value = false;
  animatedWin.value = 0;
  clearInterval(winTimer);
  clearTimeout(xpToastTimer);

  // 1. Build new strips with random padding
  const tempStrips = [];
  for (let r = 0; r < props.game.reels; r++) {
    const padding = Array.from({ length: paddingCount }, () => randomSymbolId());
    const placeholder = Array.from({ length: props.game.rows }, () => randomSymbolId());
    tempStrips.push([...padding, ...placeholder]);
  }
  strips.value = tempStrips;

  // 2. Jump to top of strip instantly
  stripStyles.value = Array.from({ length: props.game.reels }, () => ({
    transform: "translateY(0)",
    transition: "none",
  }));
  await nextTick();
  if (reelsFrameRef.value) reelsFrameRef.value.offsetHeight;

  // 3. Make API call
  const data = await gameStore.doSpin();

  // 4. Fill in actual result symbols
  for (let r = 0; r < props.game.reels; r++) {
    for (let row = 0; row < props.game.rows; row++) {
      strips.value[r][paddingCount + row] = data.grid[r][row];
    }
  }

  // 5. Animate reels (staggered)
  const finalOffset = -(paddingCount * cellHeight.value);
  const newStyles = [];
  for (let r = 0; r < props.game.reels; r++) {
    const duration = 0.8 + r * 0.35;
    newStyles.push({
      transform: `translateY(${finalOffset}px)`,
      transition: `transform ${duration}s cubic-bezier(0.2, 0.8, 0.3, 1.05)`,
    });
  }
  await nextTick();
  stripStyles.value = newStyles;

  // 6. Wait for last reel
  const totalDuration = (0.8 + (props.game.reels - 1) * 0.35) * 1000 + 120;
  await delay(totalDuration);

  // Return spin data for auto-spin tracking
  return data;
}

// Auto-spin: loop N individual spins with visual animation each time
async function handleAutoSpin() {
  const count = gameStore.selectedSpins;
  const bet = gameStore.selectedBet;

  autoSpinning.value = true;
  autoStopRequested = false;
  autoSpinCurrent.value = 0;
  autoSpinTotal.value = count;
  showAutoSummary.value = false;

  const summary = { count: 0, totalBet: 0, totalWon: 0, net: 0, wins: 0, biggestWin: 0, xpEarned: 0 };

  for (let i = 0; i < count; i++) {
    if (autoStopRequested) break;

    // Check balance before each spin
    const currentBal = gameStore.balance || walletStore.chipsBalance;
    if (currentBal < bet) break;

    autoSpinCurrent.value = i + 1;

    try {
      const data = await handleSpin();

      summary.count++;
      summary.totalBet += bet;
      summary.totalWon += data.totalWin;
      summary.xpEarned += data.xpEarned || 0;
      if (data.totalWin > 0) {
        summary.wins++;
        if (data.totalWin > summary.biggestWin) summary.biggestWin = data.totalWin;
      }

      // Brief win flash during auto-spin
      if (data.totalWin > 0) {
        showWin.value = true;
        animateWinAmount(data.totalWin);
        await delay(1200);
        showWin.value = false;
      } else {
        await delay(400);
      }
    } catch {
      break;
    } finally {
      gameStore.setSpinning(false);
    }
  }

  summary.net = summary.totalWon - summary.totalBet;
  autoSummary.value = summary;
  autoSpinning.value = false;
  showWin.value = false;

  // Show summary popup
  if (summary.count > 0) {
    showAutoSummary.value = true;
  }

  // Refresh wallet and profile
  walletStore.fetchWallets();
  profileStore.fetchProfile();
}

function stopAutoSpin() {
  autoStopRequested = true;
}

function animateWinAmount(target) {
  const steps = 18;
  const inc = target / steps;
  let cur = 0;
  let step = 0;
  clearInterval(winTimer);
  winTimer = setInterval(() => {
    step++;
    cur += inc;
    if (step >= steps) {
      animatedWin.value = target;
      clearInterval(winTimer);
    } else {
      animatedWin.value = Math.round(cur);
    }
  }, 45);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

onUnmounted(() => { clearInterval(winTimer); clearTimeout(xpToastTimer); });
</script>

<style scoped>
.slot-machine {
  max-width: 650px;
  margin: 0 auto;
  user-select: none;
}

/* ── Header ── */
.machine-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.machine-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-gold);
  margin: 0;
  text-align: center;
  flex: 1;
}

/* ── Win banner ── */
.win-banner {
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
  border-radius: 8px;
  overflow: hidden;
}

.win-banner.active {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.15), rgba(255, 215, 0, 0.1));
  border: 1px solid rgba(212, 160, 32, 0.35);
  animation: bannerPulse 1.5s ease-in-out infinite;
}

.win-text {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-gold);
  letter-spacing: 1px;
}

.win-text strong {
  font-size: 1.25rem;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

@keyframes bannerPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(212, 160, 32, 0.05); }
  50% { box-shadow: 0 0 20px rgba(212, 160, 32, 0.2); }
}

/* ── Reel frame ── */
.reels-frame {
  background: linear-gradient(180deg, #110a06, #1e120b, #110a06);
  border: 3px solid #8b6914;
  border-radius: 14px;
  padding: 8px;
  box-shadow:
    inset 0 2px 12px rgba(0, 0, 0, 0.6),
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(212, 160, 32, 0.15);
}

.reels-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: 3px;
}

.reel-col {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  overflow: hidden;
}

.reel-viewport {
  overflow: hidden;
  position: relative;
}

.reel-strip {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.sym-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s, box-shadow 0.3s;
}

/* ── Win highlights ── */
.sym-win {
  animation: cellGlow 0.7s ease-in-out infinite alternate;
}

.sym-scatter {
  animation: scatterGlow 0.5s ease-in-out infinite alternate;
}

@keyframes cellGlow {
  from {
    background: rgba(212, 160, 32, 0.1);
    box-shadow: inset 0 0 8px rgba(212, 160, 32, 0.15);
  }
  to {
    background: rgba(212, 160, 32, 0.3);
    box-shadow: inset 0 0 16px rgba(212, 160, 32, 0.45), 0 0 12px rgba(212, 160, 32, 0.25);
  }
}

@keyframes scatterGlow {
  from {
    background: rgba(100, 200, 255, 0.1);
    box-shadow: inset 0 0 8px rgba(100, 200, 255, 0.15);
  }
  to {
    background: rgba(100, 200, 255, 0.35);
    box-shadow: inset 0 0 16px rgba(100, 200, 255, 0.45), 0 0 12px rgba(100, 200, 255, 0.2);
  }
}

/* ── Controls ── */
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding: 0.6rem 0.7rem;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.ctrl-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ctrl-right { align-items: flex-end; }

.ctrl-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bet-row {
  display: flex;
  gap: 2px;
}

.bet-chip {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 600;
  transition: all 0.15s;
  min-width: 32px;
  text-align: center;
}

.bet-chip:hover:not(:disabled) {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.bet-chip.active {
  background: rgba(212, 160, 32, 0.2);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.bet-chip:disabled { opacity: 0.4; cursor: not-allowed; }

/* Spin button */
.spin-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--color-gold);
  background: linear-gradient(145deg, #d4a020, #7a5c10);
  color: #1a0f0a;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  box-shadow: 0 3px 12px rgba(212, 160, 32, 0.25);
}

.spin-btn:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow: 0 5px 20px rgba(212, 160, 32, 0.4);
}

.spin-btn:active:not(:disabled) { transform: scale(0.95); }

.spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spin-btn.pulsing {
  animation: spinPulse 0.7s ease-in-out infinite;
}

.spin-dots { letter-spacing: 3px; font-size: 1.3rem; }

@keyframes spinPulse {
  0%, 100% { box-shadow: 0 3px 12px rgba(212, 160, 32, 0.25); }
  50% { box-shadow: 0 3px 25px rgba(212, 160, 32, 0.5); }
}

.balance-val {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-gold);
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

/* ── XP Toast ── */
.xp-toast {
  text-align: center;
  padding: 0.45rem 0.75rem;
  margin-bottom: 0.4rem;
  border-radius: 8px;
  background: rgba(212, 160, 32, 0.08);
  border: 1px solid rgba(212, 160, 32, 0.2);
  animation: xpFadeIn 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.xp-toast--levelup {
  background: linear-gradient(135deg, rgba(212, 160, 32, 0.15), rgba(255, 215, 0, 0.1));
  border-color: var(--color-gold);
  animation: xpFadeIn 0.4s ease, bannerPulse 1.5s ease-in-out infinite;
}

.xp-toast-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-gold);
}

.xp-toast-level {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
}

@keyframes xpFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Auto-spin progress ── */
.auto-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem;
  margin-bottom: 0.4rem;
  border-radius: 8px;
  background: rgba(212, 160, 32, 0.1);
  border: 1px solid rgba(212, 160, 32, 0.25);
}

.auto-progress-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-gold);
}

.auto-stop-btn {
  background: none;
  border: 1px solid var(--color-error);
  color: var(--color-error);
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 0.15s;
}
.auto-stop-btn:hover {
  background: rgba(248, 113, 113, 0.15);
}

/* ── Auto-spin summary popup ── */
.auto-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.auto-summary {
  background: var(--color-surface);
  border: 2px solid var(--color-gold);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 360px;
  width: 90%;
  animation: popIn 0.3s ease;
}

.auto-summary-title {
  font-family: var(--font-display);
  color: var(--color-gold);
  text-align: center;
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

.auto-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.auto-stat {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 0.6rem;
  text-align: center;
}

.auto-stat-label {
  display: block;
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
}

.auto-stat-val {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-text);
}

.auto-stat-val--gold { color: var(--color-gold); }
.auto-stat-val--red { color: var(--color-error); }

.auto-close-btn {
  display: block;
  width: 100%;
  padding: 0.6rem;
  border-radius: 10px;
  border: 2px solid var(--color-gold);
  background: linear-gradient(135deg, #d4a020, #b8860b);
  color: #1a0f0a;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}
.auto-close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(212, 160, 32, 0.35);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* ── Paytable ── */
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

/* ── Responsive ── */
@media (max-width: 600px) {
  .machine-title { font-size: 1.1rem; }
  .reels-frame { padding: 5px; border-radius: 10px; border-width: 2px; }
  .reels-grid { gap: 2px; }

  .controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .spin-btn {
    width: 100%;
    height: 46px;
    border-radius: 10px;
    font-size: 1rem;
    order: -1;
  }

  .ctrl-section { flex-direction: row; align-items: center; gap: 0.5rem; }
  .ctrl-right { flex-direction: row; }
  .balance-val { font-size: 0.95rem; }
  .bet-chip { padding: 0.2rem 0.35rem; font-size: 0.65rem; min-width: 28px; }
}

@media (max-width: 380px) {
  .machine-header { flex-wrap: wrap; gap: 0.2rem; }
  .machine-title { font-size: 0.95rem; }
  .bet-chip { min-width: 24px; padding: 0.18rem 0.25rem; font-size: 0.6rem; }
}
</style>
