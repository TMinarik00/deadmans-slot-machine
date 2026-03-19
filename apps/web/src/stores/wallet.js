// Pinia wallet store - manages wallet balances, deposits, withdrawals, and conversions.
// Components read from here; they never call the API directly for wallet operations.

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../lib/api.js";

export const useWalletStore = defineStore("wallet", () => {
  // State
  const wallets = ref([]);
  const rates = ref({});
  const transactions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const chipsBalance = computed(() => {
    const chips = wallets.value.find((w) => w.currency === "CHIPS");
    return chips ? Number(chips.balance) : 0;
  });

  const getWallet = computed(() => (currency) => {
    return wallets.value.find((w) => w.currency === currency);
  });

  // Actions
  async function fetchWallets() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/wallet");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load wallets");
      wallets.value = data.wallets;
      rates.value = data.rates;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTransactions() {
    try {
      const res = await api.get("/wallet/transactions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load transactions");
      transactions.value = data.transactions;
    } catch (e) {
      error.value = e.message;
    }
  }

  async function deposit(currency, amount) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/wallet/deposit", { currency, amount });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit failed");
      await fetchWallets();
      await fetchTransactions();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function withdraw(currency, amount) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/wallet/withdraw", { currency, amount });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");
      await fetchWallets();
      await fetchTransactions();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function convert(from, to, amount) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/wallet/convert", { from, to, amount });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversion failed");
      await fetchWallets();
      await fetchTransactions();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    wallets,
    rates,
    transactions,
    loading,
    error,
    chipsBalance,
    getWallet,
    fetchWallets,
    fetchTransactions,
    deposit,
    withdraw,
    convert,
  };
});
