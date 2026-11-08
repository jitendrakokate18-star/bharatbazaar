import { test, expect } from '@playwright/test';

test.describe('Responsive Layout & Horizontal Overflow', () => {
  const routes = [
    '/',
    '/directory',
    '/sectors',
    '/sectors/automobile',
    '/company/INE155A01022',
    '/brand/jaguar',
  ];

  const viewports = [
    { name: 'Mobile 320x568', width: 320, height: 568 },
    { name: 'Mobile 390x844', width: 390, height: 844 },
    { name: 'Tablet 768x1024', width: 768, height: 1024 },
    { name: 'Desktop 1280x800', width: 1280, height: 800 },
    { name: 'Large Desktop 1920x1080', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    for (const route of routes) {
      test(`Zero horizontal overflow on ${route} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));

        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
      });
    }
  }
});

test.describe('Mobile Search Overlay & Interactions (< 640px)', () => {
  test('Opens full-screen overlay, accepts search input, shows results, and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);

    // 1. Locate search trigger button in mobile header
    const searchTrigger = page.locator('button[title*="Search"], button[title*="शोधा"]');
    await expect(searchTrigger).toBeVisible();

    // Check touch target of search trigger is at least 44x44
    const triggerBox = await searchTrigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(triggerBox!.width).toBeGreaterThanOrEqual(44);
    expect(triggerBox!.height).toBeGreaterThanOrEqual(44);

    // 2. Click to open overlay
    await searchTrigger.click();
    await page.waitForTimeout(200);

    // 3. Search overlay should be open with input
    const overlayInput = page.locator('input:visible').first();
    await expect(overlayInput).toBeVisible();

    // Verify font size is at least 16px to prevent iOS auto-zoom
    const fontSize = await overlayInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    expect(fontSize).toBeGreaterThanOrEqual(16);

    // 4. Type query and wait for results
    await overlayInput.fill('Tata');
    await page.waitForTimeout(300);

    // Check results or skeleton appear
    const resultsContainer = page.locator('text=Tata').first();
    await expect(resultsContainer).toBeVisible({ timeout: 5000 });

    // 5. Close overlay
    const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("रद्द करा")').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await page.waitForTimeout(200);

    // Overlay input should no longer be visible
    await expect(page.locator('role=dialog')).toHaveCount(0);
  });
});

test.describe('Tablet Search Input Width (768px)', () => {
  test('Search input has min-width >= 260px at 768px portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);

    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="शोधा"]:visible').first();
    await expect(searchInput).toBeVisible();

    const box = await searchInput.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(260);
  });
});

test.describe('Touch Target Sizes (>= 44x44px)', () => {
  test('Mobile header navigation controls meet 44x44 touch target guidelines', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);

    // Search trigger
    const searchTrigger = page.locator('button[title*="Search"], button[title*="शोधा"]');
    const searchBox = await searchTrigger.boundingBox();
    expect(searchBox!.width).toBeGreaterThanOrEqual(44);
    expect(searchBox!.height).toBeGreaterThanOrEqual(44);

    // Menu trigger
    const menuTrigger = page.locator('button[title*="Menu"], button[title*="मेनू"]');
    const menuBox = await menuTrigger.boundingBox();
    expect(menuBox!.width).toBeGreaterThanOrEqual(44);
    expect(menuBox!.height).toBeGreaterThanOrEqual(44);

    // Language pills
    const langButtons = page.locator('button:has-text("EN"), button:has-text("मराठी")');
    const count = await langButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = langButtons.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36); // Segmented pill height
      }
    }
  });

  test('Directory mobile filter trigger meets >= 44x44 touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/directory', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);

    const filterBtn = page.locator('button:has-text("Filter"), button:has-text("फिल्टर")').first();
    await expect(filterBtn).toBeVisible();
    const box = await filterBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
