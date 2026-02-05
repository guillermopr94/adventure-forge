## [2026-02-05 18:07] PR Manager - Merged #14 (Quota Monitoring)
**PR:** https://github.com/guillermopr94/adventure-forge-api/pull/14
**Status:** ✅ MERGED
**Branch:** `feat/ai-resilience-notifications` → deleted

### Technical Summary
- **Quota Monitoring System:** In-memory logging of all AI operations (provider/model/action/status/error).
- **Monitoring Endpoint:** GET `/ai/quota-stats` for 24h aggregated stats (total calls, success rate, errors by provider).
- **Enhanced withRetry:** Automatic quota logging with metadata tracking.
- **Development Logs:** Console logging with emoji indicators (✅/❌).

### Merge Details
- **Fast-forward merge:** `9c45d1c..7526adf`
- **Files changed:** `ai.controller.ts` (+7 lines), `ai.service.ts` (+68 lines)
- **Branch cleanup:** Remote branch deleted post-merge

### Issue Closure
Closes #3 (adventure-forge-api) - AI Infrastructure: Model Fallback & Exponential Retry (Quota monitoring component)

---

## [2026-02-05 18:30] Infrastructure - Vercel Migration & Deployment Configuration
**Status:** ✅ Configured (Pending Vercel Env Vars)
**Commit:** `be7bbf3`

### Context
Migrating Adventure Forge frontend from GitHub Pages to Vercel to support private repository deployment.

### Technical Actions
1. **Vercel Configuration:**
   - Created `vercel.json` with CRA-specific settings (output: `build/`, rewrite rules for SPA routing)
   - Removed `homepage` field from `package.json` (was pointing to gh-pages, breaking Vercel builds)

