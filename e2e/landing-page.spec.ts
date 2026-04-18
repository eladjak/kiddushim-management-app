import { test, expect } from "@playwright/test";

test.describe("Landing Page (/landing)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/landing");
  });

  test("should load the hero section with Hebrew heading", async ({
    page,
  }) => {
    // Main heading
    await expect(
      page.getByRole("heading", { name: "קידושישי מגדל העמק" })
    ).toBeVisible();

    // Subtitle text
    await expect(
      page.getByText("חוויית קבלת שבת קהילתית ומאחדת")
    ).toBeVisible();
  });

  test("should show the official logo in the hero section", async ({
    page,
  }) => {
    const logo = page.getByAltText("קידושישי מגדל העמק");
    await expect(logo).toBeVisible();
  });

  test("should have registration and events navigation buttons", async ({
    page,
  }) => {
    // Registration button
    const registerButton = page.getByRole("button", {
      name: "הרשמה לאירוע הבא",
    });
    await expect(registerButton).toBeVisible();

    // Events page navigation button
    const eventsButton = page.getByRole("button", { name: "לוח אירועים" });
    await expect(eventsButton).toBeVisible();
  });

  test("should show the about section with description", async ({ page }) => {
    // About section heading
    await expect(
      page.getByRole("heading", { name: "מה זה קידושישי?" })
    ).toBeVisible();

    // About section content cards
    await expect(page.getByText("קהילה מאוחדת")).toBeVisible();
    await expect(page.getByText("מוזיקה ויצירה")).toBeVisible();
    await expect(page.getByText("חוויה משפחתית")).toBeVisible();
  });

  test("should show the event details section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "איך נראה אירוע קידושישי?" })
    ).toBeVisible();

    // Event detail items
    await expect(page.getByText("משך האירוע")).toBeVisible();
    await expect(page.getByText("מיקומים מרכזיים")).toBeVisible();
    await expect(page.getByText("תוכן מגוון")).toBeVisible();

    // Next event card - should show either upcoming event or placeholder
    const nextEventHeading = page.getByText("האירוע הבא").first();
    const planningHeading = page.getByText("האירוע הבא בתכנון");
    const loadingHeading = page.getByText("טוען אירוע...");
    await expect(
      nextEventHeading.or(planningHeading).or(loadingHeading)
    ).toBeVisible();
  });

  test("should show the free participation badge", async ({ page }) => {
    await expect(page.getByText("השתתפות ללא עלות").first()).toBeVisible();
  });

  test("should show the partners section with partner logos", async ({
    page,
  }) => {
    // Partners section heading
    await expect(
      page.getByRole("heading", { name: "מי מאחורי הפרויקט?" })
    ).toBeVisible();

    // Main partner cards
    await expect(page.getByText("ארגון רבני צהר")).toBeVisible();
    await expect(page.getByText("הגרעין התורני מגדל העמק")).toBeVisible();

    // "Partners and supporters" sub-heading
    await expect(page.getByText("שותפים ותומכים")).toBeVisible();

    // Specific partner logos
    await expect(
      page.getByAltText("גרעין תורני אורות יהודה")
    ).toBeVisible();
    await expect(page.getByAltText("עיריית מגדל העמק")).toBeVisible();
    await expect(page.getByAltText("האגף לתרבות יהודית")).toBeVisible();
  });

  test("should show the contact section with phone and links", async ({
    page,
  }) => {
    // Contact section heading
    await expect(
      page.getByText("נשמח לענות על שאלות ולקבל אותכם")
    ).toBeVisible();

    // Coordinator name
    await expect(page.getByText("אלעד - רכז קידושישי")).toBeVisible();

    // Phone number link
    await expect(page.getByText("052-542-7474")).toBeVisible();

    // WhatsApp group
    await expect(page.getByText("קבוצת וואטסאפ")).toBeVisible();
    await expect(page.getByText("הצטרפות לקבוצה")).toBeVisible();

    // Updates link
    await expect(page.getByText("קישור לעדכונים")).toBeVisible();
  });

  test("should navigate to registration form when clicking register button", async ({
    page,
  }) => {
    // Click the hero register button
    await page
      .getByRole("button", { name: "הרשמה לאירוע הבא" })
      .first()
      .click();

    // Registration form should appear with the Hebrew heading
    await expect(
      page.getByRole("heading", { name: "הרשמה לקידושישי מגדל העמק" })
    ).toBeVisible();

    // Form fields should be present
    await expect(page.getByLabel("שם מלא *")).toBeVisible();
    await expect(page.getByLabel("טלפון *")).toBeVisible();
    await expect(page.getByLabel("אימייל")).toBeVisible();
    await expect(page.getByLabel("כמה אנשים במשפחה?")).toBeVisible();
  });

  test("should show back button on registration form and navigate back", async ({
    page,
  }) => {
    // Navigate to registration form
    await page
      .getByRole("button", { name: "הרשמה לאירוע הבא" })
      .first()
      .click();

    // Back button should be visible (aria-label is "חזרה לעמוד הראשי")
    const backButton = page.getByRole("button", { name: "חזרה לעמוד הראשי" });
    await expect(backButton).toBeVisible();

    // Click back to return to landing page
    await backButton.click();

    // Should see the hero heading again
    await expect(
      page.getByRole("heading", { name: "קידושישי מגדל העמק" })
    ).toBeVisible();
  });

  test("should show the footer with management login link", async ({
    page,
  }) => {
    // Footer should have the management login link
    await expect(page.getByText("כניסה לצוות ניהול")).toBeVisible();

    // Footer should have project documentation link
    await expect(page.getByText("תיעוד הפרויקט")).toBeVisible();

    // Footer should have the copyright text
    await expect(page.getByText(/קידושישי מגדל העמק - פרויקט/)).toBeVisible();
  });

  test("should have proper RTL layout", async ({ page }) => {
    // Check that the page has RTL direction via html[dir="rtl"] or any container with dir="rtl"
    const rtlElement = page.locator("[dir='rtl']").first();
    await expect(rtlElement).toBeAttached({ timeout: 10_000 });

    // The page should render content in Hebrew
    await expect(
      page.getByText("קידושישי מגדל העמק").first()
    ).toBeVisible();
  });
});
