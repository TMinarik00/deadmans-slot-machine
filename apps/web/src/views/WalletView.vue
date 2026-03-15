<!--
  Wallet page - CHIPS balance, deposit/withdraw via modals, transaction history.
-->
<template>
  <div class="wallet-page">
    <h1 class="title">The Vault</h1>

    <!-- Balance card -->
    <div class="balance-card">
      <span class="balance-label">Your Balance</span>
      <span class="balance-value">{{ walletStore.chipsBalance.toLocaleString() }}</span>
      <span class="balance-unit">CHIPS</span>
      <div class="balance-actions">
        <button class="ba-btn ba-btn--deposit" @click="showDeposit = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M12 5v14m-7-7h14" /></svg>
          Deposit
        </button>
        <button class="ba-btn ba-btn--withdraw" @click="showWithdraw = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M5 12h14" /></svg>
          Withdraw
        </button>
      </div>
    </div>

    <!-- Success toast -->
    <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

    <!-- Transaction history -->
    <div class="tx-section">
      <h2 class="section-title">Recent Transactions</h2>
      <div v-if="walletStore.transactions.length === 0 && !walletStore.loading" class="empty-state">
        No transactions yet. Make a deposit to get started!
      </div>
      <div v-else class="tx-list">
        <div v-for="tx in walletStore.transactions" :key="tx.id" class="tx-row">
          <div class="tx-left">
            <span class="tx-type" :class="txClass(tx.type)">{{ formatType(tx.type) }}</span>
            <span class="tx-note">{{ tx.note }}</span>
          </div>
          <div class="tx-right">
            <span class="tx-amount" :class="{ 'tx-amount--pos': Number(tx.amount) > 0, 'tx-amount--neg': Number(tx.amount) < 0 }">
              {{ Number(tx.amount) > 0 ? '+' : '' }}{{ Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 0 }) }}
            </span>
            <span class="tx-date">{{ formatDate(tx.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DepositModal v-if="showDeposit" @close="showDeposit = false" @deposited="onDeposited" />
    <WithdrawModal v-if="showWithdraw" @close="showWithdraw = false" @withdrawn="onWithdrawn" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useWalletStore } from "../stores/wallet.js";
import DepositModal from "../components/DepositModal.vue";
import WithdrawModal from "../components/WithdrawModal.vue";

const walletStore = useWalletStore();
const showDeposit = ref(false);
const showWithdraw = ref(false);
const successMsg = ref("");

function formatType(type) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function txClass(type) {
  return (type === "DEPOSIT" || type === "WIN" || type === "CONVERSION_IN") ? "tx-type--credit" : "tx-type--debit";
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function showSuccess(msg) {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = ""; }, 3000);
}
function onDeposited() { showSuccess("Deposit successful!"); }
function onWithdrawn() { showSuccess("Withdrawal successful!"); }

onMounted(() => {
  walletStore.fetchWallets();
  walletStore.fetchTransactions();
});
</script>

<style scoped>
.wallet-page {
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

/* Balance card */
.balance-card {
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(212,160,32,0.08) 100%);
  border: 2px solid var(--color-gold);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.balance-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.balance-value {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--color-gold);
  line-height: 1.1;
}

.balance-unit {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.15em;
}

.balance-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  width: 100%;
  max-width: 320px;
}

.ba-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ba-btn--deposit {
  background: var(--color-gold);
  color: var(--color-bg);
}
.ba-btn--deposit:hover { opacity: 0.9; }

.ba-btn--withdraw {
  background: none;
  border: 2px solid var(--color-border);
  color: var(--color-text);
}
.ba-btn--withdraw:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.success-msg {
  color: var(--color-success);
  text-align: center;
  font-size: 0.9rem;
  margin: 0 0 1rem;
  padding: 0.6rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 8px;
}

/* Transactions */
.tx-section {
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-gold);
  margin: 0 0 0.75rem;
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tx-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  gap: 0.75rem;
}

.tx-left {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.tx-type {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tx-type--credit { color: var(--color-success); }
.tx-type--debit { color: var(--color-error); }

.tx-note {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
}

.tx-amount {
  font-weight: 700;
  font-size: 0.95rem;
}
.tx-amount--pos { color: var(--color-success); }
.tx-amount--neg { color: var(--color-error); }

.tx-date {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 600px) {
  .title { font-size: 1.7rem; margin-bottom: 1rem; }
  .balance-card { padding: 1.5rem 1rem; }
  .balance-value { font-size: 2.4rem; }
  .balance-actions { max-width: 100%; }
  .tx-row { padding: 0.65rem 0.75rem; }
  .tx-note { font-size: 0.75rem; }
}

@media (max-width: 380px) {
  .balance-value { font-size: 2rem; }
  .ba-btn { font-size: 0.85rem; padding: 0.6rem; }
}
</style>
