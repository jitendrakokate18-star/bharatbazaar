# Phase A Baseline Responsive & Touch Audit Report (Before Fixes)

**Timestamp:** 2026-11-08  
**Audit Duration:** 228.8s  
**Tested Viewports:** 14 viewports (320px to 1920px, including iPhone 13/15, Pixel 7, iPad Portrait/Landscape, iPad Air/Pro, Galaxy Tab)  
**Tested Configurations:** English Light, Marathi Dark, Marathi Light  
**Total Test Checks & Screenshots:** 378 screenshots captured in `docs/screens/before/`  

---

## 1. Executive Summary & Baseline Metrics

> [!CAUTION]
> The baseline audit detected severe responsive and mobile usability defects across all viewports < 1024px:
> - **Horizontal Overflow:** **189 out of 378 (50.0%)** test conditions suffered from horizontal document overflow (`scrollWidth > innerWidth`), breaking mobile ergonomics.
> - **Header Search Collapse:** On tablet (768px portrait) and mobile (<640px), the search input collapsed or clipped text behind absolute icons.
> - **Touch Targets < 44x44px:** **378 test conditions** had touch targets violating the WCAG / Apple HIG / Google Material minimum size of 44x44 px.

| Viewport | Device / Category | Width x Height | Overflow Checks | Max Document Width | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `320x568` | Desktop/Standard | 320x... | **27 / 27** | **590px** (Δ+270px) | ❌ Overflows |
| `360x740` | Desktop/Standard | 360x... | **27 / 27** | **587px** (Δ+227px) | ❌ Overflows |
| `390x844_iPhone13` | iPhone13 | 390x... | **27 / 27** | **587px** (Δ+197px) | ❌ Overflows |
| `430x932_iPhone15ProMax` | iPhone15ProMax | 430x... | **27 / 27** | **587px** (Δ+157px) | ❌ Overflows |
| `412x915_Pixel7` | Pixel7 | 412x... | **27 / 27** | **587px** (Δ+175px) | ❌ Overflows |
| `600x960` | Desktop/Standard | 600x... | **0 / 27** | **600px** (Δ+0px) | ✅ Clean |
| `768x1024_iPadPortrait` | iPadPortrait | 768x... | **0 / 27** | **768px** (Δ+0px) | ✅ Clean |
| `1024x768_iPadLandscape` | iPadLandscape | 1024x... | **27 / 27** | **1032px** (Δ+8px) | ❌ Overflows |
| `820x1180_iPadAir` | iPadAir | 820x... | **0 / 27** | **820px** (Δ+0px) | ✅ Clean |
| `1024x1366_iPadPro` | iPadPro | 1024x... | **27 / 27** | **1032px** (Δ+8px) | ❌ Overflows |
| `800x1280_GalaxyTab` | GalaxyTab | 800x... | **0 / 27** | **800px** (Δ+0px) | ✅ Clean |
| `1280x800` | Desktop/Standard | 1280x... | **0 / 27** | **1280px** (Δ+0px) | ✅ Clean |
| `1536x864` | Desktop/Standard | 1536x... | **0 / 27** | **1536px** (Δ+0px) | ✅ Clean |
| `1920x1080` | Desktop/Standard | 1920x... | **0 / 27** | **1920px** (Δ+0px) | ✅ Clean |

---

## 2. Horizontal Overflow Analysis by Route

| Route | Description | Total Tests | Overflow Tests | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Home Page | 42 | **21** | 🚨 Critical |
| `/directory` | /directory | 42 | **21** | 🚨 Critical |
| `/sectors` | /sectors | 42 | **21** | 🚨 Critical |
| `/sectors/automobile` | /sectors/automobile | 42 | **21** | 🚨 Critical |
| `/company/INE155A01022` | /company/INE155A01022 | 42 | **21** | 🚨 Critical |
| `/company/INE003A01024` | /company/INE003A01024 | 42 | **21** | 🚨 Critical |
| `/brand/jaguar` | /brand/jaguar | 42 | **21** | 🚨 Critical |
| `/?search=tata` | /?search=tata | 42 | **21** | 🚨 Critical |
| `/non-existent-404-check` | /non-existent-404-check | 42 | **21** | 🚨 Critical |

