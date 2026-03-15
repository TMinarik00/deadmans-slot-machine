<!--
  Deposit modal - user enters CHIPS amount, picks card or crypto,
  fills simulated payment details, then CHIPS are credited.
  No real payment data is collected or sent anywhere.
-->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            {{ step === 'form' ? 'Deposit CHIPS' : step === 'processing' ? 'Processing...' : 'Deposit Complete' }}
          </h2>
          <button class="modal-close" @click="$emit('close')">&times;</button>
        </div>

        <!-- Step 1: Amount + method + details -->
        <div v-if="step === 'form'" class="modal-body">
          <!-- Amount -->
          <div class="field">
            <label class="field-label">Amount (CHIPS)</label>
            <input v-model.number="amount" type="number" min="1" step="1" class="input input--lg" placeholder="1000" />
          </div>

          <!-- Quick amounts -->
          <div class="quick-amounts">
            <button v-for="q in [500, 1000, 5000, 10000]" :key="q" class="quick-btn" :class="{ 'quick-btn--active': amount === q }" @click="amount = q">
              {{ q.toLocaleString() }}
            </button>
          </div>

          <!-- Method tabs -->
          <div class="method-tabs">
            <button class="method-tab" :class="{ 'method-tab--active': method === 'card' }" @click="method = 'card'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 14h4" />
              </svg>
              Card
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

          <!-- Card form -->
          <div v-if="method === 'card'" class="payment-details">
            <div class="card-preview">
              <div class="card-chip"></div>
              <div class="card-number">{{ cardDisplay }}</div>
              <div class="card-bottom">
                <div><div class="card-label">Card Holder</div><div class="card-value">{{ cardForm.name || 'YOUR NAME' }}</div></div>
                <div><div class="card-label">Expires</div><div class="card-value">{{ cardForm.expiry || 'MM/YY' }}</div></div>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Cardholder Name</label>
              <input v-model="cardForm.name" type="text" class="input" placeholder="John Doe" required autocomplete="off" />
            </div>
            <div class="field">
              <label class="field-label">Card Number</label>
              <input v-model="cardForm.number" type="text" class="input input--mono" placeholder="4242 4242 4242 4242"
                maxlength="19" required autocomplete="off" @input="formatCardNumber" />
            </div>
            <div class="field-row">
              <div class="field">
                <label class="field-label">Expiry</label>
                <input v-model="cardForm.expiry" type="text" class="input input--mono" placeholder="MM/YY"
                  maxlength="5" required autocomplete="off" @input="formatExpiry" />
              </div>
              <div class="field">
                <label class="field-label">CVV</label>
                <input v-model="cardForm.cvv" type="password" class="input input--mono" placeholder="***"
                  maxlength="4" required autocomplete="off" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Billing Address</label>
              <input v-model="cardForm.address" type="text" class="input" placeholder="123 Main St, City, Country" required autocomplete="off" />
            </div>
          </div>

          <!-- Crypto form -->
          <div v-else class="payment-details">
            <div class="crypto-select">
              <label class="field-label">Select Cryptocurrency</label>
              <div class="crypto-grid">
                <button v-for="c in cryptos" :key="c.code" class="crypto-chip"
                  :class="{ 'crypto-chip--active': cryptoCoin === c.code }" @click="cryptoCoin = c.code">
                  <span class="crypto-symbol">{{ c.symbol }}</span>
                  <span class="crypto-name">{{ c.code }}</span>
                </button>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Send payment to this {{ cryptoCoin }} address</label>
              <div class="address-box">
                <code class="address-text">{{ addresses[cryptoCoin] }}</code>
                <button class="copy-btn" @click="copyAddress">{{ copied ? 'Copied' : 'Copy' }}</button>
              </div>
            </div>

            <div class="qr-section">
              <div class="qr-placeholder">
                <svg viewBox="0 0 100 100" width="110" height="110">
                  <rect width="100" height="100" fill="#fff"/>
                  <rect x="5" y="5" width="25" height="25" fill="#000"/><rect x="8" y="8" width="19" height="19" fill="#fff"/><rect x="11" y="11" width="13" height="13" fill="#000"/>
                  <rect x="70" y="5" width="25" height="25" fill="#000"/><rect x="73" y="8" width="19" height="19" fill="#fff"/><rect x="76" y="11" width="13" height="13" fill="#000"/>
                  <rect x="5" y="70" width="25" height="25" fill="#000"/><rect x="8" y="73" width="19" height="19" fill="#fff"/><rect x="11" y="76" width="13" height="13" fill="#000"/>
                  <rect x="70" y="70" width="25" height="25" fill="#000"/><rect x="73" y="73" width="19" height="19" fill="#fff"/><rect x="76" y="76" width="13" height="13" fill="#000"/>
                  <rect x="35" y="5" width="5" height="5" fill="#000"/><rect x="45" y="5" width="5" height="5" fill="#000"/><rect x="55" y="15" width="5" height="5" fill="#000"/>
                  <rect x="35" y="35" width="5" height="5" fill="#000"/><rect x="45" y="45" width="5" height="5" fill="#000"/><rect x="55" y="35" width="5" height="5" fill="#000"/>
                  <rect x="5" y="45" width="5" height="5" fill="#000"/><rect x="25" y="45" width="5" height="5" fill="#000"/><rect x="85" y="45" width="5" height="5" fill="#000"/>
                  <rect x="35" y="55" width="5" height="5" fill="#000"/><rect x="55" y="55" width="5" height="5" fill="#000"/><rect x="45" y="65" width="5" height="5" fill="#000"/>
                </svg>
              </div>
              <span class="qr-hint">Scan to send {{ cryptoCoin }}</span>
            </div>

            <div class="network-info">
              <div class="net-row"><span>Network</span><span>{{ networkNames[cryptoCoin] }}</span></div>
              <div class="net-row"><span>Confirmations</span><span>{{ confirmations[cryptoCoin] }}</span></div>
            </div>
          </div>

          <button class="btn-submit" :disabled="!amount || amount <= 0" @click="processDeposit">
            {{ method === 'card' ? 'Pay & Deposit' : "I've Sent the Payment" }}
          </button>
        </div>

        <!-- Step 2: Processing -->
        <div v-else-if="step === 'processing'" class="modal-body modal-body--center">
          <div class="spinner"></div>
          <p class="processing-text">{{ processingText }}</p>
          <div class="progress-bar"><div class="progress-fill" :style="{ width: progress + '%' }"></div></div>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="step === 'success'" class="modal-body modal-body--center">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" /></svg>
          </div>
          <h3 class="success-title">Deposit Successful</h3>
          <p class="success-amount">+{{ amount?.toLocaleString() }} CHIPS</p>
          <button class="btn-submit" @click="$emit('close')">Done</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { useWalletStore } from "../stores/wallet.js";

