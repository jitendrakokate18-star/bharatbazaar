# Baseline Coverage Audit Report (Before Fixes)
**Audit Date**: 2026-11-08  
**System Clock**: 2026-11-08T03:23:12.834Z  
**Target Universe**: All Indian Listed Companies (BSE + NSE)

---

## 1. Full Universe Coverage Summary

| Metric | Count | Percentage of Universe (4943) |
| :--- | :--- | :--- |
| **Total Companies in Master** | **4943** | 100.00% |
| **Active Companies** | **4943** | 100.00% |
| **Companies with Live Price Quote** | **27** | 0.55% |
| **Quotes Newer Than 1 Trading Day** | **27** | 0.55% |
| **Price History Rows (>= 1,000 Days)** | **27** | 0.55% |
| **Latest Price History Date in DB** | **2026-11-06** | — |
| **Annual Financials (FY26 Present)** | **24** | 0.49% |
| **Quarterly Financials** | **25** | 0.51% |
| **Shareholding Pattern (Latest Q1/Q2 FY27)** | **25** | 0.51% |
| **Corporate Actions** | **25** | 0.51% |
| **Company Profile / Background (EN)** | **0** | 0.00% |
| **Company Profile / Background (MR)** | **0** | 0.00% |
| **Classified Sector (non-General)** | **0** | 0.00% |
| **Classified Industry (non-General)** | **0** | 0.00% |
| **Logos** | **0** | 0.00% |

---

## 2. Root Cause Analysis: Exact Locations Where Ingestion Skipped Universe

The audit revealed 6 distinct bottlenecks that caused data ingestion to be restricted exclusively to ~27 companies while leaving all remaining ~4,916 companies as empty shells:

1. **Hardcoded Symbol & BSE Code Allowlist in Price Ingestion**
   - **File**: `scripts/ingestPrices.ts` (Lines 23–30)
   - **Reason**: The SQL query explicitly filters:
     ```ts
     WHERE nse_symbol IN (
       'RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'HINDUNILVR', 'ITC', 'TITAN',
       'NESTLEIND', 'BRITANNIA', 'DABUR', 'ASIANPAINT', 'BAJAJ-AUTO', 'M&M',
       'PIDILITIND', 'EICHERMOT', 'ZOMATO', 'CDSL', 'MCX', 'IRCTC', 'COALINDIA',
       'INFY', 'MARICO', 'GODREJCP', 'VBL', 'HAVELLS', 'PGHH', '20MICRONS'
     ) OR bse_code IN ('500325', '532540', '500180', '542651', '533022', '500570', '500696', '500875', '500114')
     ```
   - **Impact**: All ~4,916 other companies were completely excluded from live prices and 5-year OHLCV backfill.

2. **Hardcoded Priority Symbols in Financials & Corporate Actions Ingestion**
   - **File**: `scripts/ingestFinancials.ts` (Lines 32–40)
   - **Reason**: Hardcoded array of 27 priority symbols:
     ```ts
     const prioritySymbols = targetSymbols || [
       'RELIANCE', 'TCS', 'HDFCBANK', 'CDSL', '20MICRONS', ...
     ];
     ```
   - **Impact**: Annual financials, quarterly results, shareholding patterns, and corporate actions were only ingested for those 27 companies.

3. **Master Ingestion Hardcoded Defaults for Sector and Industry**
   - **File**: `scripts/ingestMaster.ts` (Lines 202–205)
   - **Reason**: During company insertion, sector and industry were hardcoded to literals:
     ```ts
     'General',
     'सामान्य',
     'Equity',
     'इक्विटी शेअर्स',
     ```
   - **Impact**: Zero companies outside the manual test seeds had actual sectors or industries stored in the database. BSE Scrip API's `Industry` field and NSE classifications were ignored.

4. **Live Worker Default Execution Restricted to Priority List**
   - **File**: `scripts/worker.ts` (Line 17)
   - **Reason**: `await ingestCompanyPricesAndHistory();` was invoked without arguments, which triggered the fallback query restricted to the 27 priority companies.

5. **Search Query Excluded Sector, Category & Marathi Aliases**
   - **File**: `lib/dbService.ts` (Lines 582–638)
   - **Reason**: The `search()` query only queried:
     ```sql
     WHERE LOWER(name) LIKE ? OR LOWER(name_mr) LIKE ? OR LOWER(isin) LIKE ? OR LOWER(nse_symbol) LIKE ? OR bse_code LIKE ?
     ```
   - **Impact**: Searching for categories/sectors like "FMCG", "Automobile", "Banks", "IT", or Marathi queries like "वाहन" or "बँका" returned 0 results.

