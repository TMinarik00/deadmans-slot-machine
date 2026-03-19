<!--
  Withdraw modal - user enters CHIPS amount, picks card or crypto,
  fills simulated destination details, then CHIPS are debited.
  No real payment data is collected or sent anywhere.
-->
<template>
  <BaseModal :center="step !== 'form'" @close="$emit('close')">
    <template #header>
      {{ step === 'form' ? 'Withdraw CHIPS' : step === 'processing' ? 'Processing...' : 'Withdrawal Complete' }}
    </template>

    <!-- KYC gate -->
    <template v-if="!isKycVerified">
      <div class="kyc-gate">
        <svg viewBox="0 0 48 48" fill="currentColor" class="kyc-gate-icon"><path fill-rule="evenodd" d="M24 4L4 14v10c0 11 8.5 21.3 20 24 11.5-2.7 20-13 20-24V14L24 4zm-4 32l-10-10 2.83-2.83L20 30.34l15.17-15.17L38 18 20 36z"/></svg>
        <h3 class="kyc-gate-title">KYC Required</h3>
        <p class="kyc-gate-desc">You need to verify your identity before making withdrawals. This is required by gaming regulations.</p>
        <button class="kyc-gate-btn" @click="goToProfile">Go to Profile &rarr; Verify</button>
      </div>
    </template>

    <!-- Step 1: Amount + method + details -->
    <template v-else-if="step === 'form'">
      <!-- Amount -->
      <div class="field">
        <label class="field-label">Amount (CHIPS)</label>
        <input v-model.number="amount" type="number" min="1" step="1" class="input input--lg" placeholder="1000" />
        <span class="balance-hint">Available: {{ walletStore.chipsBalance.toLocaleString() }} CHIPS</span>
      </div>

      <!-- Method tabs -->
      <div class="method-tabs">
        <button class="method-tab" :class="{ 'method-tab--active': method === 'card' }" @click="method = 'card'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 14h4" />
          </svg>
          Bank
        </button>
        <button class="method-tab" :class="{ 'method-tab--active': method === 'crypto' }" @click="method = 'crypto'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 8h4.5a2.5 2.5 0 010 5H9V8z" /><path d="M9 13h5a2.5 2.5 0 010 5H9v-5z" />
            <path d="M11 6v2m2-2v2m-2 10v2m2-2v2" />
          </svg>
          Crypto
        </button>
      </div>

      <!-- Bank form -->
      <div v-if="method === 'card'" class="payment-details">
        <div class="field">
          <label class="field-label">Account Holder Name</label>
          <input v-model="bankForm.name" type="text" class="input" placeholder="John Doe" required autocomplete="off" />
        </div>
        <div class="field">
          <label class="field-label">Bank Name</label>
          <input v-model="bankForm.bank" type="text" class="input" placeholder="e.g. Chase, Revolut, Barclays" required autocomplete="off" />
        </div>
        <div class="field">
          <label class="field-label">IBAN / Account Number</label>
          <input v-model="bankForm.iban" type="text" class="input input--mono" placeholder="GB29 NWBK 6016 1331 9268 19" required autocomplete="off" />
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field-label">SWIFT / BIC</label>
            <input v-model="bankForm.swift" type="text" class="input input--mono" placeholder="NWBKGB2L" autocomplete="off" />
          </div>
          <div class="field">
            <label class="field-label">Routing Number</label>
            <input v-model="bankForm.routing" type="text" class="input input--mono" placeholder="021000021" autocomplete="off" />
          </div>
        </div>
        <div class="info-note">Estimated arrival: 1-3 business days</div>
      </div>

      <!-- Crypto form -->
      <div v-else class="payment-details">
        <div class="crypto-select">
          <label class="field-label">Cryptocurrency</label>
          <div class="crypto-grid">
            <button v-for="c in cryptos" :key="c.code" class="crypto-chip"
              :class="{ 'crypto-chip--active': cryptoCoin === c.code }" @click="cryptoCoin = c.code">
              <span class="crypto-symbol">{{ c.symbol }}</span>
              <span class="crypto-name">{{ c.code }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Your {{ cryptoCoin }} Wallet Address</label>
          <input v-model="cryptoAddress" type="text" class="input input--mono"
            :placeholder="placeholders[cryptoCoin]" required autocomplete="off" />
        </div>

        <div class="field">
          <label class="field-label">Network</label>
          <select v-model="cryptoNetwork" class="input">
            <option v-for="n in networks[cryptoCoin]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="security-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Double-check the address and network. Withdrawals to wrong addresses cannot be reversed.</span>
        </div>
      </div>

      <BaseButton block variant="danger" :disabled="!amount || amount <= 0 || amount > walletStore.chipsBalance" @click="processWithdraw">
        Confirm Withdrawal
      </BaseButton>
    </template>

    <!-- Step 2: Processing -->
    <template v-else-if="step === 'processing'">
      <div class="spinner"></div>
      <p class="processing-text">{{ processingText }}</p>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: progress + '%' }"></div></div>
    </template>

    <!-- Step 3: Success -->
    <template v-else-if="step === 'success'">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" /></svg>
      </div>
      <h3 class="success-title">Withdrawal Initiated</h3>
      <p class="success-amount">-{{ amount?.toLocaleString() }} CHIPS</p>
      <p class="success-detail">
        {{ method === 'card' ? 'Funds will arrive in 1-3 business days' : `Sending to your ${cryptoCoin} wallet` }}
      </p>
      <div v-if="method === 'crypto'" class="tx-id">
        <span class="tx-id-label">TX ID:</span>
        <code class="tx-id-value">{{ fakeTxId }}</code>
      </div>
      <BaseButton block @click="$emit('close')">Done</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useWalletStore } from "../stores/wallet.js";
