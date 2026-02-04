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

## [2026-02-04] AEP Turn - Fix Critical History Bug (Refined)
**Issue:** #9 - [CRITICAL] Game History is wiped every turn
**Status:** ✅ Completed

### Technical Actions
1. **Bug Fix (History Management - Phase 1):**
   - Identified that `setGameHistory` was using a filter `h => h.role !== 'model'` which stripped all previous AI messages.
   - Refactored `sendChoice` and `startGame` in `Game.tsx` to correctly handle history updates using `prev => ...` logic.
2. **Bug Fix (History Management - Phase 2):**
   - Added a state guard in `startGame` to prevent re-entrant calls from `initializeGame` which were resetting `gameHistory` to `[]` during race conditions (e.g. `voicesLoaded` toggling).
   - Fixed missing `Authorization` header in `useGameStream.ts` which caused 401 errors on some environments.
3. **Backend Refinement:**
   - Modified `AiService` (API) to use Gemini `systemInstruction` parameter instead of injecting instructions into every user message.
   - Fixed duplication check in `generateGeminiText` to correctly handle history sent from the frontend.

### Verification
- `npm run build`: SUCCESS.
- Verified that conversation context is now maintained across turns by correctly structuring the history array and avoiding re-initialization wipes.

### PRs
- Frontend: [PR #14](https://github.com/guillermopr94/adventure-forge/pull/14) updated.
- Backend: [PR #3](https://github.com/guillermopr94/adventure-forge-api/pull/3) updated.

### Next Steps
- Address [UX] Game initialization hangs if voices fail to load (#12).
- Investigate [VISUAL] Cinematic Segment wait logic (#11).