6. **Directory Filter Hardcoded Sector Dropdown Disconnected from DB**
   - **File**: `app/directory/page.tsx` (Lines 83–96)
   - **Reason**: Hardcoded array of sectors (`FMCG`, `Automobile`, etc.) did not match database records where 99.4% of companies were labeled `General`. Filtering by any sector returned an empty table.

---

## 3. Sample of 20 Random Companies Outside the Original 27

| # | ISIN | Company Name | Symbol / Code | Live Price | OHLCV Days | Annual Fin | Qtr Fin | Shareholding | Actions | Profile (EN/MR) | Sector |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `INE00Q901014` | S. M. Gold Limited | `542034` | None | 0 | None | None | None | 0 | No / No | General |
| 2 | `INE499A01024` | DCM Shriram Limited | `DCMSHRIRAM` | None | 0 | None | None | None | 0 | No / No | General |
| 3 | `INE131D01019` | G.k.Consultants Ltd. | `531758` | None | 0 | None | None | None | 0 | No / No | General |
| 4 | `INE221H01019` | GTL Infrastructure Limit | `GTLINFRA` | None | 0 | None | None | None | 0 | No / No | General |
| 5 | `INE757B01015` | TRANSWORLD SHIPPING LINE | `TRANSWORLD` | None | 0 | None | None | None | 0 | No / No | General |
| 6 | `INE14VP01014` | JD CABLES LIMITED | `544524` | None | 0 | None | None | None | 0 | No / No | General |
| 7 | `INE920C01017` | NTC Industries Limited | `NTCIND` | None | 0 | None | None | None | 0 | No / No | General |
| 8 | `INE640C01011` | Shah Alloys Limited | `513436` | None | 0 | None | None | None | 0 | No / No | General |
| 9 | `INE797C01019` | Siddheswari Garments Ltd | `526877` | None | 0 | None | None | None | 0 | No / No | General |
| 10 | `INE340U01010` | Autoriders International | `512277` | None | 0 | None | None | None | 0 | No / No | General |
| 11 | `INE951I01027` | V-Guard Industries Limit | `VGUARD` | None | 0 | None | None | None | 0 | No / No | General |
| 12 | `INE807O01011` | SDC TECHMEDIA LIMITED | `535647` | None | 0 | None | None | None | 0 | No / No | General |
| 13 | `INE998H01012` | Oriental Trimex Limited | `ORIENTALTL` | None | 0 | None | None | None | 0 | No / No | General |
| 14 | `INE665D01016` | Bengal Tea & fabrics Ltd | `532230` | None | 0 | None | None | None | 0 | No / No | General |
| 15 | `INE822Q01015` | Sarvottam Finvest Limite | `539124` | None | 0 | None | None | None | 0 | No / No | General |
| 16 | `INE845D01014` | Ganesha Ecosphere Limite | `GANECOS` | None | 0 | None | None | None | 0 | No / No | General |
| 17 | `INE003A01024` | Siemens Limited | `SIEMENS` | None | 0 | None | None | None | 0 | No / No | General |
| 18 | `INE0WR901013` | AEGEUS TECHNOLOGIES LIMI | `544858` | None | 0 | None | None | None | 0 | No / No | General |
| 19 | `INE813H01021` | Torrent Power Limited | `TORNTPOWER` | None | 0 | None | None | None | 0 | No / No | General |
| 20 | `INE792H01019` | Global Vectra Helicorp L | `GLOBALVECT` | None | 0 | None | None | None | 0 | No / No | General |

---

## 4. Key Takeaway & Action Plan

Currently, **4,918 out of 4,943 companies (99.49%)** are unpopulated shells due to hardcoded allowlists and missing taxonomy mappings.
The next phases will:
1. Strip all allowlists and implement a scalable, queued batch ingestion pipeline.
2. Build bulk bhavcopy ingestion for 5-year OHLCV covering 100% of equities.
3. Batch-fetch live ~15-minute quotes in multi-symbol requests (100–200 per call) for the entire universe.
4. Normalize and populate sector taxonomy (English + Marathi + aliases) for all companies and wire up full-text search.
5. Ingest fundamentals, shareholding, corporate actions, and bilingual company profiles with graceful on-demand hydration.
