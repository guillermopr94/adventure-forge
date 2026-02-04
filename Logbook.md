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

## [2026-02-04 09:15] AEP Turn - Core Game Logic & Cinematic Engine Fixes
**Issues:** #9, #10, #11
**Status:** ✅ Completed

### Technical Actions
1. **Fix Game History Persistence (#9):**
   - Modified `Game.tsx` to stop filtering out model messages from history.
   - Implemented proper history update logic: replaces the last model message if updating a stream, or appends if new.
2. **Double Advancement Guard (#10):**
   - Added `isAdvancingRef` to `Game.tsx` to prevent concurrent `advanceSentence` calls (e.g., click + audio end).
3. **Visual Sync Stale State Fix (#11):**
   - Introduced `cinematicSegmentsRef` to ensure `advanceCinematicSegment` always reads the most recent segments when waiting for AI-generated images.
   - Added proper retry logic and 20s timeout for image sync.

### Verification
- `npm run build`: SUCCESS.
- Code Review: Verified ref-based state management and history append logic.

### Next Steps
- Implement robust retry system for AI calls (#3).
- Implement Authentication Guard and Resource Ownership (#6).