import { useProfileStore } from "../stores/profile.js";
import BaseModal from "./ui/BaseModal.vue";
import BaseButton from "./ui/BaseButton.vue";

const emit = defineEmits(["close", "withdrawn"]);
const router = useRouter();
const walletStore = useWalletStore();
const profileStore = useProfileStore();

const isKycVerified = computed(() => profileStore.kycStatus === "VERIFIED");

function goToProfile() {
  emit("close");
  router.push("/app/profile");
}

const cryptos = [
  { code: "BTC", symbol: "\u20BF" }, { code: "ETH", symbol: "\u039E" }, { code: "SOL", symbol: "S" },
  { code: "ADA", symbol: "\u20B3" }, { code: "LTC", symbol: "\u0141" }, { code: "DOGE", symbol: "D" },
];

const placeholders = { BTC: "bc1q...", ETH: "0x...", SOL: "So1...", ADA: "addr1...", LTC: "ltc1...", DOGE: "D..." };
const networks = {
  BTC: ["Bitcoin Mainnet", "Lightning Network"], ETH: ["Ethereum Mainnet (ERC-20)", "Arbitrum One", "Optimism"],
  SOL: ["Solana Mainnet"], ADA: ["Cardano Mainnet"], LTC: ["Litecoin Mainnet"], DOGE: ["Dogecoin Mainnet"],
};

const step = ref("form");
const method = ref("card");
const amount = ref(null);
const progress = ref(0);
const processingText = ref("");

const bankForm = ref({ name: "", bank: "", iban: "", swift: "", routing: "" });
const cryptoCoin = ref("BTC");
const cryptoAddress = ref("");
const cryptoNetwork = ref("Bitcoin Mainnet");

