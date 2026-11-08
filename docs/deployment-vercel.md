# Vercel Deployment Architecture & Production Guide

This guide details the deployment of **Bharatiya Bajar** to Vercel and production cloud infrastructure.

---

## 1. Architecture Overview

```
                      +---------------------------------------+
                      |           Vercel Platform             |
                      |   (BOM1 Mumbai / Serverless Edge)     |
                      |                                       |
                      |   - Next.js 14 App Router             |
                      |   - Static Pages (SSG / ISR)          |
                      |   - Dynamic Route Handlers            |
                      |   - SSE Streams + Polling Fallback    |
                      +-------------------+-------------------+
                                          |
                                          | Database Connection (TLS)
                                          v
                      +---------------------------------------+
                      |         Production Database           |
                      |   (Turso libSQL / Supabase / Neon)    |
                      |                                       |
                      |   - 4,943 Active Companies Master     |
                      |   - 20 Standardized Taxonomies        |
                      |   - Real Live Quotes & 5Y History     |
                      +-------------------+-------------------+
                                          ^
                                          | Ingestion Writes
                                          |
                      +-------------------+-------------------+
                      |       Background Worker Host          |
                      |     (Railway / Render / Fly.io)       |
                      |                                       |
                      |   - BSE / NSE Bhavcopy Ingestion      |
                      |   - Real-time Price Poller            |
                      |   - BullMQ / Cron Scheduler           |
                      +---------------------------------------+
```

---

## 2. Serverless Constraints & Solutions

| Feature | Local Dev | Vercel Serverless | Solution |
| :--- | :--- | :--- | :--- |
| **Database** | \`market.db\` (local SQLite) | Read-only ephemeral filesystem | **Turso (libSQL)** or **Neon PostgreSQL**. Connection URI set via \`DATABASE_URL\`. |
| **Server-Sent Events** | Long-lived persistent HTTP connection | 15s (Hobby) / 60s (Pro) Lambda timeouts | Client SSE auto-reconnects with exponential backoff; automatically falls back to **15s polling** if SSE connection is closed or throttled. |
| **Background Ingestion** | Local node scripts (\`pnpm worker\`) | Background daemons not supported on Vercel | Hosted worker process on Railway/Render or Vercel Cron triggers (\`/api/cron/quotes\`). |
| **Page Caching** | Dynamic | ISR with \`revalidate: 60\` | Incremental Static Regeneration caches directory & sector pages for fast TTFB (<50ms). |

---

## 3. Environment Variables Configuration

Set these in the **Vercel Project Settings > Environment Variables**:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| \`DATABASE_URL\` | Database connection string (libSQL/Postgres) | \`libsql://bharatiya-bajar-db.turso.io\` |
| \`DATABASE_AUTH_TOKEN\` | Auth token for Turso / libSQL | \`eyJhbGciOi...TOKEN\` |
| \`DATA_PROVIDER\` | Active market data provider | \`real\` |
| \`NEXT_PUBLIC_BASE_URL\` | Production domain URL | \`https://bharatiyabajar.in\` |
| \`CRON_SECRET\` | Secret key protecting scheduled API cron routes | \`secret_random_token_here\` |

---

## 4. Health Check & Monitoring

The health check endpoint is available at:
\`\`\`http
GET /api/health
\`\`\`

**Sample 200 OK Response:**
\`\`\`json
{
  "status": "OK",
  "timestamp": "2026-11-08T05:00:00.000Z",
  "uptimeSeconds": 1420,
  "database": {
    "healthy": true,
    "activeCompanies": 4943,
    "liveQuotesCached": 4878,
    "latestQuoteTime": "2026-11-07 16:00:00"
  },
  "version": "1.0.0",
  "environment": "production"
}
\`\`\`

---

## 5. Deployment Step-by-Step

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "feat: responsive touch header and vercel readiness pass"
   git push origin main
   \`\`\`

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select the repository.
   - Set framework preset to **Next.js**.
   - Add environment variables (\`DATABASE_URL\`, \`DATABASE_AUTH_TOKEN\`, \`DATA_PROVIDER=real\`).
   - Click **Deploy**.

3. **Verify Deployment**:
   - Inspect build logs: ensure zero type errors and zero compilation warnings.
   - Visit \`https://your-deployment.vercel.app/api/health\` to verify DB and quote health.
   - Verify responsive behavior on mobile (320px–430px) and desktop.
