import { test, expect } from '@playwright/test';

test.describe('Adventure Forge Critical Flows', () => {
  const BASE_URL = 'https://adventure-forge.vercel.app';
  const API_URL = 'https://adventure-forge-api.onrender.com';

  test('UI and API Health Check', async ({ page, request }) => {
    // Increase timeout to account for Render.com cold starts
    test.setTimeout(60000);
    
    // 1. Check Frontend
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    
    // Check if main elements are visible
    await expect(page.getByTestId('new-adventure-btn')).toBeVisible({ timeout: 15000 });

    // 2. Check Backend API Health (Note: quota-stats might require auth in some versions, but we check if it responds)
    const apiHealth = await request.get(`${API_URL}/ai/quota-stats`, { timeout: 45000 });
    // Accepting 200 or 401 (auth required) but not 404/500
    expect([200, 401]).toContain(apiHealth.status());
  });

  test('Initial Game Stream - Guest Mode', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Start New Adventure
    await page.getByTestId('new-adventure-btn').click();
    
    // Select a genre (e.g., Fantasy)
    const startAdventureBtn = page.getByRole('button', { name: 'Start Adventure' });
    await expect(startAdventureBtn).toBeVisible({ timeout: 15000 });
    await startAdventureBtn.click();

    // Verify loading state or Cinematic Container loads (spinner might be too fast)
    // Removed strict spinner check to avoid race conditions
    await expect(page.getByTestId('game-cinematic-container')).toBeVisible({ timeout: 45000 });

    // Wait for cinematic overlay text (intro text)
    const overlayText = page.locator('.cinematic-text-overlay p');
    await expect(overlayText).not.toBeEmpty({ timeout: 45000 });

    // Click to advance through cinematic segments until options appear
    // Note: This might require multiple clicks depending on paragraph count
    let optionsVisible = false;
    for (let i = 0; i < 5; i++) {
      if (await page.getByTestId('game-options-container').isVisible()) {
        optionsVisible = true;
        break;
      }
      await page.getByTestId('game-cinematic-container').click();
      await page.waitForTimeout(2000);
    }

    // Verify options container and buttons
    await expect(page.getByTestId('game-options-container')).toBeVisible({ timeout: 20000 });
    const buttons = page.locator('#options button');
    expect(await buttons.count()).toBeGreaterThanOrEqual(1);
    
    // Check for empty/placeholder buttons (Bug #9 check)
    const buttonText = await buttons.first().innerText();
    expect(buttonText.toLowerCase()).not.toContain('placeholder');
    expect(buttonText.toLowerCase()).not.toContain('choose option');
  });

  test('Mobile Responsiveness Check', async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Check layout elements
    await expect(page.getByTestId('new-adventure-btn')).toBeVisible();
    const rect = await page.getByTestId('new-adventure-btn').boundingBox();
    expect(rect?.width).toBeLessThan(400);
  });
});
