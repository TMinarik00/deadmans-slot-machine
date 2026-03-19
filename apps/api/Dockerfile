# Multi-stage Dockerfile for the Dead Man's Slot Machine API
# Stage 1: install dependencies
# Stage 2: run the app (smaller final image)

# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

# --- Production stage ---
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
