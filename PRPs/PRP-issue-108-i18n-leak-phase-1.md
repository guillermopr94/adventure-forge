# PRP - [P0] [BUG] Translation Keys Leak (Issue #108)

## Goal
- **Feature Goal**: Eliminate raw i18n key leakage in the production UI by ensuring robust translation bundle loading and fallback mechanisms.
- **Deliverable**: Refactored `LanguageContext.tsx` and `translations.ts` with strict typing and verified production build configuration.
- **Success Definition**: No `game.*` or other raw keys visible in the UI during any state (loading, error, or normal play) in a production build.

## Context
```yaml
project_patterns:
  i18n: "Static object in src/common/utils/translations.ts managed by LanguageContext.tsx"
  hooks: "useTranslation hook provides t(key) function"
  state: "React Context for global language state"

critical_references:
  - file: "src/common/language/LanguageContext.tsx"
    purpose: "Implementation of the t function and bundle management"
  - file: "src/common/utils/translations.ts"
    purpose: "Source of all translation strings"
  - file: "src/views/Game/Game.tsx"
    purpose: "Primary consumer of translations where leaks are reported"

technical_gotchas:
  - "The current t function returns the key if the translation is missing: return key;"
  - "Bundle minification might affect object property access if not handled carefully"
  - "Hardcoded strings in components like Game.tsx bypass the i18n system"
```

## Implementation Tasks

### 1. Robustness & Typing (Refactor)
- [ ] **Define Strict Translation Types**: Update `translations.ts` to use a required interface for all languages to ensure parity.
- [ ] **Enhance `t` Function**: Modify `LanguageContext.tsx` to log errors to a monitoring service (or just console.error) and return a user-friendly fallback (e.g., the key but formatted or a generic 'Missing Translation' string) instead of the raw technical key.
- [ ] **Bundle Verification**: Ensure that the `translations` object is not being tree-shaken or mangled in a way that breaks access in production.

### 2. Codebase Audit & Cleanup
- [ ] **Extract Hardcoded Strings**: Scan `Game.tsx`, `MainMenu.tsx`, and `AdventureSelection.tsx` for hardcoded strings and move them to `translations.ts`.
- [ ] **Missing Keys Check**: Verify that `game.loading`, `image_error`, and `visualizing_scene` exist in BOTH `en` and `es` bundles.

### 3. Production Readiness
- [ ] **Build Validation**: Run `npm run build` and inspect the generated `main.*.js` to ensure translation strings are present.
- [ ] **Loading State i18n**: Ensure that the initial loading screen uses a translation that is guaranteed to be available (perhaps a hardcoded safe default in the context itself).

## Validation Gates

### Automated Tests
- [ ] `npm test`: Ensure all existing unit tests pass.
- [ ] **New Test Case**: Add a test in `LanguageContext.test.tsx` (create if missing) that verifies the `t` function returns a fallback when a key is missing.

### Manual Verification
- [ ] **Production Build Check**: Run `npm run build`, then serve the `build/` folder (e.g., using `npx serve -s build`) and verify the UI in a browser.
- [ ] **Switch Language**: Verify that toggling between EN and ES works perfectly in the production build.

## Final Validation Checklist
- [ ] No raw i18n keys visible in production.
- [ ] All cinematic strings render correctly.
- [ ] Translation bundles are verified in the build output.
