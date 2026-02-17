# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-15 16:30 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Rock-solid foundation + Mobile-first + Guest Play"

---

## 📊 Backlog Overview (Synced)

| Priority | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **P0** (Critical) | 0 | 2 | **2** |
| **P1** (High) | 11 | 13 | **24** |
| **P2** (Medium) | 25 | 15 | **40** |
| **TOTAL** | **36** | **30** | **66** |

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [GUEST-PLAY] Finalize Public AI Flow (BE #110)
**Impact:** Allows users to play without Google Login. Increases conversion.  
**Status:** IMPLEMENTED (Backend). Testing in Production.
**Acceptance Criteria:**
- `/ai/*` and `/game/stream` endpoints accessible without Bearer token
- Server-side API Keys (Gemini/Pollinations) used for guest sessions
- Auth required ONLY for `/game/save`, `/game/list`, etc.

**Action:** VALIDATE PRODUCTION FLOW

---

### 2. [P0] [BUG] Sync currentOptions State (FE #87)
**Impact:** Buttons are not updating correctly with Gemini's response, breaking the gameplay loop.
**Status:** ✅ RESOLVED (2026-02-17)
**Acceptance Criteria:**
- Refactor buffer handling in `useGameStream` to avoid JSON fragmentation
- Ensure `currentOptions` reflects latest AI choice at all times

**Action:** REFACTOR FE STATE LOGIC (Completed)

---

### 3. [P0] Backend AI Orchestration & Context Management (BE #1)
**Impact:** Story coherence and long-term session stability.  
**Acceptance Criteria:**
- NestJS service for prompt assembly with context (last 10 turns)
- Token counting and window management to avoid AI context overflow

**Action:** IMPLEMENT PROMPT ASSEMBLY SERVICE

---

### 4. [P1] [STABILITY] Global Exception Filter & Validation (BE #18, #87)
**Impact:** Standardizes error responses and prevents malformed requests.
**Acceptance Criteria:**
- Global `ExceptionFilter` implemented
- `class-validator` configured for all DTOs

**Action:** SETUP PIPES & FILTERS

---

### 5. [P1] [UX] Mobile-First Cinematic Layout (FE #67)
**Impact:** Essential for North Star mobile goal.
**Acceptance Criteria:**
- Hit-areas >= 44px
- Responsive Bottom Sheet for narrative text

**Action:** OPTIMIZE MOBILE UI

---

### 6. [P1] [INFRA] Local GPU Image Generation (Issue #111)
**Impact:** Zero cost image generation, higher quality (SDXL/Flux), and faster iterations using local RTX 3060.
**Status:** ✅ OPERATIONAL. Tunnel active and connected to Render.
**Acceptance Criteria:**
- Local inference server running on local machine (SDXL-Lightning)
- Secure tunnel exposing API to Render backend (Cloudflare Tunnel)
- Backend strategy prioritizing Local GPU

**Action:** MONITOR STABILITY

---

### 7. [P1] [QA] Robust PR Validation Pipeline (Issue #112)
**Impact:** Prevents regressions and broken builds from reaching `main`.
**Acceptance Criteria:**
- PR Verify includes: Linting, Type Checking, Unit Tests, and E2E Smoke Tests.
- Mandatory status checks enabled on GitHub for both repos.
- Automated "Test Summary" posted on every PR.

**Action:** HARDEN GITHUB ACTIONS WORKFLOWS

---

### 8. [P1] [TEST] Full App E2E Coverage (Playwright) (Issue #113)
**Impact:** Verifies every user journey is functional before deployment.
**Acceptance Criteria:**
- Tests for: Adventure Selection, Settings (Language/Theme), and Game Loop.
- Integration tests with mocked AI responses for deterministic CI runs.
- Visual regression snapshots for critical UI components.

**Action:** EXPAND PLAYWRIGHT TEST SUITE

---

## 🔥 BLOCKERS

None.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Mobile UX foundation + Guest Play  
**Burn Rate:** ~85% complete ⚡

### Recently Completed:
- ✅ **BE #80**: Conditional AI Key Fallback (Hardened server security)
- ✅ **BE #110**: Guest Play Implementation (Public AI endpoints)
- ✅ **FE #108**: Translation key leak fixed and merged to main
- ✅ **CRON**: PR Manager now fixes builds automatically
- ✅ **SYSTEM**: Gateway restarted to fix latency issues

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #108** - Merge translation fixes to `main`
2. **FE #87** - Refactor SSE buffer logic
3. **BE #18** - Implement ValidationPipe

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-16 01:00 CET  
