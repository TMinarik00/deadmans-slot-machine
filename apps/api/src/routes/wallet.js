// Wallet routes - manage virtual currency wallets.
// All routes require authentication. Each user gets one wallet per currency.
// On first access, a CHIPS wallet is auto-created with a welcome bonus.

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const walletRouter = Router();

// --- Currency conversion rates (relative to CHIPS) ---
// Fiat: 1 USD = 100 CHIPS, 1 EUR = 120, 1 GBP = 140
// Crypto: simulated market-like rates
const RATES_TO_CHIPS = {
  CHIPS: 1,
  USD: 100,
  EUR: 120,
  GBP: 140,
  BTC: 6_150_000,   // ~$61,500 per BTC
  ETH: 310_000,     // ~$3,100 per ETH
  LTC: 8_500,       // ~$85 per LTC
  SOL: 15_000,      // ~$150 per SOL
  DOGE: 15,         // ~$0.15 per DOGE
  ADA: 45,          // ~$0.45 per ADA
};

const WELCOME_BONUS = 1000; // new users start with 1000 CHIPS

// --- Helpers ---

// Ensure the user has a CHIPS wallet (auto-create with welcome bonus on first access)
async function ensureChipsWallet(userId, tx) {
  const db = tx || prisma;
  const existing = await db.wallet.findUnique({
    where: { userId_currency: { userId, currency: "CHIPS" } },
  });
  if (existing) return existing;

  const wallet = await db.wallet.create({
    data: { userId, currency: "CHIPS", balance: WELCOME_BONUS },
  });

  // Record the welcome bonus as a deposit transaction
  await db.transaction.create({
    data: {
      type: "DEPOSIT",
      amount: WELCOME_BONUS,
      balanceAfter: WELCOME_BONUS,
      note: "Welcome bonus",
      userId,
      walletId: wallet.id,
    },
  });

  return wallet;
}

// Convert amount from one currency to another via CHIPS as intermediary
function convertAmount(amount, fromCurrency, toCurrency) {
  const inChips = Number(amount) * RATES_TO_CHIPS[fromCurrency];
  return inChips / RATES_TO_CHIPS[toCurrency];
}

// --- Validation schemas ---

const depositSchema = z.object({
  currency: z.enum(["CHIPS", "USD", "EUR", "GBP", "BTC", "ETH", "LTC", "SOL", "DOGE", "ADA"]).default("CHIPS"),
  amount: z.number().positive("Amount must be positive").max(1_000_000, "Maximum deposit is 1,000,000"),
});

const withdrawSchema = z.object({
  currency: z.enum(["CHIPS", "USD", "EUR", "GBP", "BTC", "ETH", "LTC", "SOL", "DOGE", "ADA"]).default("CHIPS"),
  amount: z.number().positive("Amount must be positive"),
});

const convertSchema = z.object({
  from: z.enum(["CHIPS", "USD", "EUR", "GBP", "BTC", "ETH", "LTC", "SOL", "DOGE", "ADA"]),
  to: z.enum(["CHIPS", "USD", "EUR", "GBP", "BTC", "ETH", "LTC", "SOL", "DOGE", "ADA"]),
  amount: z.number().positive("Amount must be positive"),
}).refine((data) => data.from !== data.to, {
  message: "Cannot convert a currency to itself",
  path: ["to"],
});

// ===========================
// GET /wallet - list all wallets for the current user
// ===========================
walletRouter.get("/wallet", requireAuth, async (req, res) => {
  // Ensure CHIPS wallet exists
  await ensureChipsWallet(req.userId);

  const wallets = await prisma.wallet.findMany({
    where: { userId: req.userId },
    orderBy: { currency: "asc" },
    select: { id: true, currency: true, balance: true, updatedAt: true },
  });

  // Include conversion rates for reference
  res.json({ wallets, rates: RATES_TO_CHIPS });
});

// ===========================
// GET /wallet/transactions - transaction history
// ===========================
walletRouter.get("/wallet/transactions", requireAuth, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      amount: true,
      balanceAfter: true,
      note: true,
      createdAt: true,
      wallet: { select: { currency: true } },
    },
  });

  res.json({ transactions });
});

