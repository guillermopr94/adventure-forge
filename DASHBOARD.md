# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-18 00:20 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Stability + Performance + Developer Experience"

---

## 📊 Backlog Overview (Synced with GitHub)

| Priority | Total Issues |
|----------|--------------|
| **P0** (Critical) | 12 |
| **P1** (High) | 26 |
| **P2** (Medium) | 44 |
| **TOTAL OPEN** | **82** |

**Category Breakdown (Est.):**
- 🐛 **Bugs:** 16
- ✨ **Enhancements:** 24
- ⚙️ **Tech Debt / Refactor:** 22
- 🏗️ **Infrastructure:** 10
- 🧪 **Testing:** 5

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [BUG] Sync currentOptions State (Issue #87, #92, #93, #94)
**Impact:** Gameplay loop breakage; users see placeholder options instead of AI choices.  
**Acceptance Criteria:**
- **#92**: Atomic Stream Event Handling & JSON Robustness.
- **#93**: Reactive Option State Subscription in Game View.
- **#94**: Dynamic Option Buttons & Touch-Friendly Layout.
- **Goal**: Option buttons update immediately with AI content, no placeholders.

---

### 2. [P0] [BUG] Translation Keys Leak (Issue #108, #95)
**Impact:** UI shows raw i18n keys (e.g., `game.loading`) in production.  
**Acceptance Criteria:**
- Merge fix/option-buttons-react-state into main.
- Verify all cinematic strings render correctly in English/Spanish.
- **Goal**: No raw translation keys in the production UI.

---

### 3. [P0] [UX] Mobile-First Narrative Layout (Issue #67, #99, #100)
**Impact:** North Star mobile goal. Essential for touch-screen play.  
**Acceptance Criteria:**
- **#99**: Touch targets >= 44px.
- **#100**: Bottom Sheet Layout for narrative text on small screens.
- **Goal**: Fluid, readable experience on iPhone SE to iPhone 15 viewports.

---

### 4. [P0] [UX] Auth Error Handling in Stream (Issue #96, #104, #105)
**Impact:** User frustration when session expires mid-story or starting unlogged.  
**Acceptance Criteria:**
- **#104**: Detection of 401/Unauthorized in `useGameStream`.
- **#105**: User-friendly "Session Expired" modal in Game View.
- **#96**: Gate 'Start Adventure' for unlogged users.

---

### 5. [P1] [TECH DEBT] Frontend Migration to Vite (Issue #109, #113, #114, #115, #116)
**Impact:** Dev stability and build speed. CRA is deprecated.  
**Acceptance Criteria:**
- **#113**: Dependencies installed.
- **#114**: Config & Env variables updated.
- **#115**: Entry point relocated.
- **#116**: Vercel deployment synced.

---

## 🔥 BLOCKERS

- **NONE**: Focus is on stability and tech-debt reduction.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Tech Debt + Mobile UX  
**Burn Rate:** Issues closed: 32. Open: 82.

### Recently Completed:
- ✅ **FE #34**: Narrative text visibility fix
- ✅ **BE #63**: Refactor Option Buttons to React State
- ✅ **CI #38**: Docker Compose for Integrated E2E Testing

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #108** - Merge fix for translation leak.
2. **FE #92** - Implementation of atomic SSE buffer processing.
3. **FE #113** - Start Vite migration.

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-18 01:00 CET  
