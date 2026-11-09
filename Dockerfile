# Multi-stage production container for BharatBazaar Background Worker
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install curl for optional healthcheck
RUN apk add --no-cache curl

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY types ./types
COPY lib ./lib
COPY scripts ./scripts

# Run the live ingestion loop
CMD ["node", "--experimental-strip-types", "scripts/worker.ts"]