// ===========================
// POST /wallet/deposit - add virtual funds
// ===========================
walletRouter.post("/wallet/deposit", requireAuth, validate(depositSchema), async (req, res) => {
  const { currency, amount } = req.body;
  const userId = req.userId;

  const result = await prisma.$transaction(async (tx) => {
    // Ensure CHIPS wallet exists
    await ensureChipsWallet(userId, tx);

    // Find or create the target wallet
    let wallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId, currency, balance: 0 },
      });
    }

    // Credit the wallet
    wallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    // Record transaction
    const transaction = await tx.transaction.create({
      data: {
        type: "DEPOSIT",
        amount,
        balanceAfter: wallet.balance,
        note: `Deposit ${amount} ${currency}`,
        userId,
        walletId: wallet.id,
      },
    });

    return { wallet, transaction };
  });

  res.json({
    wallet: {
      id: result.wallet.id,
      currency: result.wallet.currency,
      balance: result.wallet.balance,
    },
    transaction: {
      id: result.transaction.id,
      type: result.transaction.type,
      amount: result.transaction.amount,
      balanceAfter: result.transaction.balanceAfter,
    },
  });
});

// ===========================
// POST /wallet/withdraw - remove virtual funds
// ===========================
walletRouter.post("/wallet/withdraw", requireAuth, validate(withdrawSchema), async (req, res) => {
  const { currency, amount } = req.body;
  const userId = req.userId;

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });

    if (!wallet) {
      throw { status: 404, message: `No ${currency} wallet found` };
    }

    if (Number(wallet.balance) < amount) {
      throw { status: 400, message: "Insufficient balance" };
    }

    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        type: "WITHDRAWAL",
        amount: -amount,
        balanceAfter: updated.balance,
        note: `Withdraw ${amount} ${currency}`,
        userId,
        walletId: wallet.id,
      },
    });

    return { wallet: updated, transaction };
  });

  res.json({
    wallet: {
      id: result.wallet.id,
      currency: result.wallet.currency,
      balance: result.wallet.balance,
    },
    transaction: {
      id: result.transaction.id,
      type: result.transaction.type,
      amount: result.transaction.amount,
      balanceAfter: result.transaction.balanceAfter,
    },
  });
});

// ===========================
// POST /wallet/convert - convert between currencies
// ===========================
walletRouter.post("/wallet/convert", requireAuth, validate(convertSchema), async (req, res) => {
  const { from, to, amount } = req.body;
  const userId = req.userId;

  const convertedAmount = convertAmount(amount, from, to);

  // Round to 2 decimal places
  const roundedConverted = Math.round(convertedAmount * 100) / 100;

  if (roundedConverted <= 0) {
    return res.status(400).json({ error: "Converted amount is too small" });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Ensure CHIPS wallet exists
    await ensureChipsWallet(userId, tx);

    // Source wallet must exist and have sufficient balance
    const sourceWallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency: from } },
    });

    if (!sourceWallet) {
      throw { status: 404, message: `No ${from} wallet found` };
    }

    if (Number(sourceWallet.balance) < amount) {
      throw { status: 400, message: "Insufficient balance" };
    }

    // Find or create destination wallet
    let destWallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency: to } },
    });

    if (!destWallet) {
      destWallet = await tx.wallet.create({
        data: { userId, currency: to, balance: 0 },
      });
    }

    // Debit source
    const updatedSource = await tx.wallet.update({
      where: { id: sourceWallet.id },
      data: { balance: { decrement: amount } },
    });

    // Credit destination
    const updatedDest = await tx.wallet.update({
      where: { id: destWallet.id },
      data: { balance: { increment: roundedConverted } },
    });

    // Record both sides of the conversion
    const txOut = await tx.transaction.create({
      data: {
        type: "CONVERSION_OUT",
        amount: -amount,
        balanceAfter: updatedSource.balance,
        note: `Convert ${amount} ${from} → ${roundedConverted} ${to}`,
        userId,
        walletId: sourceWallet.id,
      },
    });

    const txIn = await tx.transaction.create({
      data: {
        type: "CONVERSION_IN",
        amount: roundedConverted,
        balanceAfter: updatedDest.balance,
        note: `Convert ${amount} ${from} → ${roundedConverted} ${to}`,
        userId,
        walletId: destWallet.id,
      },
    });

    return { source: updatedSource, dest: updatedDest, txOut, txIn };
  });

  res.json({
    source: { id: result.source.id, currency: from, balance: result.source.balance },
    dest: { id: result.dest.id, currency: to, balance: result.dest.balance },
    converted: roundedConverted,
    rate: `1 ${from} = ${RATES_TO_CHIPS[from] / RATES_TO_CHIPS[to]} ${to}`,
  });
});

// ===========================
// GET /wallet/rates - get conversion rates
// ===========================
walletRouter.get("/wallet/rates", requireAuth, async (_req, res) => {
  res.json({ rates: RATES_TO_CHIPS });
});

// --- Error handling for known thrown errors inside $transaction ---
walletRouter.use((err, _req, res, _next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("Wallet error:", err);
  res.status(500).json({ error: "Internal server error" });
});
