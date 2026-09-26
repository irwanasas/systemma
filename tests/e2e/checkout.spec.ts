import { expect, test } from "@playwright/test";
import { expectPath, login, logout, confirmAction } from "./fixtures";

test("agent fills the grid, adds a custom size, and checks out two batches as two orders", async ({ page }) => {
  await login(page, "e2e-buyer");
  await expectPath(page, "/catalog");

  await page.goto("/catalog/e2e-cart");
  await page.getByLabel("Jumlah Hitam ukuran S").fill("2");
  await page.getByLabel("Jumlah Putih ukuran M").fill("1");
  const gridForm = page.locator("form", { has: page.getByRole("button", { name: "Simpan ke keranjang" }) });
  await gridForm.getByRole("button", { name: "Simpan ke keranjang" }).click();
  await expect(gridForm.getByRole("status")).toHaveText("Keranjang diperbarui.");

  await page.getByText("Custom ukuran", { exact: true }).click();
  const customForm = page.locator("form", { has: page.getByRole("button", { name: "Tambah ukuran custom" }) });
  await customForm.getByLabel("Warna").selectOption({ label: "Putih" });
  await customForm.getByLabel(/Lingkar dada/).fill("150");
  await customForm.getByLabel(/Panjang badan/).fill("140");
  await customForm.getByRole("button", { name: "Tambah ukuran custom" }).click();
  await expect(customForm.getByRole("alert")).toHaveText("Lingkar dada maksimal 140 cm.");
  await customForm.getByLabel(/Lingkar dada/).fill("120.5");
  await customForm.getByRole("button", { name: "Tambah ukuran custom" }).click();
  await expect(customForm.getByRole("status")).toHaveText("Ukuran custom ditambahkan ke keranjang.");

  await page.goto("/catalog/e2e-cart-two");
  await page.getByLabel("Jumlah Hitam ukuran M").fill("3");
  await page.getByRole("button", { name: "Simpan ke keranjang" }).click();
  await expect(page.getByRole("status")).toHaveText("Keranjang diperbarui.");

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "E2E Keranjang · PO B1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "E2E Kedua · PO B1" })).toBeVisible();
  const summary = page.getByRole("region", { name: "Ringkasan" });
  await expect(summary).toContainText("Rp 830.000".replace(" ", " "));
  await expect(summary).toContainText("Rp 207.500".replace(" ", " "));
  await expect(page.getByText("akan dibuat 2 pesanan terpisah")).toBeVisible();

  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("dialog")).toContainText("Pastikan pesanan sudah benar. Setelah DP dibayar, pesanan tidak bisa diubah atau dibatalkan.");
  await expect(page.getByRole("dialog")).toContainText("Rp\u00a0207.500");
  await page.getByLabel("Saya sudah memastikan pesanan ini benar.").check();
  await page.getByRole("button", { name: "Buat pesanan" }).click();

  await expectPath(page, "/orders");
  const confirmation = page.getByRole("status");
  await expect(confirmation).toContainText("Checkout berhasil");
  await expect(confirmation.getByRole("listitem")).toHaveCount(2);
  await expect(confirmation).toContainText(/AUR-\d{4}-\d{6}/);

  await page.goto("/cart");
  await expect(page.getByText("Keranjang masih kosong.")).toBeVisible();
});

test("agent cancels an order before paying DP", async ({ page }) => {
  await login(page, "e2e-canceller");
  await expectPath(page, "/catalog");
  await page.goto("/catalog/e2e-cart");
  await page.getByLabel("Jumlah Hitam ukuran S").fill("1");
  await page.getByRole("button", { name: "Simpan ke keranjang" }).click();
  await expect(page.getByRole("status")).toHaveText("Keranjang diperbarui.");
  await page.goto("/cart");
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByLabel("Saya sudah memastikan pesanan ini benar.").check();
  await page.getByRole("button", { name: "Buat pesanan" }).click();
  await expectPath(page, "/orders");

  await page.getByRole("status").getByRole("link").click();
  await expect(page.getByRole("definition").first()).toHaveText("Menunggu DP");
  await page.getByRole("button", { name: "Batalkan pesanan" }).click();
  await confirmAction(page, "Batalkan pesanan");
  await expect(page.getByRole("definition").first()).toHaveText("Dibatalkan");
  await expect(page.getByRole("button", { name: "Batalkan pesanan" })).toHaveCount(0);

  const orderUrl = page.url();
  await logout(page);
  await expectPath(page, "/login");
  await login(page, "e2e-buyer");
  await expectPath(page, "/catalog");
  const response = await page.goto(orderUrl);
  expect(response?.status()).toBe(404);
});
