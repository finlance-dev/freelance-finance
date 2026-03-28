import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth by setting localStorage before navigation
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("ff_user", JSON.stringify({ email: "test@test.com", name: "Test User", id: "test-123" }));
      localStorage.setItem("ff_plan", JSON.stringify({ plan: "pro", startDate: new Date().toISOString() }));
    });
    await page.goto("/dashboard");
  });

  test("dashboard loads with stat cards", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
    // Stat cards should be present
    await expect(page.locator(".grid").first()).toBeVisible();
  });

  test("can navigate to transactions", async ({ page }) => {
    await page.click('a[href="/dashboard/transactions"]');
    await expect(page).toHaveURL(/transactions/);
  });

  test("can navigate to invoices", async ({ page }) => {
    await page.click('a[href="/dashboard/invoices"]');
    await expect(page).toHaveURL(/invoices/);
  });

  test("load demo data button exists", async ({ page }) => {
    const demoBtn = page.locator("button", { hasText: /โหลด|Demo/ });
    await expect(demoBtn).toBeVisible();
  });

  test("widget settings gear button exists", async ({ page }) => {
    const settingsBtn = page.locator("button[title]").first();
    await expect(settingsBtn).toBeVisible();
  });
});
