# Logbook - Adventure Forge

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
