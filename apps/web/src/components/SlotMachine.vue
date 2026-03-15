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
      </div>

      <button
        class="spin-btn"
        :class="{ pulsing: isLocked }"
        :disabled="isLocked || insufficientBalance"
        @click="handleSpin"
      >
        <span v-if="!isLocked">SPIN</span>
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
import BaseButton from "./ui/BaseButton.vue";
import BadgePill from "./ui/BadgePill.vue";

const props = defineProps({ game: { type: Object, required: true } });
defineEmits(["back"]);

const gameStore = useGameStore();
const walletStore = useWalletStore();

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
let winTimer = null;

// ── Derived ──
const isLocked = computed(() => gameStore.spinning);
const displayBalance = computed(() => gameStore.balance || walletStore.chipsBalance);
const insufficientBalance = computed(() => displayBalance.value < (gameStore.selectedBet || 0));

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

async function handleSpin() {
  if (isLocked.value) return;

  // Reset win display
  showWin.value = false;
  animatedWin.value = 0;
  clearInterval(winTimer);

  // 1. Build new strips with random padding (result will be filled after API call)
  //    For now use random placeholder for result area too
  const tempStrips = [];
  for (let r = 0; r < props.game.reels; r++) {
    const padding = Array.from({ length: paddingCount }, () => randomSymbolId());
    const placeholder = Array.from({ length: props.game.rows }, () => randomSymbolId());
    tempStrips.push([...padding, ...placeholder]);
  }
  strips.value = tempStrips;

  // 2. Jump to top of strip instantly (no transition)
  stripStyles.value = Array.from({ length: props.game.reels }, () => ({
    transform: "translateY(0)",
    transition: "none",
  }));
  await nextTick();

  // Force reflow so the browser registers the instant jump
  if (reelsFrameRef.value) reelsFrameRef.value.offsetHeight;

  // 3. Make API call
  try {
    const data = await gameStore.doSpin();

    // 4. Fill in actual result symbols at the end of each strip
    for (let r = 0; r < props.game.reels; r++) {
      for (let row = 0; row < props.game.rows; row++) {
        strips.value[r][paddingCount + row] = data.grid[r][row];
      }
    }

    // 5. Animate each reel: transition from top to final position (staggered)
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

    // 6. Wait for last reel to finish
    const totalDuration = (0.8 + (props.game.reels - 1) * 0.35) * 1000 + 120;
    await delay(totalDuration);

    // 7. Show wins
    if (gameStore.totalWin > 0) {
      showWin.value = true;
      animateWinAmount(gameStore.totalWin);
    }

    walletStore.fetchWallets();
  } catch {
    // Error handled by store
  } finally {
    gameStore.setSpinning(false);
  }
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

onUnmounted(() => clearInterval(winTimer));
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
