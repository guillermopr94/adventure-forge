# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-07 14:00 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Rock-solid foundation + Mobile-first"

---

## 📊 Backlog Overview

| Priority | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **P0** (Critical) | 1 | 1 | **2** |
| **P1** (High) | 5 | 14 | **19** |
| **P2** (Medium) | 14 | 5 | **19** |
| **Untagged** | 0 | 0 | **0** |
| **TOTAL** | 20 | 20 | **40** |

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [BUG] Narrative text hidden if segment image missing (FE #34)
**Impact:** Game-breaking bug. Users lose narrative content.  
**Acceptance Criteria:**
- Text displays even if image generation fails
- Graceful fallback to text-only mode
- User is notified (not blocked)
- "Next" button remains functional

**Action:** START THIS NOW

---

### 2. [P0] [SECURITY] Missing AuthGuard on /game/stream (BE #17)
**Impact:** Unauthorized users can consume AI resources. Potential cost leak.  
**Acceptance Criteria:**
- JWT validation on `/game/stream` endpoint
- 401 response for unauthenticated requests
- Rate limiting per user verified

**Action:** IMMEDIATE FIX REQUIRED

---

### 3. [P0] Backend AI Orchestration & Context Management (BE #1)
**Impact:** Story coherence and long-term session stability.  
**Acceptance Criteria:**
- NestJS service for prompt assembly with context (last 10 turns)
- API endpoints for `next_step` and `get_history` fully functional
- Context compression/summarization logic implemented

**Action:** CORE FEATURE - PRIORITY EXECUTION

---

### 4. [P1] [STABILITY] Implement Global ValidationPipe (BE #18)
**Impact:** Prevents malformed requests. Increases API resilience.  
**Acceptance Criteria:**
- `class-validator` + `class-transformer` configured in `main.ts`
- All incoming DTOs validated automatically
- 400 Bad Request for invalid payloads

**Action:** QUICK WIN - 30 MIN TASK

---

### 5. [P1] AI Infrastructure: Model Fallback & Exponential Retry (FE #3)
**Impact:** High availability of AI services. Supports "Stability First" objective.  
**Status:** Partially implemented
**Acceptance Criteria:**
- Circuit breaker pattern for repeated provider failures
- Automatic fallback to next healthy provider in chain
- Exponential backoff on retries

**Action:** Complete resilience infrastructure

---

## 🔥 BLOCKERS

None identified. Critical issues have clear implementation paths.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Mobile UX foundation  
**Burn Rate:** ~55% complete (12/22 estimated tasks)

### Completed This Sprint:
- ✅ BE #17, #30, #31, #32: Security hardening & stream auth (PR #39 BE, PR #50 FE)
- ✅ AI-001: HuggingFace image fallback
- ✅ CIN-001: Typewriter effect (PR #25)
- ✅ AI-002: Quota monitoring (PR #14)
- ✅ AI-007: Hardened AI prompts & parsing
- ✅ AI-008: Markdown cleanup in narratives
- ✅ FE #9: Game history context loss fix

### In Progress:
- ⏳ #34: Narrative text hidden bug (FE)
- ⏳ #1: Backend context management (BE)

### Blocked/Stalled:
None.

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #34** - Fix narrative display bug (CRITICAL)
2. **BE #17** - Add AuthGuard to streaming (CRITICAL)
3. **BE #18** - Global ValidationPipe (QUICK WIN)
4. **FE #32** - Remove duplicate deps (QUICK WIN)

### For Product Manager (SPSM):
1. ✅ Backlog synced with GitHub (41 issues tracked)
2. ✅ All issues have priority labels
3. Monitor PR #14 and #25 for merging

---

## 📊 EPIC STATUS

| Epic | Done | In Progress | Pending | Total |
|------|------|-------------|---------|-------|
| **AI Infrastructure** | 5 | 2 | 2 | 9 |
| **Mobile-First UI** | 1 | 1 | 5 | 7 |
| **Cinematic Polish** | 1 | 0 | 5 | 6 |
| **Token Economy** | 0 | 0 | 8 | 8 |
| **Custom Genres** | 0 | 0 | 7 | 7 |

**MVP Readiness:** 🟢 **70%** (AI Infrastructure hardening in progress, UI/UX foundation solid)

---

## 🚀 MILESTONES

| Milestone | Target | Status | Risk |
|-----------|--------|--------|------|
| Stable Image Gen | Feb 2026 | 🟢 DONE | None |
| Mobile UI Complete | Feb 2026 | 🟡 IN PROGRESS | Medium |
| Token System MVP | Mar 2026 | 🟡 STARTING | Medium (auth needed) |
| Public Beta | Apr 2026 | ⏳ PENDING | TBD |

---

## 📝 TECHNICAL DEBT

| ID | Debt Item | Impact | Effort |
|----|-----------|--------|--------|
| TD-001 | Duplicate Google AI deps (FE #32) | Bundle size | 30min |
| TD-002 | No ValidationPipe (BE #18) | Stability | 30min |
| TD-003 | AiService monolith (BE #4) | Testability | 4h |
| TD-004 | useGameStream leaks (FE #36) | Performance | 1h |

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-08 01:00 CET  
> **Reference:** [VISION.md](./VISION.md)
