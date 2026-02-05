import { test, expect } from '@playwright/test';

test('smoke test - app loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Adventure Forge/i);
  
  // Check for the main menu button
  const startButton = page.getByRole('button', { name: /New Adventure/i });
  // Since the app might take a second to load the AI assets, we wait for the button
  await expect(startButton).toBeVisible({ timeout: 10000 });
});
