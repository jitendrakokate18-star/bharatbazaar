# Bharatiya Bajar (भारतीय बाजार)
### Indian Listed Companies Intelligence Platform (BSE + NSE) — Bilingual (English / मराठी)

Specially designed for Dad and Indian retail investors to explore actively listed BSE and NSE companies, discover consumer brand-to-company parent mappings, review live prices side-by-side on both exchanges, and analyze 5-year financials and ratios with instant one-click switching between English and authentic Marathi.

---

## 🌟 Key Features

### 1. Bilingual Architecture (English ⇄ मराठी)
- **One-Click Instant Toggle (`EN | मराठी`)**: Switches 100% of the UI, financial labels, company backgrounds, and brand profiles instantly with **zero page reload**.
- **Financial Glossary**: Consistent, authentic Marathi finance terminology (e.g., *Market Cap → बाजार भांडवल*, *Dividend Yield → लाभांश दर*, *Promoter → प्रवर्तक*, *Net Profit → निव्वळ नफा*).
- **Marathi Numerals Toggle (`१२३` / `123`)**: One-click toggle between standard Indian digits (`₹1,23,456.78`) and Devanagari numerals (`₹१,२३,४५६.७८`).
- **Dad Accessibility Controls**: Direct font size scaler (`A Normal` / `A+ Large` / `A++ Big`) crafted for high readability on phones and tablets.
- **Light & Dark Themes**: High-contrast, finance-grade palette.

### 2. Company-to-Brand Intelligence
- **Brand Hierarchy**: Maps famous everyday products (Maggi, Tanishq, Surf Excel, Vicks, Fevicol, Royal Enfield, Horlicks, Blinkit, Aashirvaad, etc.) directly to their listed parent entities on BSE and NSE.
- **Conditional Brand Grid**: Rendered on conglomerate profiles; completely hidden for standalone companies (CDSL, MCX, IRCTC, TCS, Infosys) as required by the PRD.
- **Dedicated Brand Pages (`/brand/[id]`)**: Displays brand history, product lineup, positioning, and parent company live exchange prices.

### 3. Dual Exchange Live Quotes (NSE + BSE)
- **Side-by-Side Live Quotes**: Real-time ticker cards showing LTP, Change, Change %, Day High/Low, 52-Week High/Low, and Volume.
- **Real-Time Pulse Animations**: Green flash on upticks, red flash on downticks.
- **Market Status & IST Clock**: Detects Open, Pre-Open, Closed, and Weekend market states based on IST market hours (9:15 AM - 3:30 PM).
- **Server-Sent Events (SSE)**: Live price stream `/api/stream?isins=...`.

### 4. 5-Year Performance & Financial Track Record
- **Interactive Recharts**: 1M, 6M, 1Y, 3Y, 5Y, and MAX performance chart.
- **Benchmark Overlay**: One-click overlay comparison vs Nifty 50 benchmark.
- **Return Metrics**: Compound Annual Growth Rate (CAGR) and Absolute Return calculations.
- **5-Year Financial Statements**: Annual Revenue, Operating Profit, Operating Margin %, Net Profit (PAT), EPS, Total Debt, and Net Worth.
- **5-Year Valuation Ratios**: P/E, P/B, ROE, ROCE, Debt-to-Equity, and Dividend Payout %.
- **Shareholding Pattern**: Promoter, FII, DII, and Public breakdown with promoter pledge alerts.
- **Corporate Actions**: Dividend history, stock splits, bonus issues, and rights dates.

### 5. Global Search & Discovery
- **Autocomplete Global Search**: Search across company names, NSE symbols, BSE scrip codes, ISINs, and consumer brands in English or Devanagari (e.g. "Maggi", "मॅगी", "फेविकॉल", "TATAMOTORS", "500570").
- **Directory (`/directory`)**: Filter by exchange, sector, market cap tier (Large, Mid, Small), and "Has Brands Only" toggle.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Typography (`Noto Sans Devanagari` & `Inter`)
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Provider Abstraction**: `StockDataProvider` interface with `MockStockDataProvider` (swap-ready for official exchange feeds)
- **Testing**: Node.js Native Test Runner (`node --test`)

---

## 🧪 Automated Tests
Run the test suite:
```bash
npm test
```
**Tests Covered**:
1. Corporate Action adjustments (stock splits & bonus issues on historical OHLC).
2. ISIN-based merging of NSE and BSE security listings.
3. Bilingual translation fallbacks (never blank, zero unhandled errors).
4. Indian currency formatting (Lakh/Crore) and Devanagari numeral conversions.
5. Financial mathematics (CAGR and Absolute Return algorithms).

---

## 🚀 Running the Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
