import { expect, test, type Page } from "@playwright/test";
import { expectPath, login, confirmAction } from "./fixtures";

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const uploadProof = async (page: Page, fileName: string): Promise<void> => {
  await page.getByLabel(/Foto atau file bukti transfer/).setInputFiles({ name: fileName, mimeType: "image/png", buffer: PNG_BYTES });
  await page.getByRole("button", { name: "Kirim bukti transfer" }).click();
  await expect(page.getByRole("main").getByRole("status").first()).toContainText("Bukti transfer sudah dikirim dan sedang dicek admin");
};

const statusOf = (page: Page) => page.getByRole("definition").first();

test("order goes from checkout to completed through DP review, production, settlement and shipping", async ({ browser }) => {
  test.setTimeout(90_000);
  const agentContext = await browser.newContext();
  const agent = await agentContext.newPage();
  await login(agent, "e2e-payer");
  await expectPath(agent, "/catalog");
  await agent.goto("/catalog/e2e-cart");
  await agent.getByLabel("Jumlah Hitam ukuran M").fill("4");
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

  await expect(statusOf(agent)).toHaveText("Menunggu DP");
  await expect(agent.getByLabel("Nominal yang ditransfer (Rp)")).toHaveValue("120000");
  await uploadProof(agent, "bukti-1.png");
  await agent.reload();
  await expect(statusOf(agent)).toHaveText("Bukti DP sedang dicek");
  await expect(agent.getByRole("button", { name: "Batalkan pesanan" })).toHaveCount(0);

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, "e2e-admin");
  await expectPath(admin, "/dashboard");
  await admin.goto("/payments");
  await admin.getByRole("link", { name: new RegExp(orderNumber) }).click();
  await expect(admin.getByRole("img", { name: `Bukti transfer ${orderNumber}` })).toBeVisible();
  await admin.getByLabel("Alasan penolakan (dikirim ke agen)").fill("Nominal di foto tidak terbaca");
  await admin.getByRole("button", { name: `Tolak DP ${orderNumber}` }).click();
  await expect(admin.getByRole("status")).toContainText(`DP pesanan ${orderNumber} ditolak`);

  await agent.reload();
  await expect(statusOf(agent)).toHaveText("Menunggu DP");
  await expect(agent.getByRole("main").getByRole("alert")).toContainText("Nominal di foto tidak terbaca");
  await uploadProof(agent, "bukti-2.png");

  await admin.goto("/payments");
  await admin.getByRole("link", { name: new RegExp(orderNumber) }).click();
  await admin.getByRole("button", { name: `Setujui DP ${orderNumber}` }).click();
  await confirmAction(admin, `Setujui DP ${orderNumber}`);
  await expect(admin.getByRole("status")).toContainText(`DP pesanan ${orderNumber} disetujui`);

  await admin.goto("/orders");
  await admin.getByRole("link", { name: orderNumber }).click();
  await expect(statusOf(admin)).toHaveText("DP diterima");
  await expect(admin.getByRole("region", { name: "Invoice" })).toContainText(/INV-\d{4}-\d{6}/);
  await admin.getByRole("button", { name: "Mulai produksi" }).click();
  await expect(statusOf(admin)).toHaveText("Diproduksi");
  await admin.getByRole("button", { name: "Produksi selesai, tagih pelunasan" }).click();
  await expect(statusOf(admin)).toHaveText("Menunggu pelunasan");
  await admin.getByRole("button", { name: "Tandai pelunasan diterima" }).click();
  await confirmAction(admin, "Tandai pelunasan diterima");
  await expect(statusOf(admin)).toHaveText("Lunas");
  await admin.getByRole("button", { name: "Tandai sudah dikirim" }).click();
  await expect(statusOf(admin)).toHaveText("Dikirim");
  await admin.getByRole("button", { name: "Tandai selesai" }).click();
  await expect(statusOf(admin)).toHaveText("Selesai");

  await agent.reload();
  await expect(statusOf(agent)).toHaveText("Selesai");
  const invoice = agent.getByRole("region", { name: "Invoice" });
  await expect(invoice).toContainText(/INV-\d{4}-\d{6}/);
  await expect(invoice).toContainText("lunas");
  await expect(agent.getByRole("region", { name: "Riwayat pembayaran" })).toContainText("Ditolak");

  await agentContext.close();
  await adminContext.close();
});

test("a non-image file disguised as a photo is rejected", async ({ page }) => {
  await login(page, "e2e-canceller");
  await expectPath(page, "/catalog");
  await page.goto("/catalog/e2e-cart-two");
  await page.getByLabel("Jumlah Putih ukuran S").fill("1");
  await page.getByRole("button", { name: "Simpan ke keranjang" }).click();
  await expect(page.getByRole("status")).toHaveText("Keranjang diperbarui.");
  await page.goto("/cart");
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByLabel("Saya sudah memastikan pesanan ini benar.").check();
  await page.getByRole("button", { name: "Buat pesanan" }).click();
  await expectPath(page, "/orders");
  await page.getByRole("status").getByRole("link").click();
  await page.getByLabel(/Foto atau file bukti transfer/).setInputFiles({
    name: "bukti.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("<html>bukan foto</html>"),
  });
  await page.getByRole("button", { name: "Kirim bukti transfer" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("File harus berupa foto JPG, PNG, WEBP, atau PDF.");
  await expect(statusOf(page)).toHaveText("Menunggu DP");
});
