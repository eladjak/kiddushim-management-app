import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("should display auth page with login form and Hebrew heading", async ({
    page,
  }) => {
    // Auth page should show the login heading
    await expect(
      page.getByRole("heading", { name: "התחברות למערכת" })
    ).toBeVisible();

    // Should have email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Should have a submit button with Hebrew text
    await expect(
      page.getByRole("button", { name: "התחברות" })
    ).toBeVisible();
  });

  test("should show the kidushishi logo image", async ({ page }) => {
    const logo = page.getByAltText("קידושישי");
    await expect(logo).toBeVisible();
  });

  test("should keep user on auth page after empty form submission", async ({
    page,
  }) => {
    // Click submit without filling anything
    await page.getByRole("button", { name: "התחברות" }).click();

    // Should remain on the auth page (no redirect)
    await expect(page).toHaveURL(/\/auth/);

    // Form should still be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should toggle to signup mode with Hebrew text", async ({ page }) => {
    // Click the signup toggle link
    const signupToggle = page.getByText("אין לך חשבון? הירשם עכשיו");
    await expect(signupToggle).toBeVisible();
    await signupToggle.click();

    // After clicking, the heading should change to signup mode
    await expect(
      page.getByRole("heading", { name: "הרשמה למערכת" })
    ).toBeVisible();

    // Should still have email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should show forgot password form", async ({ page }) => {
    // Click the forgot password link
    const forgotLink = page.getByText("שכחת סיסמה?");
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    // Should show the password recovery heading
    await expect(
      page.getByRole("heading", { name: "שחזור סיסמה" })
    ).toBeVisible();

    // Should have email input for password reset
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("should show descriptive subtitle text", async ({ page }) => {
    // Login mode should show the instruction text
    await expect(
      page.getByText("הזן את פרטי ההתחברות שלך כדי להיכנס למערכת")
    ).toBeVisible();
  });
});
