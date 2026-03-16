# Dead Man's Slot Machine

A full-stack Wild West slot machine simulation built with Vue 3, Express, PostgreSQL, and Docker. Features 4 themed games, multi-currency wallets, a progression system with achievements, and a leaderboard.

> **Simulation only** — no real money or gambling. All currencies and conversions are purely informational.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Vite + Vue Router + Pinia |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL 17 + Prisma ORM |
| Auth | JWT (access + refresh tokens), Argon2id password hashing |
| Validation | Zod schemas on all endpoints |
| API Docs | OpenAPI 3.1 + Swagger UI |
| CI/CD | GitHub Actions (lint, build, Docker) |
| Dev Tools | Docker Compose, Mailpit (email catcher), ESLint |

## Quick Start (Docker)

```bash
# Start all services (PostgreSQL + API + Mailpit)
docker compose up

# API:          http://localhost:3000
# Swagger docs: http://localhost:3000/docs
# Mailpit UI:   http://localhost:8025
```

## Quick Start (Local Dev)

```bash
# 1. Start the database
docker compose up db -d

# 2. Install all dependencies (npm workspaces)
npm install

# 3. Set up the API environment
cp apps/api/.env.example apps/api/.env

# 4. Push the database schema
npx prisma db push --schema=apps/api/prisma/schema.prisma

# 5. Run both apps (separate terminals)
npm run dev:api     # → http://localhost:3000
npm run dev:web     # → http://localhost:5173
```

## Features

### Authentication
- Register & login with email/password
- JWT access tokens (15 min) + refresh tokens (7 days)
- Password reset via email (Mailpit catches emails in dev)
- Rate limiting on auth endpoints (10 req / 15 min)

### Wallet System
- 10 supported currencies: CHIPS, USD, EUR, GBP, BTC, ETH, LTC, SOL, DOGE, ADA
- Deposit, withdraw, and convert between currencies
- Full transaction history with audit trail

### Slot Machine (4 Games)

| Game | Reels x Rows | Ways | Bet Range |
|------|-------------|------|-----------|
| Dead Man's Gun | 5 x 4 | 1,024 | 10–500 CHIPS |
| Dead Man's Treasure | 5 x 5 | 3,125 | 10–500 CHIPS |
| Coyote Moon | 5 x 6 | 7,776 | 10–600 CHIPS |
| Rattlesnake Gold | 5 x 4 | 1,024 | 5–300 CHIPS |

- **Ways-to-win** mechanic (adjacent reels, left to right)
- Wild symbols (substitute for others) and scatter symbols (position-independent payouts)
- Auto-spin: 1, 5, 10, or 100 spins with summary

### Progression System
- XP earned per spin (1 XP per CHIP wagered)
- Level-up rewards (CHIPS bonuses)
- Daily bonus: 100 CHIPS + 25 XP (once per 24h)

### Achievements
- 20+ achievements across categories (wins, levels, wagering, exploration)
- Progress tracking with claimable rewards (CHIPS + XP)

### Leaderboard
- Top 20 players
- 3 ranking modes: Total Won, Biggest Win, Level

## API Documentation

Interactive Swagger UI at `/docs` on the API server. Every endpoint is documented in `apps/api/openapi.yaml`.

### Endpoints Overview

