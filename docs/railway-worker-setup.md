# Railway Background Worker Deployment Guide

The BharatBazaar Live Quote Worker runs continuously to refresh Indian Benchmark Indices and universe-wide Bhavcopy quotes into hosted Neon PostgreSQL.

## 3-Step Setup

### Step 1: Create a New Service on Railway
1. Go to [railway.app](https://railway.app) and sign in.
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select `jitendrakokate18-star/bharatbazaar`.

### Step 2: Configure Environment Variables
In your Railway service dashboard, navigate to **Variables** and add:
- `DATABASE_URL`: Your pooled Neon connection string (`POSTGRES_PRISMA_URL`).
- `DIRECT_URL`: Your unpooled Neon connection string (`POSTGRES_URL_NON_POOLING`).
- `NODE_ENV`: `production`

*(Note: Do not commit secrets. Railway securely injects these environment variables at container startup).*

### Step 3: Deploy
1. Railway detects the `Dockerfile` and `railway.json` automatically.
2. Click **Deploy**.
3. Inspect the deploy logs: you will see:
   ```text
   Starting LiveQuoteWorker (mode: CONTINUOUS_LOOP)...
   [<timestamp>] LiveQuoteWorker tick: Status = OPEN / CLOSED
   [<timestamp>] Ingesting real live quotes and 5-year history for Indian Benchmark Indices...
   [<timestamp>] LiveQuoteWorker iteration completed successfully.
   ```
4. The service will run 24/7 with automatic restart policy (`restartPolicyType: ALWAYS`).
