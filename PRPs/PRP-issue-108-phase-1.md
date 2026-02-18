# PRP - [P0] [BUG] Translation Keys Leak (Issue #108)

## Goal
Fix the translation leak where raw i18n keys are shown in production builds.

- **Feature Goal**: Ensure all UI elements show translated text instead of raw keys.
- **Deliverable**: Updated `translations.ts` and refined `useTranslation` hook with robust fallback.
- **Success Definition**: `npm run build` results in a UI with no visible i18n keys like `game.loading`.

## Context
- **Codebase Analysis**: [analysis.md](./planning/issue-108-phase-1-analysis.md)
- **Primary Reference**: `src/common/language/LanguageContext.tsx` (Hook logic)
- **Data Reference**: `src/common/utils/translations.ts` (Translation dictionary)
- **Affected Views**: `Game.tsx`, `MainMenu.tsx`, `SettingsModal.tsx`

### Gotchas
- The current `t` function returns the key if not found: `let text = currentTranslations[key] || key;`.
- Some components have hardcoded defaults like `{t('settings') || "Settings"}` which hides the leak, but others don't.
- `game.loading` mentioned in the DASHBOARD is NOT in `translations.ts`.

## Implementation Tasks

### 1. Update Translations Dictionary
- **File**: `src/common/utils/translations.ts`
- **Action**: Add missing keys discovered in components:
    - `game.loading` (referenced as `loadingText` in some places, but might be called incorrectly elsewhere)
    - Any other keys appearing as raw text in prod.
- **Verification**: Keys exist for both `en` and `es`.

### 2. Refine useTranslation Hook
- **File**: `src/common/language/LanguageContext.tsx`
- **Action**: 
    - Improve fallback logic to log a warning in development when a key is missing.
    - Ensure `currentTranslations` is always defined before accessing properties.
- **Code Change**:
    ```typescript
    const t = (key: string, variables?: { [key: string]: any }) => {
        if (!currentTranslations) return key;
        let text = currentTranslations[key];
        
        if (!text) {
            console.warn(`Missing translation key: ${key}`);
            return key;
        }

        if (variables) {
            for (const variable in variables) {
                text = text.replace(`{${variable}}`, String(variables[variable]));
            }
        }
        return text;
    };
    ```

### 3. Audit Components for Key Consistency
- **Action**: Search for all `t('...')` calls and ensure they match keys in `translations.ts`.
- **Target**: 
    - `Game.tsx` (Check `loadingText` vs `game.loading`)
    - `MainMenu.tsx`
    - `SettingsModal.tsx`

## Validation Gates

### Automated Tests
- [ ] `npm test`: Run existing unit tests.
- [ ] Create a new test in `LanguageContext.test.tsx` (if it exists) to verify `t` returns the key when missing and logs a warning.

### Build Verification
- [ ] `npm run build`: Verify the project builds without errors.

### Manual Verification (Simulated)
- [ ] Check `translations.ts` manually to ensure `game.loading` and other P0 keys are present.

## Quality Gates
- [ ] Passes "No Prior Knowledge" test.
- [ ] All keys in components exist in `translations.ts`.
- [ ] Build is successful.
