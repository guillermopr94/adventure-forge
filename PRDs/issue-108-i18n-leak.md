# PRD - [P0] [BUG] Translation Keys Leak (Issue #108)

## Overview
In production builds, the UI occasionally shows raw i18n keys (e.g., `game.loading`) instead of the translated text. This happens because the translation bundles are not being correctly loaded or bundled in the production environment.

## Requirements
- Identify the root cause of the translation bundle loading failure in production.
- Ensure all translation files (`en.json`, `es.json`) are correctly included in the build output.
- Implement a robust loading mechanism for i18n bundles that handles potential delays or failures.
- Verify that the fix works in a production-like build.

## Success Criteria
- No raw i18n keys are visible in the production build.
- All cinematic strings render correctly in English and Spanish.
- `npm run build` generates a bundle that includes all necessary translation assets.
