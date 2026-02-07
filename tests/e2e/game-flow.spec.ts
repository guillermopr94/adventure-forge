import { test, expect } from '@playwright/test';

// Skip this test in CI - requires real AI backend with valid API keys
// Run locally with: npx playwright test game-flow.spec.ts
test.skip(!!process.env.CI, 'Skipping AI-dependent test in CI environment');

test('User can start a new game in Spanish and reach the first option', async ({ page }) => {
    test.setTimeout(200000); // Increase timeout for AI generation

    // Log browser console messages
    page.on('console', msg => {
        console.log(`BROWSER [${msg.type()}] ${msg.text()}`);
    });

    // 1. Open the application
    console.log('Navigating to home page...');
    await page.goto('/');

    // 2. Click settings button
    console.log('Opening settings...');
    const settingsBtn = page.getByTestId('settings-open-btn');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // 3. Select Spanish
    console.log('Selecting Spanish language...');
    const spanishBtn = page.getByTestId('lang-es');
    await expect(spanishBtn).toBeVisible();
    await spanishBtn.click();

    // 4. Close settings
    console.log('Closing settings...');
    const closeBtn = page.getByTestId('settings-close-btn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // 5. Start new adventure (Wait for welcome message or menu)
    console.log('Starting new adventure...');
    const newAdventureBtn = page.getByTestId('new-adventure-btn');
    await expect(newAdventureBtn).toBeVisible();
    await newAdventureBtn.click();

    // 6. Confirm adventure selection (Genre carousel)
    console.log('Confirming adventure selection...');
    const playGameBtn = page.getByTestId('start-adventure-btn');
    await expect(playGameBtn).toBeVisible();
    await playGameBtn.click();

    // 7. Advance through cinematics
    console.log('Waiting for game image container...');
    const gameImageContainer = page.getByTestId('game-cinematic-container');
    await expect(gameImageContainer).toBeVisible({ timeout: 60000 });

    const optionsContainer = page.getByTestId('game-options-container');

    console.log('Advancing through cinematics...');
    // We'll click to advance until options appear, with a safety limit
    for (let i = 0; i < 15; i++) {
        const optionsVisible = await optionsContainer.isVisible();
        if (optionsVisible) {
            console.log('Options are now visible!');
            break;
        }

        // Check for errors (toasts)
        const errorToast = page.locator('.hot-toast-error');
        if (await errorToast.isVisible()) {
            const errorMsg = await errorToast.textContent();
            throw new Error(`Game flow failed with toast error: ${errorMsg}`);
        }

        // Wait for the "Click to advance" hint to be visible before clicking
        const clickHint = page.locator('.cinematic-text-overlay.visible .click-hint');
        try {
            await clickHint.waitFor({ state: 'visible', timeout: 10000 });
            console.log(`Clicking to advance cinematic (attempt ${i + 1})`);
            await gameImageContainer.click();
        } catch (e) {
            // If hint doesn't appear, maybe we are still loading or options are about to appear
            console.log('Click hint not visible yet, still waiting for AI...');
            await page.waitForTimeout(2000);
        }
    }

    // 8. Wait for options to appear
    console.log('Waiting for options after cinematic advancement...');
    await expect(optionsContainer).toBeVisible({ timeout: 30000 });

    // 9. Click the first option
    const firstOption = optionsContainer.locator('button').first();
    const optionText = await firstOption.textContent();
    console.log(`Selecting option: ${optionText}`);
    await firstOption.click();

    // 10. Assert that the options disappear (game is processing next part)
    await expect(optionsContainer).not.toBeVisible();
});
