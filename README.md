# Dead Man's Slot Machine

Dead Man's Slot Machine is a full-stack Wild West casino-style simulator built as an npm workspace monorepo. It combines a Vue 3 frontend, an Express API, PostgreSQL via Prisma, and a PixiJS-powered slot experience with virtual wallets, progression, achievements, and leaderboard features.

> Simulation only. There is no real-money gambling, no real payments, and no real KYC processing in this project.

## What ships today

- Email/password auth with refresh-token sessions and password reset flow
- Three slot games rendered in PixiJS with a ways-to-win payout system
- Virtual wallet system with CHIPS, fiat, and crypto balances
- XP, levels, daily bonus, achievements, and leaderboard progression
- Profile editing plus a simulated KYC status flow
- Swagger API docs and Mailpit for local email testing

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Pinia, GSAP, PixiJS |
| Backend | Node.js, Express 5, Zod |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT access/refresh flow, Argon2 password hashing |
| Docs | OpenAPI 3.1, Swagger UI |
| Dev tooling | Docker Compose, Mailpit, ESLint, GitHub Actions |

## Core product features

### Authentication

- Register with email, username, password, date of birth, country, and optional profile data
- Login, logout, refresh session, and restore session via `GET /me`
- Forgot-password and reset-password flow through Mailpit in local development
- Rate limiting on login and forgot-password endpoints

### Slot gameplay

- Three games: Dead Man's Gun, Dead Man's Treasure, and Coyote Moon
- Ways-to-win engine with adjacent left-to-right matching logic
- Wild and scatter symbols
- PixiJS reel rendering, win highlights, and premium slot UI
- Auto-spin options: `1`, `5`, `10`, and `100`

### Wallets and virtual economy

- Ten supported currencies: `CHIPS`, `USD`, `EUR`, `GBP`, `BTC`, `ETH`, `LTC`, `SOL`, `DOGE`, `ADA`
- Welcome bonus of `1000 CHIPS` when a user first gets a CHIPS wallet
- Deposit, withdraw, and convert between currencies using simulated rates
- Immutable transaction ledger for deposits, withdrawals, conversions, bets, wins, bonuses, and rewards

### Progression and profile

- XP gain based on wager amount: `1 XP` per wagered CHIP
- Level rewards based on current level
- Daily bonus: `100 CHIPS` and `25 XP`
- `15` built-in achievements across spins, wins, wagering, levels, game-specific play, and KYC
- Leaderboard modes for `totalWon`, `biggestWin`, and `level`
- Leaderboard periods for `daily`, `weekly`, `monthly`, and `allTime`
- Profile edit and delete flows
- Simulated KYC submission with status updates (`NONE`, `PENDING`, `VERIFIED`, `REJECTED`)

## Game catalog

| Game | Reels x Rows | Ways | Bet options |
| --- | --- | --- | --- |
| Dead Man's Gun | 5 x 4 | 1,024 | 10, 20, 50, 100, 200, 500 CHIPS |
| Dead Man's Treasure | 5 x 5 | 3,125 | 10, 25, 50, 100, 250, 500 CHIPS |
| Coyote Moon | 5 x 6 | 7,776 | 10, 30, 60, 100, 300, 600 CHIPS |

## Repository structure

