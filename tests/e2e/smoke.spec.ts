import { test, expect } from '@playwright/test';

test('smoke test - app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Adventure Forge/i);
  
  // Check for the main menu button using data-testid
  const startButton = page.getByTestId('new-adventure-btn');
  await expect(startButton).toBeVisible({ timeout: 10000 });
});
