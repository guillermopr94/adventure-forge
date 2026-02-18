# Codebase Analysis: [P0] [BUG] Translation Keys Leak (Issue #108)

## Executive Summary
The translation system is based on a static `translations.ts` file imported into a `LanguageContext`. Raw i18n keys appearing in production suggest that either the `translations` object is missing specific keys or the build process is stripping/misconfiguring the static import. However, the `translations.ts` file is a direct TS export, which should be robust. The "leak" might actually be a lack of translation keys for new features or a fallback logic failure in `useTranslation`.

## Project Structure
- `src/common/language/LanguageContext.tsx`: Core i18n logic and `useTranslation` hook.
- `src/common/utils/translations.ts`: Static dictionary of all translations (EN/ES).
- `src/views/`: Components using `t()` for internationalization.

## Relevant Patterns Found
- `LanguageContext.tsx` uses `localStorage` to persist language preference.
- `useTranslation` hook provides the `t` function.
- Fallback logic: `let text = currentTranslations[key] || key;` (This returns the key if translation is missing).

## Architecture Insights
- The translation system is synchronous and static. No dynamic loading from JSON files in `public/` is currently implemented.
- The `translations` object is imported once and sliced by language in the hook.

## Implementation Guidance
### Must Follow
- Ensure all keys used in the UI exist in `translations.ts`.
- The `t` function should handle missing keys gracefully but ideally, they shouldn't be missing.

### Recommended Approach
- Check for missing keys in `translations.ts` that are being used in `Game.tsx` or `MainMenu.tsx` (e.g., `game.loading`).
- Verify if `react-scripts build` (CRA) is somehow interfering with the static export in `translations.ts`.

### Avoid
- Dynamic loading of translations unless necessary (the current static approach is simpler for now).

## Files to Reference
- `src/common/language/LanguageContext.tsx`
- `src/common/utils/translations.ts`
- `src/views/Game/Game.tsx`

## Validation Commands
- `npm run build`
- `npm test`
