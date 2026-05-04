# Multi-stage build:
#  1. build the React frontend with VITE_DATA_MODE=rest
#  2. build the TypeScript backend
#  3. assemble a small runtime image that serves both

# ---------- 1. Frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
ENV VITE_DATA_MODE=rest
ENV VITE_API_URL=/api
RUN npm run build

# ---------- 2. Backend ----------
FROM node:20-alpine AS backend
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# ---------- 3. Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Backend deps only (skip dev)
COPY server/package.json ./server/package.json
RUN cd server && npm install --omit=dev

# Compiled backend
COPY --from=backend /app/server/dist ./server/dist
COPY --from=backend /app/server/sql  ./server/sql

# Built frontend served by Fastify
COPY --from=frontend /app/dist ./server/public

ENV STATIC_DIR=/app/server/public
ENV PORT=3001
ENV HOST=0.0.0.0
EXPOSE 3001

WORKDIR /app/server
# Run migrations on boot, then start the API + static frontend.
CMD ["sh", "-c", "node dist/migrate.js && node dist/index.js"]
