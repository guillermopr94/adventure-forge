# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-07 19:43 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Rock-solid foundation + Mobile-first"

---

## 📊 Backlog Overview

| Priority | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **P0** (Critical) | 0 | 1 | **1** |
| **P1** (High) | 5 | 14 | **19** |
| **P2** (Medium) | 14 | 5 | **19** |
| **Untagged** | 0 | 0 | **0** |
| **TOTAL** | 19 | 20 | **39** |

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [SECURITY] Missing AuthGuard on /game/stream (BE #17)
**Impact:** Unauthorized users can consume AI resources. Potential cost leak.  
**Acceptance Criteria:**
- JWT validation on `/game/stream` endpoint
- 401 response for unauthenticated requests
- Rate limiting per user verified

**Action:** IMMEDIATE FIX REQUIRED

---

### 2. [P0] Backend AI Orchestration & Context Management (BE #1)
**Impact:** Story coherence and long-term session stability.  
**Acceptance Criteria:**
- NestJS service for prompt assembly with context (last 10 turns)
- API endpoints for `next_step` and `get_history` fully functional
- Context compression/summarization logic implemented

**Action:** CORE FEATURE - PRIORITY EXECUTION

---

### 3. [P1] [STABILITY] Implement Global ValidationPipe (BE #18)
**Impact:** Prevents malformed requests. Increases API resilience.  
**Acceptance Criteria:**
- `class-validator` + `class-transformer` configured in `main.ts`
- All incoming DTOs validated automatically
- 400 Bad Request for invalid payloads

**Action:** QUICK WIN - 30 MIN TASK

---

### 4. [P1] AI Infrastructure: Model Fallback & Exponential Retry (FE #3)
**Impact:** High availability of AI services. Supports "Stability First" objective.  
**Status:** Partially implemented
**Acceptance Criteria:**
- Circuit breaker pattern for repeated provider failures
- Automatic fallback to next healthy provider in chain
- Exponential backoff on retries

**Action:** Complete resilience infrastructure

---

### 5. [P2] [RESILIENCE] Missing AbortController in useGameStream (FE #36)
**Impact:** Prevents memory leaks and orphaned requests.
**Acceptance Criteria:**
- Stream aborted when component unmounts
- Clean cleanup of SSE events

**Action:** Stability improvement.

---

## 🔥 BLOCKERS

None identified. Critical issues have clear implementation paths.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Mobile UX foundation  
**Burn Rate:** ~65% complete (13/22 estimated tasks)

### Completed This Sprint:
- ✅ **FE #34**: Narrative display resilience (PR #58)
- ✅ BE #17, #30, #31, #32: Security hardening & stream auth (PR #39 BE, PR #50 FE)
- ✅ AI-001: HuggingFace image fallback
- ✅ CIN-001: Typewriter effect (PR #25)
- ✅ AI-002: Quota monitoring (PR #14)
- ✅ AI-007: Hardened AI prompts & parsing
- ✅ AI-008: Markdown cleanup in narratives
- ✅ FE #9: Game history context loss fix

### In Progress:
- ⏳ #1: Backend context management (BE)

### Blocked/Stalled:
None.

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **BE #17** - Add AuthGuard to streaming (CRITICAL)
2. **BE #18** - Global ValidationPipe (QUICK WIN)
3. **FE #32** - Remove duplicate deps (QUICK WIN)
4. **FE #3** - Complete circuit breaker logic
5. **FE #36** - AbortController cleanup

### For Product Manager (SPSM):
1. ✅ Backlog synced with GitHub (41 issues tracked)
2. ✅ All issues have priority labels
3. Monitor PR #14 and #25 for merging

---

## 📊 EPIC STATUS

| Epic | Done | In Progress | Pending | Total |
|------|------|-------------|---------|-------|
| **AI Infrastructure** | 6 | 1 | 2 | 9 |
| **Mobile-First UI** | 2 | 1 | 4 | 7 |
| **Cinematic Polish** | 2 | 0 | 4 | 6 |
| **Token Economy** | 0 | 0 | 8 | 8 |
| **Custom Genres** | 0 | 0 | 7 | 7 |

**MVP Readiness:** 🟢 **75%** (AI Infrastructure hardening in progress, UI/UX foundation solid)

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
