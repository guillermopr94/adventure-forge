# 🎯 Adventure Forge - Sprint Dashboard

**Last Updated:** 2026-02-07 04:20 CET  
**Phase:** MVP Foundation (Q1 2026)  
**Sprint Theme:** "Rock-solid foundation + Mobile-first"

---

## 📊 Backlog Overview

| Priority | Frontend | Backend | Total |
|----------|----------|---------|-------|
| **P0** (Critical) | 1 | 1 | **2** |
| **P1** (High) | 2 | 7 | **9** |
| **P2** (Medium) | 12 | 3 | **15** |
| **Untagged** | 0 | 0 | **0** |
| **TOTAL** | 15 | 11 | **26** |

---

## 🚨 TOP 5 CRITICAL PRIORITIES

### 1. [P0] [BUG] Narrative text hidden if segment image missing (FE #34)
**Impact:** Game-breaking bug. Users lose narrative content.  
**Owner:** Unassigned  
**Acceptance Criteria:**
- Text displays even if image generation fails
- Graceful fallback to text-only mode
- User is notified (not blocked)

**Action:** START THIS NOW

---

### 2. [P0] [SECURITY] Missing AuthGuard on /game/stream (BE #17)
**Impact:** Unauthorized users can consume AI resources. Cost leak.  
**Owner:** Unassigned  
**Acceptance Criteria:**
- JWT validation on streaming endpoint
- 401 response for unauthenticated requests
- Rate limiting per user

**Action:** IMMEDIATE FIX REQUIRED

---

