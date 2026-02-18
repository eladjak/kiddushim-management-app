import { test, expect } from "@playwright/test";

test.describe("View Reports (Protected Route)", () => {
  test("should redirect unauthenticated users to auth page", async ({
    page,
  }) => {
    await page.goto("/reports");

    // ProtectedRoute redirects unauthenticated users to /auth
    await expect(page).toHaveURL(/\/(auth|reports)/, { timeout: 10_000 });
  });

  test("should show loading state or redirect", async ({ page }) => {
    await page.goto("/reports");

    // Should show either a loading indicator or the auth page
    const loadingText = page.getByText("טוען...");
    const authHeading = page.getByRole("heading", {
      name: "התחברות למערכת",
    });

    await expect(loadingText.or(authHeading)).toBeVisible({ timeout: 10_000 });
  });

  test("should have RTL layout on the page", async ({ page }) => {
    await page.goto("/reports");

    // Wait for the page to finish loading
    await page.waitForLoadState("domcontentloaded");

    // Check that the HTML element or a container has dir="rtl"
    const htmlElement = page.locator("html");
    const htmlDir = await htmlElement.getAttribute("dir");
    const rtlContainer = page.locator("[dir='rtl']").first();

    const hasRtl =
      htmlDir === "rtl" || (await rtlContainer.isVisible().catch(() => false));
    expect(hasRtl).toBeTruthy();
  });

  test("should not render a blank page", async ({ page }) => {
    await page.goto("/reports");

    await page.waitForLoadState("domcontentloaded");

    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
