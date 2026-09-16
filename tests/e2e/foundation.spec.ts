import { expect, test } from "@playwright/test";

test("public foundation exposes operator sign-in without private data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /one dependable operating loop/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Operator sign in" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Ananya Rao");
});

test("operator sign-in is usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in to broker os/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeEditable();
  await expect(page.getByLabel("Password")).toBeEditable();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

