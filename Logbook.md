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

## [2026-02-04] AEP Turn - AI Resilience & Retry
**Issue:** #3 - AI Infrastructure: Model Fallback & Exponential Retry
**Status:** ✅ Completed

### Technical Actions
1. **Backend Enhancement (API):**
   - Implemented `withRetry` wrapper in `AiService` using exponential backoff.
   - Configured automatic retry (2 attempts) for 429/5xx and network errors.
   - Refactored `generateText` to use a strategy pattern with cascading fallbacks (Gemini 2.5 → 1.5 → Pollinations).
   - Fixed Gemini SDK usage for better reliability with standard `genModel.generateContent`.
2. **Resilience Improvements:**
   - Added retry logic to Image and Audio generation paths.
   - Improved error logging in `AiService` for better monitoring.

### Verification
- Code Review: Strategy cascading logic verified.
- Error Handling: 429/5xx retry paths implemented via `isRetryable` check.

### Next Steps
- Implement structured game state via Gemini Tool Calling (#1).
- Add user-facing notifications for AI status (#3 - Frontend part).
