# Codebase Analysis: Issue #108 - Translation Keys Leak

## Executive Summary
The translation keys leak is likely caused by the current implementation of `translations.ts` which exports a large static object. While simple, if any key is missing or the reference to the object fails during minification/bundling, the UI reverts to showing the raw key via the `t` function in `LanguageContext.tsx`. The issue is exacerbated by hardcoded strings and a lack of proper asset management for localized content.

## Project Structure
- `src/common/language/LanguageContext.tsx`: Core i18n logic and `useTranslation` hook.
- `src/common/utils/translations.ts`: Central repository of all translation strings (ES/EN).
- `src/common/utils/resilience.ts`: Utility for retries, could be used for dynamic loading.

## Relevant Patterns Found
- **Static Object i18n**: The project uses a single TS file for all translations.
- **Hook-based Translation**: `useTranslation` hook provides the `t` function.
- **LocalStorage Persistence**: Language preference is stored in `localStorage`.

## Architecture Insights
- The `LanguageProvider` manages the `language` state.
- The `useTranslation` hook derives `currentTranslations` from the static object in `translations.ts`.
- The `t` function has a fallback that returns the `key` if the translation is missing: `if (!text) { console.warn(...); return key; }`.

## Implementation Guidance
### Must Follow
- Ensure `translations.ts` is fully populated and types are strictly enforced.
- The `t` function must handle the "loading" state of translations if migrated to dynamic loading.

### Recommended Approach
- Refactor `LanguageContext.tsx` to be more robust against undefined bundles.
- Add a "safe" translation wrapper or a build-time check to ensure all keys exist in all languages.
- Consider moving translations to JSON files in `public/locales` and fetching them dynamically to reduce initial bundle size and improve modularity.

### Avoid
- Hardcoding strings in components (several exist in `Game.tsx`).
- Returning the raw key without a clear visual indicator in development.

## Files to Reference
- `src/common/language/LanguageContext.tsx`: Lines 25-50 (t function logic).
- `src/common/utils/translations.ts`: Entire file.

## Validation Commands
- `npm run build`: Verify bundling success.
- `npm test`: Run existing tests to ensure no regressions.
