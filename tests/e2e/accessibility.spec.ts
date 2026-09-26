import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectPath, login } from "./fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const expectNoViolations = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    violations.map(({ id, nodes }) => `${path} ${id}: ${nodes.map(({ target }) => target.join(" ")).join(", ")}`),
  ).toEqual([]);
};

test("login page has no WCAG 2.1 AA violations", async ({ page }) => {
  await expectNoViolations(page, "/login");
});

test("agent pages have no WCAG 2.1 AA violations", async ({ page }) => {
  await login(page, "e2e-a11y");
  await expectPath(page, "/catalog");
  for (const path of ["/catalog", "/catalog/e2e-cart", "/cart", "/orders", "/announcements"]) {
    await expectNoViolations(page, path);
  }
});

test("order modal has no WCAG 2.1 AA violations", async ({ page }) => {
  await login(page, "e2e-a11y");
  await expectPath(page, "/catalog");
  await page.getByRole("link", { name: "E2E Keranjang" }).click();
  await expect(page.getByRole("dialog", { name: "E2E Keranjang" })).toBeVisible();
  await page.getByText("Tambah ukuran custom", { exact: true }).click();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(" ")).join(", ")}`)).toEqual([]);
});

test("admin pages have no WCAG 2.1 AA violations", async ({ page }) => {
  await login(page, "e2e-admin");
  await expectPath(page, "/dashboard");
  for (const path of ["/dashboard", "/orders", "/payments", "/products", "/products/new", "/po-batches", "/agents", "/settings", "/audit-log", "/recap"]) {
    await expectNoViolations(page, path);
  }
});

test("order grid supports arrow-key navigation", async ({ page }) => {
  await login(page, "e2e-a11y");
  await expectPath(page, "/catalog");
  await page.goto("/catalog/e2e-cart");
  const first = page.getByLabel("Jumlah Hitam ukuran S");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Jumlah Hitam ukuran M")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Jumlah Putih ukuran M")).toBeFocused();
  await page.keyboard.type("3");
  await expect(page.locator("dd", { hasText: /^3 pcs$/ })).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("order grid becomes one accordion per color with steppers", async ({ page }) => {
    await login(page, "e2e-a11y");
    await expectPath(page, "/catalog");
    await page.goto("/catalog/e2e-cart");
    await expect(page.getByLabel("Jumlah Hitam ukuran S")).toBeHidden();
    await page.getByRole("button", { name: /Hitam · 0 pcs/ }).click();
    await page.getByRole("button", { name: "Tambah Hitam M" }).click();
    await page.getByRole("button", { name: "Tambah Hitam M" }).click();
    await expect(page.getByLabel("Jumlah Hitam M")).toHaveValue("2");
    await expect(page.getByText("2 pcs").first()).toBeVisible();
    await expect(page.getByText("Rp 60.000")).toBeVisible();
  });
});