| Group | Endpoints | Auth Required |
|-------|-----------|---------------|
| Health | `GET /health` | No |
| Auth | `POST /auth/register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `GET /me` | No (except /me) |
| Wallet | `GET /wallet`, `/wallet/rates`, `/wallet/transactions`, `POST /wallet/deposit`, `withdraw`, `convert` | Yes |
| Game | `GET /game/list`, `/game/:id`, `POST /game/spin` | Yes |
| Profile | `GET /profile`, `/achievements`, `/leaderboard`, `POST /profile/daily-bonus`, `/achievements/:id/claim` | Yes |

## Project Structure

```
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions CI pipeline
├── apps/
│   ├── api/                      # Express backend
│   │   ├── prisma/schema.prisma  # Database schema (7 models)
│   │   ├── openapi.yaml          # Full API specification
│   │   ├── Dockerfile            # Multi-stage production build
│   │   └── src/
│   │       ├── server.js         # App entry point
│   │       ├── routes/           # health, auth, wallet, game, profile
│   │       ├── middleware/       # auth guard, validation, security headers
│   │       └── lib/              # prisma, tokens, password, email, slot-engine, progression
│   └── web/                      # Vue 3 frontend
│       └── src/
│           ├── views/            # 9 page components
│           ├── components/       # SlotMachine, GameSelector, modals
│           ├── components/ui/    # Reusable component library (9 components)
│           ├── stores/           # Pinia stores (auth, game, wallet, profile)
│           ├── layouts/          # AuthLayout, DefaultLayout
│           ├── router/           # Vue Router with auth guards
│           └── lib/api.js        # HTTP client with token refresh
├── docker-compose.yml            # PostgreSQL + API + Mailpit
└── package.json                  # npm workspaces root
```

## Database Schema

| Model | Purpose |
|-------|---------|
| User | Account, credentials, XP/level, lifetime stats |
| Wallet | Per-currency balance (Decimal 18,2) |
| Transaction | Immutable audit log (deposit, withdrawal, bet, win, bonus, etc.) |
| RefreshToken | Revocable session tokens (SHA-256 hashed, 7-day TTL) |
| PasswordResetToken | One-time reset links (SHA-256 hashed, 1-hour TTL) |
| UserAchievement | Per-user achievement progress and claim status |
| UserGameStats | Per-user per-game spin/win statistics |

## Security

- Passwords hashed with Argon2id (OWASP recommended)
- Tokens stored as SHA-256 hashes (never plaintext)
- Input validation with Zod on every endpoint
- Rate limiting on authentication routes
- CORS restricted to frontend origin
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- SQL injection protection via Prisma ORM

## CI/CD

GitHub Actions runs on every push/PR to `main` and `staging`:

| Job | What it does |
|-----|-------------|
| **Lint** | ESLint on `apps/api` and `apps/web` |
| **Build** | Prisma client generation + Vite frontend build |
| **Docker** | Builds the API container image |

## Development Cycles

### Completed

- [x] **Cycle 0 — Foundation:** Monorepo, Docker Compose, health endpoint, Swagger UI, Vue scaffold
- [x] **Cycle 1 — Authentication:** Register, login, JWT tokens, password reset with email
- [x] **Cycle 2 — Wallet System:** Multi-currency wallets (10 currencies), deposit/withdraw, conversion rates, transaction history
- [x] **Cycle 3 — Slot Engine:** 4 Wild West games, ways-to-win mechanic, reel animations, bet system
- [x] **Cycle 4 — Profile & Progression:** XP/levels, 20+ achievements, leaderboard, daily bonus, per-game stats
- [x] **Cycle 5 — UI Polish & CI/CD:** Reusable component library, page transitions, ESLint, GitHub Actions pipeline

### Upcoming

- [ ] **Cycle 6.1 — Visual Overhaul: Auth Pages:** Wild West themed login, register, forgot/reset password with dark western palette, typography, backgrounds
- [ ] **Cycle 6.2 — Visual Overhaul: Wallet & Navigation:** Navbar redesign, wallet page, deposit/withdraw, transaction history, currency cards
- [ ] **Cycle 6.3 — Visual Overhaul: Profile & Leaderboard:** Profile page, level/XP display, achievements, daily bonus, leaderboard — complete redesign
- [ ] **Cycle 6.4 — Visual Overhaul: Slot Machine & Game UI:** Replace emoji symbols with proper SVG icons/images, reel redesign, win animations, game selector, game lobby
- [ ] **Cycle 7 — Sound & Atmosphere:** Sound effects (spin, win, coins, buttons), background music, ambient audio, volume/mute controls
- [ ] **Cycle 8 — Final Polish & README:** Final visual tweaks, deployment prep, comprehensive documentation

## Mailpit (Email Testing)

Mailpit catches all emails sent by the API (password resets). Open http://localhost:8025 to view them in a web UI. This is only used in local development.

## Scripts

```bash
npm run dev          # Start both API and frontend
npm run dev:api      # Start API only
npm run dev:web      # Start frontend only
npm run lint         # Lint both apps
npm run build:web    # Build frontend for production
```

## Author

**Tin Minarik** — tinminarik00@gmail.com