const fakeTxId = computed(() => {
  const c = "abcdef0123456789";
  let id = "0x";
  for (let i = 0; i < 64; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
});

async function processWithdraw() {
  step.value = "processing";
  progress.value = 0;
  const steps = method.value === "card"
    ? ["Verifying account details...", "Initiating bank transfer...", "Debiting your wallet...", "Confirming withdrawal..."]
    : ["Validating wallet address...", "Building transaction...", "Broadcasting to network...", "Debiting your wallet..."];
  for (let i = 0; i < steps.length; i++) {
    processingText.value = steps[i];
    progress.value = ((i + 1) / steps.length) * 80;
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
  }
  try {
    await walletStore.withdraw("CHIPS", amount.value);
    progress.value = 100;
    await new Promise((r) => setTimeout(r, 400));
    step.value = "success";
    emit("withdrawn");
  } catch {
    step.value = "form";
  }
}
</script>

<style scoped>
/* Fields */
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label { font-size: 0.78rem; color: var(--color-text-muted); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.balance-hint { font-size: 0.78rem; color: var(--color-text-muted); }

.input {
  width: 100%; padding: 0.6rem 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: 8px; color: var(--color-text); font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus { outline: none; border-color: var(--color-gold); box-shadow: 0 0 0 2px rgba(212, 160, 32, 0.1); }
.input--lg { font-size: 1.4rem; font-weight: 700; text-align: center; padding: 0.7rem; }
.input--mono { font-family: "Courier New", monospace; letter-spacing: 0.05em; }

/* Method tabs */
.method-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.method-tab {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem;
  background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 10px;
  color: var(--color-text-muted); font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
}
.method-tab:hover { border-color: var(--color-gold); color: var(--color-text); }
.method-tab--active { border-color: var(--color-gold); background: rgba(212,160,32,0.1); color: var(--color-gold); font-weight: 600; }

.payment-details { display: flex; flex-direction: column; gap: 0.9rem; }
.info-note { font-size: 0.78rem; color: var(--color-text-muted); text-align: center; }

/* Crypto */
.crypto-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.3rem; }
.crypto-chip {
  display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.6rem 0.4rem;
  background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 10px; cursor: pointer; transition: all 0.2s;
}
.crypto-chip:hover { border-color: var(--color-gold); }
.crypto-chip--active { border-color: var(--color-gold); background: rgba(212,160,32,0.1); }
.crypto-symbol { font-size: 1.1rem; color: var(--color-gold); }
.crypto-name { font-size: 0.65rem; color: var(--color-text-muted); font-weight: 600; }

.security-warning {
  display: flex; align-items: flex-start; gap: 0.5rem; background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2); border-radius: 8px; padding: 0.65rem;
  font-size: 0.76rem; color: var(--color-error); line-height: 1.4;
}
.security-warning svg { flex-shrink: 0; margin-top: 1px; }

/* Processing */
.spinner { width: 48px; height: 48px; border: 3px solid var(--color-border); border-top-color: var(--color-gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.processing-text { color: var(--color-text-muted); font-size: 0.9rem; margin: 0; }
.progress-bar { width: 100%; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-gold); border-radius: 2px; transition: width 0.4s ease; }

/* Success */
.success-icon { color: var(--color-success); }
.success-title { font-family: var(--font-display); color: var(--color-gold); margin: 0; font-size: 1.3rem; }
.success-amount { font-size: 2rem; font-weight: 700; color: var(--color-error); margin: 0; }
.success-detail { color: var(--color-text-muted); font-size: 0.85rem; margin: 0; }
.tx-id { display: flex; align-items: center; gap: 0.5rem; background: var(--color-bg); border-radius: 8px; padding: 0.5rem 0.75rem; width: 100%; }
.tx-id-label { font-size: 0.72rem; color: var(--color-text-muted); flex-shrink: 0; }
.tx-id-value { font-family: "Courier New", monospace; font-size: 0.6rem; color: var(--color-text); word-break: break-all; }

/* Responsive */
@media (max-width: 480px) {
  .crypto-grid { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .field-row { grid-template-columns: 1fr 1fr; }
}

/* KYC gate */
.kyc-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  gap: 0.75rem;
}
.kyc-gate-icon { width: 56px; height: 56px; color: var(--color-gold); opacity: 0.6; }
.kyc-gate-title { font-family: var(--font-display); color: var(--color-gold); margin: 0; font-size: 1.2rem; }
.kyc-gate-desc { font-size: 0.85rem; color: var(--color-text-muted); margin: 0; line-height: 1.5; max-width: 280px; }
.kyc-gate-btn {
  width: 100%; padding: 0.7rem; border-radius: 10px; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; background: linear-gradient(135deg, #d4a020, #b8860b);
  border: 1px solid var(--color-gold); color: #1a0f0a; transition: all 0.2s; margin-top: 0.5rem;
}
.kyc-gate-btn:hover { box-shadow: 0 2px 12px rgba(212, 160, 32, 0.3); transform: translateY(-1px); }
</style>
