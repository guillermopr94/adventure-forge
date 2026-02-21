# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-21 21:40 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Stability + Performance + Developer Experience"

---

## 📊 Backlog Overview (Synced with GitHub)

| Priority | Total Issues |
|----------|--------------|
| **P0** (Critical) | 17 (+2 NEW) |
| **P1** (High) | 22 |
| **P2** (Medium) | 48 |
| **TOTAL OPEN** | **87** |

**Category Breakdown (Est.):**
- 🐛 **Bugs:** 18 (+2)
- ✨ **Enhancements:** 24
- ⚙️ **Tech Debt / Refactor:** 24
- 🏗️ **Infrastructure:** 10
- 🧪 **Testing:** 7 (+1)

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 0. [P0] [BUG] Audio Endpoint 401 for Guest Users (Issue #152) **🆕 URGENT**
**Impact:** Audio completely broken for unauthenticated users in production.  
**Acceptance Criteria:**
- ✅ **BE #107**: Remove AuthGuard from AI endpoints. [BREAKDOWN DONE]
- **FE #154**: Validate audio works for guests after backend deploy. [BREAKDOWN DONE]
- **Goal**: Guest users can hear audio narration without 401 errors.

---

### 1. [P0] [BUG] Sync currentOptions State (Issue #87, #92, #93, #121, #122)
**Impact:** Gameplay loop breakage; users see placeholder options instead of AI choices.  
**Acceptance Criteria:**
- ✅ **FE #121**: Implement Atomic SSE Message Reassembly (prevents JSON corruption).
- **#93**: Reactive Option State Subscription in Game View. [BREAKDOWN DONE: #130, #131]
- **#92**: Atomic Stream Event Handling & JSON Robustness. [ANALYSIS DONE: #122]
- **Goal**: Option buttons update immediately with AI content, no placeholders.

---

### 2. [P0] [BUG] Translation Keys Leak (Issue #108, #119)
**Impact:** UI shows raw i18n keys (e.g., `game.loading`) in production.  
**Acceptance Criteria:**
- **#119**: Ensure i18n Resilience & Fallback Support. [BREAKDOWN DONE: #127, #128, #129]
- **#108**: Fix raw keys leaking in production build.
- **Goal**: No raw translation keys in the production UI.

---

### 3. [P0] [UX] Mobile-First Narrative Layout (Issue #67, #99, #100, #123)
**Impact:** North Star mobile goal. Essential for touch-screen play.  
**Acceptance Criteria:**
- **#99**: Touch targets >= 44px.
- **#100**: Bottom Sheet Layout for narrative text on small screens. [ANALYSIS DONE: #123]
- **Goal**: Fluid, readable experience on iPhone SE to iPhone 15 viewports.

---

### 4. [P0] [UX] Auth Error Handling in Stream (Issue #96, #104, #105, #120)
**Impact:** User frustration when session expires mid-story or starting unlogged.  
**Acceptance Criteria:**
- **#120**: Add 'Retry' & 'Return to Menu' to Session Expired Modal. [BREAKDOWN DONE: #124, #125, #126]
- **#104**: Detection of 401/Unauthorized in `useGameStream`.
- **#105**: User-friendly "Session Expired" modal in Game View.
- **Goal**: Prevent "black hole" states on auth expiration.

---

### 5. [P1] [TECH DEBT] Frontend Migration to Vite (Issue #109, #113, #114, #115, #116)
**Impact:** Dev stability and build speed. CRA is deprecated.  
**Acceptance Criteria:**
- **#113-116**: Systematic migration (Dependencies -> Config -> Entry point -> Vercel).
- **#117/118**: Architecture cleanup (God Component decomposition).
- **Goal**: Complete switch to Vite for improved DX and stability.

---

## 🔥 BLOCKERS

- **NONE**: Focus is on stability and tech-debt reduction.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Tech Debt + Mobile UX  
**Burn Rate:** Issues closed: 35. Open: 85.

### Recently Completed:
- ✅ **FE #121**: Atomic SSE Message Reassembly & JSON robustness
- ✅ **FE #34**: Narrative text visibility fix
- ✅ **BE #63**: Refactor Option Buttons to React State
- ✅ **CI #38**: Docker Compose for Integrated E2E Testing

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #119** - Fix translation resilience.
2. **FE #113** - Start Vite migration.
3. **FE #93** - Reactive Option State Subscription in Game View.

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-19 04:00 CET  
