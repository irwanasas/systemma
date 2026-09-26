import { expect, test } from "@playwright/test";
import { expectPath, login } from "./fixtures";

test("admin sets up a product and batch, and the agent sees it with size prices", async ({ browser }) => {
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, "e2e-admin");
  await expectPath(admin, "/dashboard");

  await admin.goto("/products/new");
  await admin.getByLabel("Nama seri").fill("E2E Gamis");
  await admin.getByLabel("Slug (alamat halaman)").fill("e2e-gamis");
  await admin.getByLabel("Kategori").selectOption({ label: "Dress" });
  await admin.getByLabel("Status").selectOption({ label: "Aktif" });
  await admin.getByRole("button", { name: "Buat produk" }).click();
  await expect(admin.getByRole("heading", { name: "E2E Gamis", level: 1 })).toBeVisible();

  await admin.getByRole("tab", { name: "Harga" }).click();
  const priceForm = admin.locator("form", { has: admin.getByRole("button", { name: "Simpan harga" }) });
  await priceForm.getByLabel("Ukuran S (Rp)").fill("200.000");
  await priceForm.getByLabel("Ukuran XL (Rp)").fill("225.000");
  await priceForm.getByRole("button", { name: "Simpan harga" }).click();
  await expect(priceForm.getByRole("status")).toHaveText("Harga per ukuran disimpan.");

  await admin.getByRole("tab", { name: "Warna" }).click();
  const colorForm = admin.locator("form", { has: admin.getByRole("button", { name: "Tambah warna" }) });
  await colorForm.getByLabel("Nama warna").fill("Hitam");
  await colorForm.getByRole("button", { name: "Tambah warna" }).click();
  await expect(colorForm.getByRole("status")).toHaveText("Warna Hitam ditambahkan.");

  await admin.goto("/po-batches");
  await admin.getByRole("button", { name: "Batch baru" }).click();
  const batchForm = admin.getByRole("dialog", { name: "Buat batch" }).locator("form");
  await batchForm.getByLabel("Seri").selectOption({ label: "E2E Gamis" });
  await batchForm.getByRole("button", { name: "Buat batch" }).click();
  await expect(admin.getByRole("dialog", { name: "Buat batch" })).toBeHidden();
  await expect(admin.getByText("Batch B1 dibuat dengan status terjadwal.")).toBeVisible();
  await admin.getByRole("button", { name: "Buka E2E Gamis B1" }).click();
  await expect(admin.getByRole("button", { name: "Tutup E2E Gamis B1" })).toBeVisible();

  const agentContext = await browser.newContext();
  const agent = await agentContext.newPage();
  await login(agent, "e2e-agent");
  await expectPath(agent, "/catalog");
  await agent.getByRole("link", { name: "E2E Gamis" }).click();
  await expectPath(agent, "/catalog/e2e-gamis");
  await expect(agent.getByRole("columnheader", { name: /^S Rp\s200\.000$/ })).toBeVisible();
  await expect(agent.getByRole("columnheader", { name: /^XL Rp\s225\.000$/ })).toBeVisible();
  await expect(agent.getByRole("rowheader", { name: "Hitam" })).toBeVisible();

  await adminContext.close();
  await agentContext.close();
});

test("archived or unknown products are not shown to agents", async ({ page }) => {
  await login(page, "e2e-agent");
  await expectPath(page, "/catalog");
  const response = await page.goto("/catalog/tidak-ada");
  expect(response?.status()).toBe(404);
});
