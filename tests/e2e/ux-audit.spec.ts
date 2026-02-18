import { test, expect } from '@playwright/test';

test.describe('Adventure Forge UX Audit', () => {
  test('Audit: Start Screen to Adventure Selection', async ({ page }) => {
    // 1. Load the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if start button exists (StartScreen)
    const startAppBtn = page.locator('button.start-screen-btn, button:has-text("Start"), button:has-text("Empezar")');
    if (await startAppBtn.isVisible()) {
        await startAppBtn.click();
    }

    // 2. Main Menu
    const newGameBtn = page.getByTestId('new-adventure-btn');
    await expect(newGameBtn).toBeVisible();
    
    // Check for small hit areas in Main Menu
    // The language selector buttons are often small
    const langButtons = page.locator('.language-selector button');
    const langCount = await langButtons.count();
    for (let i = 0; i < langCount; i++) {
        const box = await langButtons.nth(i).boundingBox();
        if (box) {
            console.log(`UX Check: Language button ${i} size: ${box.width}x${box.height}`);
            if (box.width < 44 || box.height < 44) {
                console.warn(`LOW_HIT_AREA: Language button ${i} is smaller than 44px (${box.width}x${box.height})`);
            }
        }
    }

    // 3. Adventure Selection
    await newGameBtn.click();
    await expect(page.locator('.genre-selection-carousel')).toBeVisible();

    // Check carousel navigation buttons
    const nextBtn = page.locator('.carousel-nav.next');
    const prevBtn = page.locator('.carousel-nav.prev');
    
    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();

    // Check sizes of carousel buttons
    const nextBox = await nextBtn.boundingBox();
    console.log(`UX Check: Carousel Next size: ${nextBox?.width}x${nextBox?.height}`);
    
    // 4. Back button check (P0 request in VISION.md)
    const backBtn = page.locator('.back-btn-absolute');
    await expect(backBtn).toBeVisible();
    
    // 5. Test responsiveness (Mobile)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check for overflows in mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    if (bodyWidth > windowWidth) {
        console.error(`MOBILE_OVERFLOW: Body scroll width (${bodyWidth}) exceeds window width (${windowWidth})`);
    }

    // Take screenshot for visual audit
    await page.screenshot({ path: 'ux-audit-mobile-selection.png' });
  });
});
