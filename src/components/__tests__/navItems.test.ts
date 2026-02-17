import { describe, it, expect } from "vitest";
import { navItems, getNavItems } from "../navigation/navItems";

describe("navItems - integration", () => {
  it("contains required navigation items", () => {
    const labels = navItems.map((item) => item.label);
    expect(labels).toContain("אירועים");
    expect(labels).toContain("דיווחים");
    expect(labels).toContain("ציוד");
    expect(labels).toContain("תיעוד");
  });

  it("all items have path, label, and icon", () => {
    for (const item of navItems) {
      expect(item.path).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeDefined();
    }
  });

  it("all paths start with /", () => {
    for (const item of navItems) {
      expect(item.path.startsWith("/")).toBe(true);
    }
  });

  it("marks 'משתמשים' as admin-only", () => {
    const usersItem = navItems.find((item) => item.label === "משתמשים");
    expect(usersItem).toBeDefined();
    expect(usersItem?.adminOnly).toBe(true);
  });

  it("no other items are admin-only", () => {
    const adminItems = navItems.filter((item) => item.adminOnly);
    expect(adminItems).toHaveLength(1);
    expect(adminItems[0].label).toBe("משתמשים");
  });
});

describe("getNavItems - role-based filtering", () => {
  it("returns all items for admin users", () => {
    const items = getNavItems(true);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("משתמשים");
    expect(items.length).toBe(navItems.length);
  });

  it("excludes admin-only items for non-admin users", () => {
    const items = getNavItems(false);
    const labels = items.map((i) => i.label);
    expect(labels).not.toContain("משתמשים");
    expect(items.length).toBe(navItems.length - 1);
  });

  it("defaults to non-admin when no argument passed", () => {
    const items = getNavItems();
    const labels = items.map((i) => i.label);
    expect(labels).not.toContain("משתמשים");
  });
});