### 3. [P1] AI Infrastructure: Model Fallback & Exponential Retry (FE #3)
**Impact:** AI reliability. Supports Stability objective.  
**Owner:** Unassigned  
**Status:** Partially implemented (PR #13, #14)  
**Acceptance Criteria:**
- ✅ Quota monitoring endpoint live
- ⏳ Circuit breaker pattern for repeated failures
- ⏳ Frontend integration with quota stats

**Action:** Complete circuit breaker logic

---

### 4. [P1] [STABILITY] Implement Global ValidationPipe (BE #18)
**Impact:** Prevents malformed requests. Reduces crashes.  
**Owner:** Unassigned  
**Acceptance Criteria:**
- `class-validator` + `class-transformer` configured globally
- All DTOs validated automatically
- Clear error messages for invalid payloads

**Action:** Quick win. 30min implementation.

---

### 5. [P1] [REFACTOR] Remove Duplicate Google Generative AI Dependencies (FE #32)
**Impact:** Bundle size reduction. Cleaner architecture.  
**Owner:** Unassigned  
**Acceptance Criteria:**
- Only ONE version of `@google/generative-ai` in package.json
- No conflicts between FE and BE dependencies
- Build passes without warnings

**Action:** Low-risk refactor. Do before UI work.

---

## 🔥 BLOCKERS

None identified. All critical issues have clear paths forward.

---

## 📈 SPRINT PROGRESS (Current)

**Sprint Goal:** Stability + Mobile UX foundation  
**Duration:** 2 weeks (started ~Feb 1)  
**Burn Rate:** ~50% complete (10/20 estimated tasks)

### Completed This Sprint:
- ✅ AI-001: HuggingFace image fallback (PR merged)
- ✅ CIN-001: Typewriter effect (PR #25 merged)
- ✅ AI-002: Quota monitoring (PR #14 merged)
- ✅ AI-007: Hardened AI prompts & parsing
- ✅ AI-008: Markdown cleanup in narratives

### In Progress:
- ⏳ #9: Game history context loss (FE)
- ⏳ #34: Narrative text hidden bug (FE)
- ⏳ #17: AuthGuard on streaming endpoint (BE)

### Blocked/Stalled:
None.

---

## 🎯 NEXT ACTIONS

### For Autonomous Agents (AEP):
1. **FE #34** - Fix narrative display bug (CRITICAL)
2. **BE #17** - Add AuthGuard to streaming (CRITICAL)
3. **BE #18** - Global ValidationPipe (QUICK WIN)
4. **FE #32** - Remove duplicate deps (QUICK WIN)
5. **FE #3** - Complete circuit breaker logic

### For Product Manager (SPSM):
1. ✅ All issues tagged (backlog 100% prioritized)
2. Monitor for obsolete issues after next AEP run
3. Refine AC for #9 (context loss) if needed

### For Tech Lead:
1. Review PR #25 (Typewriter effect) if not merged
2. Review PR #14 (Quota stats) if not merged
3. Approve next AEP target after #34/#17 complete

---

## 📊 EPIC STATUS

| Epic | Done | In Progress | Pending | Total |
|------|------|-------------|---------|-------|
| **AI Infrastructure** | 5 | 2 | 2 | 9 |
| **Mobile-First UI** | 1 | 1 | 5 | 7 |
| **Cinematic Polish** | 1 | 0 | 5 | 6 |
| **Token Economy** | 0 | 0 | 8 | 8 |
| **Custom Genres** | 0 | 0 | 7 | 7 |

**MVP Readiness:** 🟡 **65%** (AI Infrastructure solid, UI needs work, Token Economy blocked until auth stable)

---

## 🚀 MILESTONES

| Milestone | Target | Status | Risk |
|-----------|--------|--------|------|
| Stable Image Gen | Feb 2026 | 🟢 DONE | None |
| Mobile UI Complete | Feb 2026 | 🟡 IN PROGRESS | Medium (3 issues) |
| Token System MVP | Mar 2026 | 🔴 BLOCKED | High (auth not ready) |
| Public Beta | Apr 2026 | ⏳ PENDING | TBD |

---

## 📝 TECHNICAL DEBT

| ID | Debt Item | Impact | Effort |
|----|-----------|--------|--------|
| TD-001 | Duplicate Google AI deps (FE #32) | Bundle size +200KB | 30min |
| TD-002 | No ValidationPipe (BE #18) | Crash risk | 30min |
| TD-003 | AiService monolith (BE #4) | Hard to test | 4h |
| TD-004 | useGameStream leaks (FE #36) | Memory leak | 1h |

**Debt Score:** 🟡 Medium (manageable, but accumulating)

---

## 🎨 USER STORIES (Active)

### 1. As a player, I want the game to NEVER crash mid-session
**AC:**
- [ ] Text generation fallback chain (3+ providers)
- [x] Image generation fallback chain (2+ providers)
- [ ] Circuit breaker for repeated failures
- [ ] Graceful degradation (text-only mode)

**Status:** 🟡 70% complete

---

### 2. As a mobile user, I want a smooth, touch-optimized experience
**AC:**
- [ ] Portrait images (9:16 aspect ratio)
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Swipe gestures for navigation
- [ ] Responsive layout (320px to 1920px)
- [ ] Loading states (no blank screens)

**Status:** 🟡 40% complete

---

### 3. As a free user, I want to play without paying (with limits)
**AC:**
- [ ] 10 tokens/day for registered users
- [ ] Token balance visible in UI
- [ ] Clear notification when tokens depleted
- [ ] Upsell flow (not blocking)

**Status:** 🔴 0% complete (blocked by auth)

---

### 4. As a paying user, I want to buy tokens easily
**AC:**
- [ ] Stripe integration
- [ ] Clear pricing UI
- [ ] Transaction history
- [ ] Instant token credit after purchase

**Status:** 🔴 0% complete (blocked by token system)

---

### 5. As a creator, I want to build custom genres
**AC:**
- [ ] Genre editor UI
- [ ] Custom prompts per genre
- [ ] Image style templates
- [ ] Private vs public sharing

**Status:** 🔴 0% complete (future sprint)

---

## 🔔 ALERTS

None. All systems operational.

---

> **Dashboard maintained by:** CHATYI (SPSM Protocol)  
> **Next SPSM Sync:** 2026-02-08 01:00 CET  
> **Reference:** [VISION.md](./VISION.md)
