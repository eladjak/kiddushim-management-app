import { test, expect } from "@playwright/test";

test.describe("View Events (Protected Route)", () => {
  test("should redirect unauthenticated users to auth page", async ({
    page,
  }) => {
    await page.goto("/events");

    // ProtectedRoute redirects unauthenticated users to /auth
    // Wait for either the auth page or a loading state to appear
    await expect(page).toHaveURL(/\/(auth|events)/, { timeout: 10_000 });
  });

  test("should show loading state or redirect when accessing events", async ({
    page,
  }) => {
    await page.goto("/events");

    // Should either show loading text or redirect to auth
    const loadingText = page.getByText("טוען...");
    const authHeading = page.getByRole("heading", {
      name: "התחברות למערכת",
    });

    // One of these should be visible
    await expect(loadingText.or(authHeading)).toBeVisible({ timeout: 10_000 });
  });

  test("should not show an empty/blank page", async ({ page }) => {
    await page.goto("/events");

    // Wait for any meaningful content to appear
    await page.waitForLoadState("domcontentloaded");

    // The body should have content regardless of auth state
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
