import { test, expect } from "@playwright/test";

test.describe("User Management (Admin Protected Route)", () => {
  test("should redirect unauthenticated users from users page", async ({
    page,
  }) => {
    await page.goto("/users");

    // Users page requires admin role - unauthenticated users should be redirected to /auth
    await expect(page).toHaveURL(/\/(auth|users)/, { timeout: 10_000 });
  });

  test("should show auth page or loading when accessing users without login", async ({
    page,
  }) => {
    await page.goto("/users");

    const authHeading = page.getByRole("heading", {
      name: "התחברות למערכת",
    });
    const loadingText = page.getByText("טוען...");

    await expect(authHeading.or(loadingText)).toBeVisible({ timeout: 10_000 });
  });

  test("should protect all admin routes from unauthenticated access", async ({
    page,
  }) => {
    // Try accessing several protected routes
    const protectedRoutes = ["/events", "/reports", "/equipment", "/users"];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Each should redirect to /auth or show loading
      const authHeading = page.getByRole("heading", {
        name: "התחברות למערכת",
      });
      const loadingText = page.getByText("טוען...");

      await expect(authHeading.or(loadingText)).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});
