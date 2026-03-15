# Dead Man's Slot Machine

A full-stack slot machine simulation game with a Wild West theme. Built with Vue 3, Express, PostgreSQL, and Docker.

> **Simulation only** - no real money or gambling. Currency conversions are informational.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | Vue 3 + Vite + Vue Router + Pinia |
| Backend   | Node.js + Express                 |
| Database  | PostgreSQL + Prisma ORM           |
| Docs      | OpenAPI 3.1 + Swagger UI          |
| Dev Tools | Docker Compose, Mailpit           |

## Quick Start (Docker)

```bash
# Start all services (DB + API + Mailpit)
docker compose up

# API:          http://localhost:3000
# Swagger docs: http://localhost:3000/docs
# Mailpit UI:   http://localhost:8025
```

## Quick Start (Local Dev)

```bash
# 1. Start the database
docker compose up db -d

# 2. Install dependencies
cd apps/api && npm install && cp .env.example .env
cd ../web && npm install

# 3. Push database schema
cd ../api && npx prisma db push

# 4. Run API and frontend (in separate terminals)
cd apps/api && npm run dev     # → http://localhost:3000
cd apps/web && npm run dev     # → http://localhost:5173
```

## API Documentation

Interactive Swagger UI is available at `/docs` on the API server. Every endpoint is documented in `apps/api/openapi.yaml`.

## Mailpit (Email Testing)

Mailpit catches all emails sent by the API (password resets, etc.). Open http://localhost:8025 to view them.

## Project Structure

```
├── apps/
│   ├── api/              # Express backend
│   │   ├── prisma/       # Database schema & migrations
│   │   ├── src/
│   │   │   ├── routes/   # Route handlers
│   │   │   └── server.js # App entry point
│   │   └── openapi.yaml  # API contract
│   └── web/              # Vue 3 frontend
│       └── src/
│           ├── assets/   # Global CSS
│           ├── router/   # Vue Router config
│           └── views/    # Page components
├── docker-compose.yml
└── README.md
```

## Development Progress

- [x] **Cycle 0:** Repo, Docker, health endpoint, Swagger UI, Vue scaffold
- [ ] **Cycle 1:** Authentication (register, login, forgot/reset password)
- [ ] **Cycle 2:** Wallet system (deposit, withdraw, currency conversion)
- [ ] **Cycle 3:** Slot engine (3-7 columns, Wild West theme, animations)
- [ ] **Cycle 4:** Profile, leaderboards, daily bonus, achievements
- [ ] **Cycle 5:** Polish, tests, CI, final README

## Author

**Tin Minarik** - tinminarik00@gmail.com