const emit = defineEmits(["close", "deposited"]);
const walletStore = useWalletStore();

const cryptos = [
  { code: "BTC", symbol: "\u20BF" }, { code: "ETH", symbol: "\u039E" }, { code: "SOL", symbol: "S" },
  { code: "ADA", symbol: "\u20B3" }, { code: "LTC", symbol: "\u0141" }, { code: "DOGE", symbol: "D" },
];

const addresses = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  SOL: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
  ADA: "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp",
  LTC: "ltc1qg42tkwuuxefutzxezdkdp49qt25dkfrgrnlz6x",
  DOGE: "DPuKhwbvF4GN3JK6sYdsFkiVDPkFjZCQv7",
};

const networkNames = { BTC: "Bitcoin Mainnet", ETH: "Ethereum (ERC-20)", SOL: "Solana Mainnet", ADA: "Cardano Mainnet", LTC: "Litecoin Mainnet", DOGE: "Dogecoin Mainnet" };
const confirmations = { BTC: "3 (~30 min)", ETH: "12 (~3 min)", SOL: "32 (~15 sec)", ADA: "15 (~5 min)", LTC: "6 (~15 min)", DOGE: "6 (~6 min)" };

const step = ref("form");
const method = ref("card");
const amount = ref(1000);
const progress = ref(0);
const processingText = ref("");
const copied = ref(false);
const cryptoCoin = ref("BTC");

const cardForm = ref({ name: "", number: "", expiry: "", cvv: "", address: "" });

const cardDisplay = computed(() => {
  const num = cardForm.value.number.replace(/\s/g, "");
  if (!num) return "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022";
  return num.padEnd(16, "\u2022").match(/.{1,4}/g).join(" ");
});

function formatCardNumber(e) {
  let val = e.target.value.replace(/\D/g, "").slice(0, 16);
  cardForm.value.number = val.match(/.{1,4}/g)?.join(" ") || val;
}
function formatExpiry(e) {
  let val = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
  cardForm.value.expiry = val;
}
function copyAddress() {
  navigator.clipboard.writeText(addresses[cryptoCoin.value]);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

async function processDeposit() {
  step.value = "processing";
  progress.value = 0;
  const steps = method.value === "card"
    ? ["Validating card details...", "Contacting payment processor...", "Authorizing transaction...", "Crediting your account..."]
    : ["Detecting transaction on blockchain...", "Waiting for confirmations...", "Verifying payment amount...", "Crediting your account..."];
  for (let i = 0; i < steps.length; i++) {
    processingText.value = steps[i];
    progress.value = ((i + 1) / steps.length) * 80;
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
  }
  try {
    await walletStore.deposit("CHIPS", amount.value);
    progress.value = 100;
    await new Promise((r) => setTimeout(r, 400));
    step.value = "success";
    emit("deposited");
  } catch {
    step.value = "form";
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem; backdrop-filter: blur(4px);
}
.modal {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px;
  width: 100%; max-width: 460px; max-height: 92vh; overflow-y: auto; animation: modal-in 0.2s ease-out;
}
@keyframes modal-in { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }

.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--color-border); }
.modal-title { font-family: var(--font-display); font-size: 1.15rem; color: var(--color-gold); margin: 0; }
.modal-close { background: none; border: none; color: var(--color-text-muted); font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; }
.modal-close:hover { color: var(--color-text); }

.modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-body--center { align-items: center; text-align: center; padding: 2rem 1.5rem; }

/* Fields */
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label { font-size: 0.78rem; color: var(--color-text-muted); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.input {
  width: 100%; padding: 0.6rem 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: 8px; color: var(--color-text); font-size: 0.95rem; transition: border-color 0.2s;
}
.input:focus { outline: none; border-color: var(--color-gold); }
.input--lg { font-size: 1.4rem; font-weight: 700; text-align: center; padding: 0.7rem; }
.input--mono { font-family: "Courier New", monospace; letter-spacing: 0.05em; }

/* Quick amounts */
.quick-amounts { display: flex; gap: 0.5rem; }
.quick-btn {
  flex: 1; padding: 0.45rem; background: var(--color-bg); border: 1px solid var(--color-border);
  border-radius: 8px; color: var(--color-text-muted); font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.quick-btn:hover { border-color: var(--color-gold); color: var(--color-gold); }
.quick-btn--active { border-color: var(--color-gold); background: rgba(212,160,32,0.1); color: var(--color-gold); font-weight: 600; }

/* Method tabs */
.method-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.method-tab {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem;
  background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 10px;
  color: var(--color-text-muted); font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
}
.method-tab:hover { border-color: var(--color-gold); color: var(--color-text); }
.method-tab--active { border-color: var(--color-gold); background: rgba(212,160,32,0.1); color: var(--color-gold); font-weight: 600; }

/* Card preview */
.card-preview {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); border-radius: 14px;
  padding: 1.25rem; position: relative; aspect-ratio: 1.7; display: flex; flex-direction: column; justify-content: space-between;
}
.card-preview::after { content: ""; position: absolute; top: -50%; right: -30%; width: 80%; height: 200%; background: radial-gradient(circle, rgba(212,160,32,0.08), transparent 70%); pointer-events: none; }
.card-chip { width: 36px; height: 26px; background: linear-gradient(135deg, #d4a020, #b8860b); border-radius: 4px; }
.card-number { font-family: "Courier New", monospace; font-size: 1.1rem; color: #e0e0e0; letter-spacing: 0.12em; }
.card-bottom { display: flex; justify-content: space-between; }
.card-label { font-size: 0.55rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.card-value { font-size: 0.8rem; color: #e0e0e0; text-transform: uppercase; }

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

.address-box {
  display: flex; align-items: center; gap: 0.5rem; background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: 8px; padding: 0.6rem 0.75rem; margin-top: 0.3rem;
}
.address-text { flex: 1; font-size: 0.68rem; color: var(--color-text); word-break: break-all; font-family: "Courier New", monospace; }
.copy-btn { flex-shrink: 0; background: var(--color-gold); color: var(--color-bg); border: none; border-radius: 6px; padding: 0.3rem 0.65rem; font-size: 0.72rem; font-weight: 600; cursor: pointer; }

.qr-section { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.qr-placeholder { background: #fff; border-radius: 8px; padding: 6px; display: inline-block; }
.qr-hint { font-size: 0.72rem; color: var(--color-text-muted); }

.network-info { background: var(--color-bg); border-radius: 8px; padding: 0.6rem 0.75rem; }
.net-row { display: flex; justify-content: space-between; padding: 0.25rem 0; font-size: 0.78rem; color: var(--color-text-muted); }
.net-row + .net-row { border-top: 1px solid var(--color-border); }
.net-row span:last-child { color: var(--color-text); }

/* Submit */
.btn-submit {
  width: 100%; padding: 0.75rem; background: var(--color-gold); color: var(--color-bg); border: none;
  border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Processing */
.spinner { width: 48px; height: 48px; border: 3px solid var(--color-border); border-top-color: var(--color-gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.processing-text { color: var(--color-text-muted); font-size: 0.9rem; margin: 0; }
.progress-bar { width: 100%; height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-gold); border-radius: 2px; transition: width 0.4s ease; }

/* Success */
.success-icon { color: var(--color-success); }
.success-title { font-family: var(--font-display); color: var(--color-gold); margin: 0; font-size: 1.3rem; }
.success-amount { font-size: 2rem; font-weight: 700; color: var(--color-success); margin: 0; }

/* Responsive */
@media (max-width: 480px) {
  .modal { max-width: 100%; border-radius: 12px; }
  .modal-body { padding: 1rem; }
  .card-preview { aspect-ratio: 1.6; padding: 1rem; }
  .card-number { font-size: 0.95rem; }
  .crypto-grid { grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .quick-amounts { flex-wrap: wrap; }
  .quick-btn { flex: 0 0 calc(50% - 0.25rem); }
  .field-row { grid-template-columns: 1fr 1fr; }
}
</style>
