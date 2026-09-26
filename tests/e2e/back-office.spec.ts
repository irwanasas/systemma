import { expect, test } from "@playwright/test";
import { expectPath, login } from "./fixtures";

test.describe.configure({ mode: "serial" });

test("admin settings, announcements, notifications and audit log", async ({ browser }) => {
  test.setTimeout(90_000);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, "e2e-admin");
  await expectPath(admin, "/dashboard");

  await admin.goto("/settings");
  const bankForm = admin.locator("form", { has: admin.getByRole("button", { name: "Simpan rekening" }) });
  await bankForm.getByLabel("Nama bank").first().fill("BCA");
  await bankForm.getByLabel("Nomor rekening").first().fill("abc");
  await bankForm.getByLabel("Atas nama").first().fill("Aurora Hijab");
  await bankForm.getByRole("button", { name: "Simpan rekening" }).click();
  await expect(bankForm.getByRole("alert")).toHaveText("Rekening baris 1: nomor rekening hanya boleh angka.");
  await bankForm.getByLabel("Nomor rekening").first().fill("1234567890");
  await bankForm.getByRole("button", { name: "Simpan rekening" }).click();
  await expect(bankForm.getByRole("status")).toHaveText("Pengaturan disimpan.");

  await admin.goto("/announcements");
  await admin.getByLabel("Judul").fill("PO Lebaran dibuka");
  await admin.getByLabel("Isi").fill("Batch B2 Zelline dibuka minggu depan.");
  await admin.getByRole("button", { name: "Terbitkan" }).click();
  await expect(admin.getByRole("status")).toContainText("diterbitkan untuk semua agen");

  const agentContext = await browser.newContext();
  const agent = await agentContext.newPage();
  await login(agent, "e2e-notify");
  await expectPath(agent, "/catalog");
  await agent.goto("/announcements");
  await expect(agent.getByRole("heading", { name: "PO Lebaran dibuka" })).toBeVisible();
  await expect(agent.getByRole("button", { name: /Hapus pengumuman/ })).toHaveCount(0);

  await agent.goto("/catalog/e2e-cart");
  await agent.getByLabel("Jumlah Putih ukuran S").fill("2");
  await agent.getByRole("button", { name: "Simpan ke keranjang" }).click();
  await expect(agent.getByRole("status")).toHaveText("Keranjang diperbarui.");
  await agent.goto("/cart");
  await agent.getByRole("button", { name: "Checkout" }).click();
  await agent.getByLabel("Saya sudah memastikan pesanan ini benar.").check();
  await agent.getByRole("button", { name: "Buat pesanan" }).click();
  await expectPath(agent, "/orders");
  const orderLink = agent.getByRole("status").getByRole("link");
  const orderNumber = (await orderLink.textContent()) ?? "";
  await orderLink.click();
  await expect(agent.getByText("BCA 1234567890 a.n. Aurora Hijab")).toBeVisible();

  await admin.goto("/dashboard");
  await expect(admin.getByRole("link", { name: /notifikasi baru/ })).toBeVisible();
  const notification = admin.getByRole("listitem").filter({ hasText: orderNumber });
  await expect(notification).toContainText("Pesanan baru");
  await expect(notification).toContainText("e2e-notify");
  await admin.getByRole("button", { name: "Tandai semua sudah dibaca" }).click();
  await expect(admin.getByRole("link", { name: /notifikasi baru/ })).toHaveCount(0);

  await admin.goto("/audit-log?entity=settings");
  await expect(admin.getByRole("cell", { name: "update_settings" }).first()).toBeVisible();

  await admin.goto("/announcements");
  admin.once("dialog", (dialog) => dialog.accept());
  await admin.getByRole("button", { name: "Hapus pengumuman PO Lebaran dibuka" }).click();
  await expect(admin.getByRole("heading", { name: "PO Lebaran dibuka" })).toHaveCount(0);

  await agent.goto("/audit-log");
  await expectPath(agent, "/catalog");
  await agent.goto("/settings");
  await expectPath(agent, "/catalog");

  await adminContext.close();
  await agentContext.close();
});
