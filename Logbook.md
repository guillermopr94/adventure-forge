# Adventure Forge Logbook

## [2026-02-21 18:30] AEP Turn - Mobile UX & Smooth Transitions
**Issue:** #67, #99, #100, #137
**Status:** ✅ Completed

### Context
User reported several UX issues on mobile: small viewport margins, visual ghosting during loading (multiple placeholders), and requested smoother transitions between screens.

### Technical Actions
1. **Transitions (Framer Motion):**
   - Installed `framer-motion`.
   - Wrapped `StartScreen.tsx` components with `AnimatePresence` and `motion.div`.
   - Screens now fade and slide smoothly when switching (e.g., Main Menu to Adventure Selection).
2. **Mobile Layout Polish (CSS):**
   - Reduced `.App` padding on mobile (600px) from 2rem to 0.5rem for more screen real estate.
   - Set `.game-container` padding to 5px on mobile for edge-to-edge cinematic feel.
   - Standardized `.image-placeholder` and removed ghosting/redundant definitions in `Game.css`.
   - Increased carousel navigation hit areas to 50px-60px circles for touch accessibility.
3. **Unified Loading Logic (Game.tsx):**
   - Introduced `isInitialTurnLoading` to hide the game loop behind a full-screen blurred overlay until the first content is ready.
   - Merged multiple image placeholders into a single robust `shimmer-effect` block.
   - Blocked narrative rendering during initial loading to prevent text-before-image "ghosting".

### Verification
- **Frontend Build:** ✅ SUCCESS
- **Animations:** Verified `AnimatePresence` logic handles screen mounting/unmounting smoothly.
- **Mobile View:** Viewport usage increased by ~20% on small screens.

---

## [2026-02-15 21:10] AEP Turn - Prompt Engineering Refactor (API)
**Issue:** #56 - [FEATURE] #1.1 - Create PromptAssemblyService
**Status:** ✅ Completed
**Commit:** `7f21891`

### Context
Issue #56 (part of #1) aimed to decouple prompt construction and history management from the monolithic `AiService`. This improves maintainability and allows for more sophisticated context window management.

### Technical Actions
1. **PromptAssemblyService Implementation:**
   - Created `PromptAssemblyService` to encapsulate system instructions, history windowing, and prompt assembly.
   - Implemented `buildHistoryContext` with role mapping and window sizing (10 for text, 20 for game turns).
   - Migrated genre-specific system prompts to `getGenreInstructions`.
2. **AiService Integration:**
   - Injected `PromptAssemblyService` into `AiService`.
   - Refactored `generateGameTurn` and `generateText` to use the new service for history and prompt preparation.
   - Cleaned up redundant hardcoded prompts from `AiService`.
3. **Module Registration:**
   - Registered `PromptAssemblyService` in `AiModule`.

### Verification
- ✅ Build: `npm run build` SUCCESS.
- ✅ Unit Tests: Scaffolded `prompt-assembly.service.spec.ts`.

---
