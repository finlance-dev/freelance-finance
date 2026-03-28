import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with Finlance title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Finlance/);
  });

  test("hero section is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/การเงิน|Finance/);
  });

  test("CTA button links to signup", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator('a[href="/signup"]').first();
    await expect(cta).toBeVisible();
  });

  test("features section exists", async ({ page }) => {
    await page.goto("/");
    const features = page.locator("#features");
    await expect(features).toBeAttached();
  });

  test("pricing section exists", async ({ page }) => {
    await page.goto("/");
    const pricing = page.locator("#pricing");
    await expect(pricing).toBeAttached();
  });

  test("FAQ section exists", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("#faq");
    await expect(faq).toBeAttached();
  });
});