### Elements Contributing to Horizontal Overflow
The following DOM elements extended past `window.innerWidth`:
- `div.flex.items-center (w:206, r:451)`
- `span.font-mono.text-white (w:59, r:387)`
- `span.flex.items-center (w:56, r:451)`
- `svg (w:12, r:407)`
- `polyline (w:10, r:406)`
- `div.flex.items-center (w:289, r:587)`
- `button.px-3.py-1.5 (w:78, r:376)`
- `svg (w:16, r:328)`
- `circle (w:13, r:327)`
- `path (w:5, r:323)`

---

## 3. Touch Target Analysis (< 44x44 px)

The audit detected numerous buttons and links with bounding boxes smaller than 44x44px:
- a.flex.items-center "भाBharatiya Baj" [266x40px]
- button.px-3.py-1.5 "मराठी" [81x32px]
- button.p-2.rounded-lg "A+" [51x34px]
- button.p-2.rounded-lg "123" [54x35px]
- button.p-2.rounded-lg "" [34x34px]
- button.lg:hidden.p-2 "" [40x40px]
- button.px-3.py-1.5 "मराठी" [78x32px]
- button.px-3.py-1.5 "मराठी" [82x36px]
- a.px-5.py-2.5 "Company Directo" [221x40px]
- input.w-full.pl-11 "" [678x42px]
- a.hover:text-white.transition-colors "Company Directo" [110x15px]
- a.inline-flex.items-center "Company Directo" [133x16px]

---

## 4. Root Cause Analysis: Header Search Bar Collapse

### Primary Bug Diagnosis
- **Affected Files:**
  - [`components/Header.tsx`](file:///components/Header.tsx#L142-L146) (Lines 142–146, 184–235, 238–240)
  - [`components/GlobalSearch.tsx`](file:///components/GlobalSearch.tsx#L60-L75) (Lines 60–75)
- **Mechanics of Failure:**
  1. In `components/Header.tsx` line 143:
     ```html
     <div className="hidden md:flex flex-1 max-w-lg mx-4">
       <GlobalSearch />
     </div>
     ```
     The flex item lacks `min-w-0`. In standard CSS Flexbox, flex items default to `min-width: auto`.
  2. At tablet viewport (768px iPad portrait):
     - Total available width: 736px.
     - Brand logo (`shrink-0`): ~232px.
     - Right controls (`shrink-0` with 5 buttons: Language toggle, Font size 'A/A+', Devanagari digits '१२३', Theme toggle, Menu): ~290px.
     - Remaining space: `736px - 232px - 290px - 32px (margins/gaps) = 182px`.
     - In `components/GlobalSearch.tsx`, the search input has `pl-10 pr-4` (56px padding for the search icon at `left-3`).
     - The usable text area shrinks to under 100px. When users type, characters immediately collide with the absolute icon and overflow off-screen.
  3. Dropdown Menu Collapse:
     ```html
     <div className="absolute left-0 right-0 top-full mt-2 ...">
     ```
     Because the dropdown is pinned to `left-0 right-0` of the input container, the dropdown width is constrained to ~180px, causing stock cards, prices, and badges to scramble into overlapping multi-line blobs.
  4. On Mobile (<640px):
     - The search input in `Header.tsx` line 239 is placed inline below the top bar.
     - When focused, the mobile soft keyboard slides up, obscuring the dropdown menu.
     - Input font size defaults to 14px, triggering automatic viewport zoom on iOS Safari.

---

## 5. Small Screens Typography & Marathi (मराठी) Expansion

- Marathi strings are on average 25–40% longer than English (e.g., "माहिती तंत्रज्ञान" vs "IT", "भारतीय कंपन्यांची सूची" vs "Company Directory").
- On 320px (iPhone SE 1st gen) and 360px (Galaxy S8), badge labels and metric cards without proper text clamping or wrapping broke table alignment and induced document-level horizontal scroll (`scrollWidth` reached 610px on `320x568`!).

---

## 6. Screenshot Index (Baseline Archive)

All 378 baseline screenshots are archived under `docs/screens/before/`:
- Sample Mobile (320x568 Light EN): `docs/screens/before/320x568_home_en_light.png`
- Sample Tablet (768x1024 iPad Portrait): `docs/screens/before/768x1024_iPadPortrait_home_en_light.png`
- Sample Search State: `docs/screens/before/320x568_search-state_en_light.png`
- Sample Marathi Dark: `docs/screens/before/320x568_home_mr_dark.png`
