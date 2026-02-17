# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-17 15:10 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Stability + Performance + Developer Experience"

---

## 📊 Backlog Overview (Synced with GitHub)

| Priority | Total Issues |
|----------|--------------|
| **P0** (Critical) | 11 |
| **P1** (High) | 25 |
| **P2** (Medium) | 30 |
| **TOTAL OPEN** | **66** |

**Category Breakdown:**
- 🐛 **Bugs:** 12
- ✨ **Enhancements:** 19
- ⚙️ **Tech Debt / Refactor:** 16
- 🏗️ **Infrastructure:** 5
- 🧪 **Testing:** 1

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [BUG] Sync currentOptions State (Issue #87)
**Impact:** Gameplay loop breakage; users see placeholder options instead of AI choices.  
**Acceptance Criteria:**
- Atomic Stream Event Handling implemented (#92)
- Reactive Option State Subscription functional (#93)
- Dynamic Option Buttons UI updated (#94)
**Status:** IN ANALYSIS.

---

### 2. [P0] [BUG] Translation Keys Leak (Issue #108, #95)
**Impact:** UI shows raw i18n keys (e.g., `game.loading`) in production.  
**Acceptance Criteria:**
- Merge fix for missing translation bundles in production build
- Verify all cinematic strings render correctly in English/Spanish
**Status:** OPEN.

---

### 3. [P0] [UX] Mobile-First Narrative Layout (Issue #99, #100)
**Impact:** North Star mobile goal. Essential for touch-screen play.  
**Acceptance Criteria:**
- Touch targets >= 44px (#99)
- Bottom Sheet Layout for narrative text on small screens (#100)
**Status:** OPEN.

---

### 4. [P0] [UX] Auth Error Handling in Stream (Issue #96, #104, #105)
**Impact:** User frustration when session expires mid-story.  
**Acceptance Criteria:**
- Detection of 401/Unauthorized in `useGameStream` (#104)
- User-friendly "Session Expired" modal (#105)
**Status:** OPEN.

---

### 5. [P1] [TECH DEBT] Frontend Migration to Vite (Issue #109)
**Impact:** Developer experience, build speed, and HMR stability.  
**Acceptance Criteria:**
- CRA removed, Vite dependencies installed (#113)
- Environment variables & build pipeline updated (#114, #116)
**Status:** IN PROGRESS (Sub-tasks #113-#116 created).

---

## 🔥 BLOCKERS

- **NONE**: Focus is on stability and tech-debt reduction.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Tech Debt + Mobile UX  
**Burn Rate:** Steady. 6 issues closed since last major milestone.

### Recently Completed:
- ✅ **FE #34**: Narrative text visibility fix (Image skip bug)
- ✅ **BE #63**: Refactor Option Buttons to React State
- ✅ **CI #38**: Docker Compose for Integrated E2E Testing

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #108** - Root cause analysis of i18n leak in production
2. **FE #92** - Implementation of atomic SSE buffer processing
3. **FE #113** - Start Vite migration dependencies install

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-18 01:00 CET  
