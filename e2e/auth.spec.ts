import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("login page has password field", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("login has link to signup", async ({ page }) => {
    await page.goto("/login");
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
  });
});
