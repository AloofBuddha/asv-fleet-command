import { test, expect } from "@playwright/test";

test("app renders with dark map", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 10000,
  });
  // Wait for tiles + WebSocket data
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "e2e/screenshots/app.png", fullPage: true });
});

test("vessel markers appear and move", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 10000,
  });
  // Wait for fleet data to arrive via WebSocket
  await page.waitForTimeout(4000);
  await page.screenshot({
    path: "e2e/screenshots/vessels-t0.png",
    fullPage: true,
  });

  // Wait a few seconds for vessels to move
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: "e2e/screenshots/vessels-t5.png",
    fullPage: true,
  });
});