```text
.
|-- .github/workflows/ci.yml
|-- apps/
|   |-- api/
|   |   |-- openapi.yaml
|   |   |-- prisma/
|   |   |   |-- migrations/
|   |   |   `-- schema.prisma
|   |   |-- src/
|   |   |   |-- lib/
|   |   |   |-- middleware/
|   |   |   |-- routes/
|   |   |   `-- server.js
|   |   `-- package.json
|   `-- web/
|       |-- src/
|       |   |-- assets/
|       |   |-- components/
|       |   |-- layouts/
|       |   |-- router/
|       |   |-- stores/
|       |   `-- views/
|       `-- package.json
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Local development

### Requirements

- Node.js 24.x is the version used in CI
- npm
- Docker Desktop or another Docker runtime with Compose support

### 1. Install dependencies

```bash
npm install
```

### 2. Create the API environment file

Copy `apps/api/.env.example` to `apps/api/.env`.

Examples:

```bash
# macOS / Linux
cp apps/api/.env.example apps/api/.env
```

```powershell
# PowerShell
Copy-Item apps/api/.env.example apps/api/.env
```

### 3. Start local infrastructure

```bash
docker compose up -d db mailpit
```

### 4. Generate Prisma client and run migrations

```bash
npm run db:generate --workspace=apps/api
npm run db:migrate --workspace=apps/api
```

### 5. Run the API and frontend in separate terminals

```bash
npm run dev --workspace=apps/api
```

```bash
npm run dev --workspace=apps/web
```

### Local URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/docs |
| Health | http://localhost:3000/health |
| Mailpit | http://localhost:8025 |

## Docker notes

This repository's `docker-compose.yml` starts backend infrastructure and services:

- `db` for PostgreSQL
- `api` for the Express server
- `mailpit` for local email capture

The Vite frontend is not containerized in `docker-compose.yml`. For normal development, run the frontend locally on port `5173`.

To run the backend services through Docker:

```bash
docker compose up -d db api mailpit
```

If you change backend code or Prisma setup and need a rebuilt API container:

```bash
docker compose up -d --build api
```

## Available scripts

### Root workspace

| Command | Purpose |
| --- | --- |
| `npm run dev:api` | Start the API workspace |
| `npm run dev:web` | Start the frontend workspace |
| `npm run dev` | Start both via the root script |
| `npm run lint` | Lint API and web workspaces |
| `npm run build:web` | Build the frontend |

### API workspace

| Command | Purpose |
| --- | --- |
| `npm run dev --workspace=apps/api` | Start API in watch mode |
| `npm run start --workspace=apps/api` | Start API once |
| `npm run db:generate --workspace=apps/api` | Generate Prisma client |
| `npm run db:migrate --workspace=apps/api` | Apply Prisma migrations |
| `npm run db:push --workspace=apps/api` | Push schema directly to the database |
| `npm run db:studio --workspace=apps/api` | Open Prisma Studio |
| `npm run lint --workspace=apps/api` | Lint backend code |

### Web workspace

| Command | Purpose |
| --- | --- |
| `npm run dev --workspace=apps/web` | Start Vite dev server |
| `npm run build --workspace=apps/web` | Build production frontend assets |
| `npm run preview --workspace=apps/web` | Preview the production build |
| `npm run lint --workspace=apps/web` | Lint frontend code |

## API overview

Interactive API documentation is served from `apps/api/openapi.yaml` at `/docs`.

### Route groups

| Group | Endpoints |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /me` |
| Wallet | `GET /wallet`, `GET /wallet/transactions`, `POST /wallet/deposit`, `POST /wallet/withdraw`, `POST /wallet/convert`, `GET /wallet/rates` |
| Game | `GET /game/list`, `GET /game/:id`, `POST /game/spin` |
| Profile | `GET /profile`, `POST /profile/kyc`, `POST /profile/edit`, `POST /profile/delete`, `POST /profile/daily-bonus`, `GET /achievements`, `POST /achievements/:id/claim`, `GET /leaderboard` |

## Data model summary

The Prisma schema currently defines:

- `User`
- `PasswordResetToken`
- `RefreshToken`
- `Wallet`
- `Transaction`
- `UserAchievement`
- `UserGameStats`
- `Currency` enum
- `TransactionType` enum

## Frontend route summary

### Guest routes

- `/login`
- `/register`

### Authenticated app routes

- `/app`
- `/app/game/:gameId`
- `/app/wallet`
- `/app/profile`
- `/app/achievements`
- `/app/leaderboard`

## CI

GitHub Actions runs on pushes and pull requests targeting `main` and `staging`.

Current pipeline steps:

- Lint API workspace
- Lint web workspace
- Generate Prisma client
- Build the frontend
- Build the API Docker image

## Environment variables

`apps/api/.env.example` currently contains:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`
- `FRONTEND_URL`
- `JWT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`

## Notes

- Mailpit is used only for local development email capture.
- Currency rates are simulated and defined in backend code.
- KYC is simulated for product flow purposes; it is not connected to any real identity provider.
- The slot engine and wallet system are designed for virtual balances only.
