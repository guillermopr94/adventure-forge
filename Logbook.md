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
- Security: All sensitive routes (`/game/*`, `/ai/*`) now require a valid Google Token.

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

## [2026-02-04 09:15] AEP Turn - Core Game Logic & Cinematic Engine Fixes
**Issues:** #9, #10, #11
**Status:** ✅ Completed

### Technical Actions
1. **Fix Game History Persistence (#9):**
   - Modified `Game.tsx` to stop filtering out model messages from history.
   - Implemented proper history update logic: replaces the last model message if updating a stream, or appends if new.
2. **Double Advancement Guard (#10):**
   - Added `isAdvancingRef` and `currentSentenceIndexRef` to `Game.tsx` to prevent concurrent `advanceSentence` calls.
3. **Visual Sync Stale State Fix (#11):**
   - Introduced `cinematicSegmentsRef` and `useEffect` based synchronization to ensure images are loaded before narration.

### Verification
- `npm run build`: SUCCESS.
- Code Review: Verified ref-based state management and history append logic.

### Next Steps
- Implement frontend UI components for `inventory_changes` and `stats_update` (#1 - Frontend).
- AI Infrastructure: Model Fallback & Exponential Retry improvements (#3).

## [2026-02-04 11:27] AEP Turn - Security: Environment Setup Documentation
**Issue:** #19 - [SECURITY] Secrets exposed in .env file
**Status:** ✅ Completed
**PR:** [#21](https://github.com/guillermopr94/adventure-forge/pull/21)

### Technical Actions
1. **Security Audit:**
   - Verified `.env` is already in `.gitignore` (present, no changes needed).
   - Confirmed `.env` was **never committed** to repository history (no cleanup needed).
   - Identified repository is **PUBLIC** - critical to prevent future accidental exposure.
2. **Documentation & Best Practices:**
   - Created `.env.example` with placeholder values for `REACT_APP_GOOGLE_CLIENT_ID`.
   - Added comprehensive **Getting Started** section to `README.md`:
     - Prerequisites
     - Installation steps
     - Environment variable configuration guide
     - Google OAuth setup instructions
     - Security warning about never committing `.env`

### Verification
- `git log --all --full-history -- .env`: No commits (confirmed secure).
- `git status`: `.env` not tracked (confirmed `.gitignore` working).
- PR created and branch pushed successfully.

### Security Status
**✅ No secrets were exposed** - `.env` was never committed to the repository. This fix is **preventive**, ensuring all future contributors follow secure environment setup practices.

### Next Steps
- Fix #9: Game History Context Loss (P0).
- Fix #10: Double advanceSentence UX bug (P0).
