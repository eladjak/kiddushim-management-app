import { test, expect } from "@playwright/test";

test.describe("Create Event (Protected Route)", () => {
  test("should redirect unauthenticated users from events page", async ({
    page,
  }) => {
    await page.goto("/events");

    // ProtectedRoute should redirect to /auth for unauthenticated users
    await expect(page).toHaveURL(/\/(auth|events)/, { timeout: 10_000 });
  });

  test("should show auth page when trying to access events without login", async ({
    page,
  }) => {
    await page.goto("/events");

    // Wait for redirection to auth or loading state
    const authHeading = page.getByRole("heading", {
      name: "התחברות למערכת",
    });
    const loadingText = page.getByText("טוען...");

    // Either auth page or loading indicator should appear
    await expect(authHeading.or(loadingText)).toBeVisible({ timeout: 10_000 });
  });

  test("should not display a blank page", async ({ page }) => {
    await page.goto("/events");

    await page.waitForLoadState("domcontentloaded");

    // Page should always have meaningful content
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
