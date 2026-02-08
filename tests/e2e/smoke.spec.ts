import { test, expect } from '@playwright/test';

test('smoke test - app loads', async ({ page }) => {
  await page.goto('/');
  
  // Title can be in English or Spanish depending on i18n settings
  const title = await page.title();
  const validTitles = ['Adventure Forge', 'Elige tu propia aventura'];
  expect(validTitles.some(t => title.toLowerCase().includes(t.toLowerCase()))).toBeTruthy();
  
  // Check for the main menu button using data-testid
  const startButton = page.getByTestId('new-adventure-btn');
  await expect(startButton).toBeVisible({ timeout: 10000 });
});