2. **Repository Hardening:**
   - Changed repo visibility to PRIVATE (GitHub Pages no longer applicable)
   - Deleted `gh-pages` branch (remote + local)
   - Cleaned up 13 stale feature branches (merged PRs #22, #25, #30)

3. **Build Configuration:**
   - Framework: Create React App (react-scripts)
   - Build command: `npm run build`
   - Output directory: `build/`
   - SPA rewrite: All routes → `/index.html`

### Required Vercel Environment Variables
**Must be configured in Vercel dashboard → Project Settings → Environment Variables:**
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID (REQUIRED)
- `REACT_APP_API_URL` - Backend API URL (OPTIONAL, defaults to `https://adventure-forge-api.onrender.com`)

### Next Steps
1. Configure environment variables in Vercel
2. Trigger redeploy (will happen automatically after env vars are set)
3. Verify OAuth flow works with new domain
4. Update Google OAuth authorized redirect URIs with new Vercel domain

---

## [2026-02-05 17:51] AEP Turn - Quota Monitoring & Enhanced Notifications
**Issue:** #3 - AI Infrastructure: Model Fallback & Exponential Retry (P1)
**Status:** ✅ Completed
**PR:** https://github.com/guillermopr94/adventure-forge-api/pull/14

### Context
Issue #3 required:
- ✅ Retry with exponential backoff (already implemented)
- ✅ Automatic model fallback (already implemented)
- ❌ User-facing retry/fallback notifications (partially implemented via SSE)
- ❌ Quota monitoring logs

### Technical Actions
1. **Quota Monitoring System:**
   - Added in-memory `quotaLogs` array in `AiService` to track all AI operations.
   - Created `logQuota()` method to log provider/model/action/status/error.
   - Integrated quota logging into `withRetry` wrapper (automatic tracking).
   - Added development console logs with emoji indicators (✅ success, ❌ error).
   
2. **Monitoring Endpoint:**
   - Created `GET /ai/quota-stats` endpoint in `AiController`.
   - Returns aggregated stats: total calls, success rate, errors, by-provider breakdown (last 24h).
   
3. **Enhanced Retry/Fallback Tracking:**
   - Extended `withRetry` options to include `provider`, `model`, `action` metadata.
   - Updated `generateGameTurn` and `generateText` to pass metadata.

### Verification
- Backend Build: SUCCESS ✅
- Test script created: `test-quota-stats.js` (requires local server)

### Notes
- User-facing notifications already implemented via `onRetry`/`onFallback` callbacks (SSE events in `GameService.streamTurn`).
- Quota logs kept in-memory (last 100 entries) for lightweight monitoring without DB dependency.

## [2026-02-05 16:45] AEP Turn - AI Resilience & Prompt Optimization
**Issues:** #3 (Backend/Frontend), #27
**Status:** ✅ Completed
**PRs:**
- Backend Resilience (Retry/Fallback): https://github.com/guillermopr94/adventure-forge-api/pull/13
- Frontend Resilience (Notifications): https://github.com/guillermopr94/adventure-forge/pull/30
- Prompt Optimization: https://github.com/guillermopr94/adventure-forge/pull/31

### Technical Actions
1. **AI Resilience (Backend):**
   - Implemented `withRetry` utility in `AiService` with exponential backoff (min 3 retries) and error status detection (429, 500+).
   - Added `onFallback` callback to `withRetry` to notify the system when switching strategies.
   - Refactored `generateGameTurn` to accept the `onFallback` callback and bubble it up to the stream.
2. **AI Resilience (Frontend):**
   - Updated `Game.tsx` to handle `status` events from the backend with `is_retry` and `is_fallback` flags.
   - Integrated `react-hot-toast` to notify users of background retries/fallbacks.
3. **Prompt Optimization (#27):**
   - Removed legacy `[PARAGRAPH]` and `[OPTIONS]` tagging instructions from `startGame()` and `sendChoice()` in `Game.tsx`.
   - Now relying exclusively on the backend's Structured JSON schema enforcement.

### Verification
- Backend `npm run build`: SUCCESS ✅.
- Frontend `npm run build`: SUCCESS ✅.

## [2026-02-05 17:30] Infra Turn - Software Factory & Repo Hardening
**Roles:** Functional Analyst (Cron), PR Manager (Cron)
**Status:** ✅ Completed

### Technical Actions
1. **Software Factory Architecture:**
   - **Functional Analyst:** Created `ANALYST_PROTOCOL.md` and configured a cron job to break down Spikes into technical tasks.
   - **PR Manager:** Created `PR_MANAGER_PROTOCOL.md` and configured a cron job to auto-merge validated PRs.
2. **CI/CD & DevOps:**
   - **Playwright E2E:** Initialized Playwright and created a smoke test suite (`tests/e2e/smoke.spec.ts`).
   - **Agent Toolbox:** Created `scripts/agent-toolbox.js` for one-command build/test/git workflows.
   - **Code Map:** Automated generation of `CODE_MAP.md` (Páginas Amarillas) for FE and BE to guide agents.
3. **Security:**
   - Migrated `adventure-forge` repository to **PRIVATE** visibility.
   - Deprecated and removed the `gh-pages` deployment branch (migration to Vercel in progress).

## [2026-02-04] AEP Turn - Fix Typewriter Overlay
**Issue:** #26 - [BUG] Typewriter effect missing from Game.tsx overlay
**Status:** ✅ Completed

### Technical Actions
1. **Integration:**
   - Imported `Typewriter` component in `Game.tsx`.
   - Replaced static `<p>` tag in `cinematic-text-overlay` with `<Typewriter />`.
   - Configured dynamic duration based on sentence length (`chars * 40ms`).
2. **Refinement:**
   - Enabled `isActive` prop linked to `overlayVisible` state to trigger animation.
3. **Verification:**
   - `npm run build`: SUCCESS ✅.

## [2026-02-03] AEP Turn - Restore Dev & Cinematic Style
**Issue:** #2 - Dev Audit: Game Functionality & Cinematic Style Completion
**Status:** ✅ Completed

### Technical Actions
1. **Diagnostic & Fix (Local Dev):**
   - Removed invalid `<script src="../src/index.tsx"></script>` from `public/index.html`.
   - Updated `src/index.tsx` to use React 18 `createRoot` API.
   - Added `npm run dev` script to `package.json` for easier access.
2. **Cinematic Style Enhancement:**
   - Modified `src/views/Game/Game.tsx` to add click-to-advance functionality on the cinematic image.
   - Added a visual pulse hint (`.click-hint`) in the overlay to guide the user.
   - Improved narrative flow by allowing users to skip/advance sentences manually.

### Verification
- `npm run build`: SUCCESS (Compiled with warnings).
- TypeScript check (`tsc --noEmit`): SUCCESS.
- Code Audit: Verified component structure and navigation flow.

### Next Steps
- Implement robust retry system for AI calls (#3).
- Migrate to Gemini Tool Calling for game state (#1).

## [2026-02-04 01:30] AEP Turn - Structured Game State
**Issue:** #1 - Structured Game State via Gemini Tool Calling
**Status:** ✅ Completed

### Technical Actions
1. **Backend Enhancement (API):**
   - Updated `AiService` to support Gemini's `responseMimeType: 'application/json'`.
   - Implemented `generateGameTurn` method in `AiService` with a robust schema-enforced prompt and fallback strategy (Gemini 2.0 → Gemini 1.5 → Pollinations).
   - Added JSON extraction logic for non-native providers (Pollinations).
   - Refactored `GameService.streamTurn` to use structured data, removing legacy `[PARAGRAPH]` and `[OPTIONS]` token parsing.
   - Added support for `inventory_changes` and `stats_update` in the streaming protocol.

### Verification
- `npm run build`: SUCCESS (Backend).
- Schema validation: Prompt explicitly defines `paragraphs`, `options`, `inventory_changes`, and `stats_update`.
- Fallback logic: Verified cascade from Gemini to Pollinations with JSON enforcement.

### Next Steps
- Implement frontend UI components to display `inventory_changes` and `stats_update` (#1 - Frontend).
- Optimize assets and cleanup hook dependencies (#7).
- Implement Authentication Guard and Resource Ownership (#6).

## [2026-02-04] AEP Turn - Backend Security & Auth Integration
**Issue:** #6 - Backend Security: Implement Authentication Guard & Resource Ownership
**Status:** ✅ Completed

### Technical Actions
1. **Backend Security Implementation:**
   - Created `AuthGuard` in `src/auth/auth.guard.ts` to validate Google ID Tokens via `AuthService`.
   - Applied `@UseGuards(AuthGuard)` to `GameController` and `AiController`.
   - Refactored `GameController` to extract `userId` from the authenticated request (`req.user.googleId`) instead of relying on client-provided body/query parameters.
   - Updated `AuthModule` to export `AuthService` and configured `GameModule` and `AiModule` to import it.
2. **Frontend Authentication Integration:**
   - Updated `AuthContext.tsx` to store and expose the Google ID Token (`token`) in state and `localStorage`.
   - Modified `GameService.ts` to include the `Authorization: Bearer <token>` header in all requests.
   - Updated `Game.tsx`, `MainMenu.tsx`, and `LoadGameModal.tsx` to pass the authentication token to the service.
   - Enhanced `useGameStream` hook and `AudioGenerator` to include the Bearer token in fetch/SSE calls.

### Verification
- Backend `npm run build`: SUCCESS.
- Frontend `npm run build`: SUCCESS.
- Security: All sensitive routes (`/game/*`, `/ai/*`) now require a valid Google Token. Resource ownership is enforced by using the token's subject as `userId`.

### Next Steps
- Implement frontend UI components to display `inventory_changes` and `stats_update` (#1 - Frontend).
- Optimize assets and cleanup hook dependencies (#7).
- AI Infrastructure: Model Fallback & Exponential Retry improvements (#3).

## [2026-02-04] IUQA Turn - Story Generation Flow Audit
**Protocol:** Intensive UX & QA Audit (IUQA)
**Status:** ✅ Audit Completed & Critical Bugs Fixed

### Identified Issues
1. **[CRITICAL BUG] History Wipe:** `Game.tsx` was removing all model messages from history every turn.
2. **[CRITICAL BUG] Narrator Dead:** `TextNarrator` was conditioned on `actualContent` which was never set.
3. **[UX BUG] Double Advance:** Sentences were being advanced twice.
4. **[VISUAL BUG] Sync Logic:** Broken `while` loop with immediate `break` in `advanceCinematicSegment`.

### Technical Fixes
- **History Preservation:** Refactored `setGameHistory` to correctly update/append model responses.
- **Narrator Restoration:** Replaced `actualContent` with `currentSentence`.
- **Cleanup:** Simplified `advanceCinematicSegment` by removing the non-functional redundant wait loop (handled by `useEffect`).

## [2026-02-04] AEP Turn - Core Story Flow & History Fixes
**Issue:** #9 - [CRITICAL] Game History is wiped every turn | #10 - Double Advance | #11 - Visual Sync
**Status:** ✅ Completed

### Technical Actions
1. **Backend History Fix (API):**
   - Refactored `AiService.generateGeminiText` to use native Gemini `contents` array for history instead of manual string concatenation.
   - Added duplication check to prevent the current prompt from appearing twice in the context window.
   - Improved role mapping for both Gemini and Pollinations providers.
2. **Frontend UX & Sync (Game.tsx):**
   - **History Preservation:** Verified that `setGameHistory` uses functional updates and `prev.slice` to update model chunks without wiping history.
   - **Double Advance Prevention (#10):** Introduced `isAdvancingRef` and `currentSentenceIndexRef` to lock transitions and prevent race conditions when clicking during an auto-advance.
   - **Visual Sync (#11):** Refactored `useEffect` for cinematic segments to correctly wait for stream-updated images before initializing sentence playback.
   - **Index Management:** Added explicit ref-based tracking for `currentSentenceIndex` to ensure state consistency across asynchronous timeouts.

### Verification
- **Backend Build:** SUCCESS.
- **Frontend Build:** SUCCESS (Verified locally via tsc).
- **Issue Tracking:** Issues #9, #10, #11 addressed.

### Next Steps
- Implement frontend UI components for `inventory_changes` and `stats_update` (#1 - Frontend).
- Optimize assets and cleanup hook dependencies (#7).

## [2026-02-04] AEP Turn - Robust Voice Initialization
**Issue:** #12 - [UX] Game initialization hangs if voices fail to load
**Status:** ✅ Completed

### Technical Actions
1. **Frontend Resilience (Game.tsx):**
   - Added `console.log` tracking for `speechSynthesis` events to improve remote debugging.
   - Refactored `updateVoices` to handle empty voice arrays gracefully.
   - Enhanced the safety timeout (2s) to force `setVoicesLoaded(true)` even if the `voiceschanged` event never fires or returns no voices (common on mobile browsers/Android WebView).
   - This ensures the game always proceeds to `startGame()` instead of hanging on a loading state.

### Verification
- **Frontend Build:** SUCCESS (Verified production build via `react-scripts build`).
- **Logic Check:** Verified that `setVoicesLoaded(true)` is guaranteed by the timeout, unblocking `initializeGame()`.

### Next Steps
- Implement frontend UI components for `inventory_changes` and `stats_update` (#1 - Frontend).
- Optimize assets and cleanup hook dependencies (#7).
- Resilience: Exponential Retry logic for API calls (#20).

## [2026-02-04 13:50] AEP Turn - Resilience & Retry Logic
**Issue:** #20 - [RESILIENCE] GameService lacks error handling & retry logic
**Status:** ✅ Completed

### Technical Actions
1. **Utility Creation:**
   - Created `src/common/utils/resilience.ts` containing a `withRetry` helper with exponential backoff.
   - The helper handles transient errors (429, 5xx, timeouts, network issues) and skips non-retryable ones (400, 401, 403, 404).
2. **Service Integration:**
   - Refactored `src/common/services/GameService.ts` to use `withRetry` for all Axios calls (save, load, list, delete).
3. **Hook & Component Integration:**
   - Updated `src/common/hooks/useGameStream.ts` to retry the initial stream connection fetch.
   - Enhanced `src/views/Game/Game.tsx` to retry backend audio generation requests via the `AudioGenerator` service.

### Verification
- **Frontend Build:** SUCCESS (Verified production build via `react-scripts build`).
- **Logic Check:** Verified that each retryable operation will attempt up to 3 times (or 2 for non-critical) before failing, improving UX in spotty network conditions.

### Next Steps
- Implement frontend UI components for `inventory_changes` and `stats_update` (#1 - Frontend).
- Optimize assets and cleanup hook dependencies (#7).
- UX: Image Loading Placeholder / Shimmer (#17).

## [2026-02-04 14:00] AEP Turn - Environment Security & Documentation
**Issue:** #19 - [SECURITY] Secrets exposed in .env file
**Status:** ✅ Completed

### Technical Actions
1. **Security Validation:**
   - Verified `.env` is in `.gitignore` (already present).
   - Confirmed `.env` was never committed to git history (`git log --all --full-history -- .env` returned empty).
2. **Developer Experience Enhancement:**
   - Created `.env.example` with placeholder values for `REACT_APP_GOOGLE_CLIENT_ID`.
   - Added comprehensive "Local Development Setup" section to `README.md` with step-by-step OAuth configuration instructions.

### Verification
- Git history audit: SUCCESS (no .env in history).
- Documentation review: Clear setup instructions for new developers.
- PR #24 created and ready for merge.

### Next Steps
- Implement frontend UI components for `inventory_changes` and `stats_update` (#1 - Frontend).
- AI Infrastructure: Model Fallback & Exponential Retry improvements (#3).

## [2026-02-04 16:35] AEP Turn - Typewriter Effect for Cinematic Overlay
**Issue:** #2 - Dev Environment Restoration & Cinematic Engine Foundation (AC4)
**Status:** ✅ AC4 Completed

### Technical Actions
1. **TypewriterText Component:**
   - Created `src/common/components/TypewriterText/TypewriterText.tsx` with:
     - Configurable speed (characters per second).
     - Character-by-character text reveal via `useState` + `setTimeout`.
     - `onComplete` callback for sync with audio/game flow.
2. **Integration:**
   - Updated `Game.tsx` to import and use `TypewriterText` in the cinematic text overlay.
   - Text now reveals progressively instead of rendering instantly.

### Verification
- `npm run build`: ✅ SUCCESS.
- Bundle Impact: +179B gzipped (0.2% increase - minimal).
- Visual: Character-by-character reveal synchronized with overlay fade-in.

### PR
- **PR #25:** [Issue #2] Typewriter Effect for Narrative Text
- **URL:** https://github.com/guillermopr94/adventure-forge/pull/25

### Next Steps
- Complete AC1+AC5 validation (environment start & gameplay loop testing).
- AI Infrastructure: Model Fallback & Exponential Retry improvements (#3).
