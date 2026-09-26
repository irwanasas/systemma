import { expect, test } from "@playwright/test";
import { expectPath, login } from "./fixtures";

test("signed-out visitors see the landing page and can go to login", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pre-order seri terbaru");
  await expect(page.getByRole("heading", { name: "Cara pesan" })).toBeVisible();
  await expect(page.getByRole("list").filter({ hasText: "Pilih seri" }).getByRole("listitem")).toHaveCount(4);
  await page.getByRole("link", { name: "Masuk ke portal" }).first().click();
  await expectPath(page, "/login");
  await page.getByRole("link", { name: /Kembali ke beranda/ }).click();
  await expectPath(page, "/");
});

test("signed-in users are sent from the landing page to their home", async ({ page }) => {
  await login(page, "e2e-a11y");
  await expectPath(page, "/catalog");
  await page.goto("/");
  await expectPath(page, "/catalog");
});
