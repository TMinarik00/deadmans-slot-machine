<!--
  PaytableModal - Premium game paytable popup.
  Shows symbol SVGs, payouts, and game info in a beautiful modal.
-->
<template>
  <BaseModal @close="$emit('close')" size="md" center>
    <template #header>
      <div class="pt-modal-header">
        <svg class="pt-modal-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
        </svg>
        <span>{{ game.name }}</span>
      </div>
    </template>

    <!-- Game info bar -->
    <div class="pt-info-bar">
      <div class="pt-info-chip">{{ game.reels }} Reels</div>
      <div class="pt-info-chip">{{ game.rows }} Rows</div>
      <div class="pt-info-chip pt-info-chip--accent">{{ game.ways?.toLocaleString() }} Ways</div>
    </div>

    <!-- Special symbols (Wild + Scatter) -->
    <div class="pt-section-label">Special Symbols</div>
    <div class="pt-specials">
      <div
        v-for="sym in specialSymbols"
        :key="sym.id"
        class="pt-special-card"
        :class="`pt-special-card--${sym.type}`"
      >
        <div v-if="getSymbolSvg(sym.id)" class="pt-special-svg" v-html="getSymbolSvg(sym.id)"></div>
        <span v-else class="pt-special-emoji">{{ sym.emoji }}</span>
        <div class="pt-special-info">
          <span class="pt-special-name">{{ sym.name }}</span>
          <span class="pt-special-type">{{ sym.type.toUpperCase() }}</span>
        </div>
        <div class="pt-special-pays" v-if="sym.payouts || sym.scatterPayouts">
          <span
            v-for="(val, count) in (sym.payouts || sym.scatterPayouts)"
            :key="count"
            class="pt-pay-chip"
          >
            ×{{ count }}: {{ val }}{{ sym.scatterPayouts ? '×' : '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Regular symbols -->
    <div class="pt-section-label">Symbols &amp; Payouts</div>
    <div class="pt-regulars">
      <div
        v-for="sym in regularSymbols"
        :key="sym.id"
        class="pt-regular-row"
      >
        <div v-if="getSymbolSvg(sym.id)" class="pt-regular-svg" v-html="getSymbolSvg(sym.id)"></div>
        <span v-else class="pt-regular-emoji">{{ sym.emoji }}</span>
        <span class="pt-regular-name">{{ sym.name }}</span>
        <div class="pt-regular-pays">
          <span
            v-for="(val, count) in sym.payouts"
            :key="count"
            class="pt-pay-tag"
          >
            ×{{ count }}: {{ val }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bet info -->
    <div class="pt-footer">
      <div class="pt-footer-item">
        <span class="pt-footer-label">Min Bet</span>
        <span class="pt-footer-val">{{ game.betOptions?.[0] || 10 }}</span>
      </div>
      <div class="pt-footer-item">
        <span class="pt-footer-label">Max Bet</span>
        <span class="pt-footer-val">{{ game.betOptions?.[game.betOptions.length - 1] || 500 }}</span>
      </div>
      <div class="pt-footer-item">
        <span class="pt-footer-label">RTP</span>
        <span class="pt-footer-val">~96%</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from "vue";
import BaseModal from "./ui/BaseModal.vue";
import { SYMBOL_SVGS, GAME_SYMBOL_MAP } from "../pixi/symbols.js";

const props = defineProps({
  game: { type: Object, required: true },
});

defineEmits(["close"]);

const specialSymbols = computed(() =>
  (props.game.symbols || []).filter(
    (s) => s.type === "wild" || s.type === "scatter"
  )
);

const regularSymbols = computed(() =>
  (props.game.symbols || []).filter(
    (s) => s.type !== "wild" && s.type !== "scatter"
  )
);

function getSymbolSvg(symbolId) {
  const map = GAME_SYMBOL_MAP[props.game.id];
  if (!map) return "";
  const svgKey = map[symbolId];
  return svgKey && SYMBOL_SVGS[svgKey] ? SYMBOL_SVGS[svgKey] : "";
}
</script>

<style scoped>
/* Header */
.pt-modal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
}

.pt-modal-icon {
  width: 18px;
  height: 18px;
  color: var(--color-gold);
}

/* Game info bar */
.pt-info-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.pt-info-chip {
  padding: 0.3rem 0.65rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(139, 105, 20, 0.15);
  border-radius: 20px;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.pt-info-chip--accent {
  background: rgba(212, 160, 32, 0.1);
  border-color: rgba(212, 160, 32, 0.25);
  color: var(--color-gold);
}

/* Section labels */
.pt-section-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.12);
}

/* Special symbols - card layout */
.pt-specials {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.pt-special-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(139, 105, 20, 0.15);
  border-radius: 10px;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.pt-special-card--wild {
  border-color: rgba(212, 160, 32, 0.3);
  background: rgba(212, 160, 32, 0.06);
}

.pt-special-card--scatter {
  border-color: rgba(125, 211, 252, 0.25);
  background: rgba(125, 211, 252, 0.04);
}

.pt-special-svg {
  width: 48px;
  height: 48px;
}

.pt-special-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.pt-special-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.pt-special-name {
  font-size: 0.82rem;
  color: var(--color-text);
  font-weight: 600;
}

.pt-special-type {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.pt-special-card--wild .pt-special-type {
  color: var(--color-gold);
}

.pt-special-card--scatter .pt-special-type {
  color: #7dd3fc;
}

.pt-special-pays {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Regular symbols - row layout */
.pt-regulars {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.pt-regular-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  background: rgba(0, 0, 0, 0.15);
}

.pt-regular-svg {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.pt-regular-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.pt-regular-name {
  font-size: 0.8rem;
  color: var(--color-text);
  flex: 1;
  min-width: 60px;
}

.pt-regular-pays {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pt-pay-chip,
.pt-pay-tag {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.pt-pay-chip {
  background: rgba(212, 160, 32, 0.1);
  color: var(--color-gold);
  border: 1px solid rgba(212, 160, 32, 0.15);
}

/* Footer game info */
.pt-footer {
  display: flex;
  gap: 0.5rem;
}

.pt-footer-item {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.pt-footer-label {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.pt-footer-val {
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--color-gold);
}

/* Mobile */
@media (max-width: 600px) {
  .pt-specials {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .pt-special-svg {
    width: 40px;
    height: 40px;
  }

  .pt-regular-svg {
    width: 24px;
    height: 24px;
  }

  .pt-regular-row {
    padding: 0.35rem 0.5rem;
    gap: 0.4rem;
  }

  .pt-regular-name {
    font-size: 0.72rem;
    min-width: 50px;
  }

  .pt-pay-tag {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }
}

/* Emoji fallbacks */
.pt-special-emoji {
  font-size: 2rem;
  line-height: 1;
}

.pt-regular-emoji {
  font-size: 1.3rem;
  line-height: 1;
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}
</style>
