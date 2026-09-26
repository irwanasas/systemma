import { expect, test } from "@playwright/test";
import { E2E_PASSWORD, expectPath, login, logout, confirmAction } from "./fixtures";

test("admin logs in and lands on the dashboard", async ({ page }) => {
  await login(page, "e2e-admin");
  await expectPath(page, "/dashboard");
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible();
});

test("agent logs in and lands on the catalog", async ({ page }) => {
  await login(page, "e2e-agent");
  await expectPath(page, "/catalog");
  await expect(page.getByRole("heading", { name: "Katalog" })).toBeVisible();
});

test("wrong password shows a clear error", async ({ page }) => {
  await login(page, "e2e-agent", "salah-sekali");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Username atau password salah.");
  await expectPath(page, "/login");
});

test("anonymous visitor is sent to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expectPath(page, "/login");
});

test("agent cannot open admin pages", async ({ page }) => {
  await login(page, "e2e-agent");
  await expectPath(page, "/catalog");
  await page.goto("/dashboard");
  await expectPath(page, "/catalog");
  await page.goto("/agents");
  await expectPath(page, "/catalog");
});

test("admin cannot open agent pages", async ({ page }) => {
  await login(page, "e2e-admin");
  await expectPath(page, "/dashboard");
  await page.goto("/catalog");
  await expectPath(page, "/dashboard");
});

test("deactivated agent loses the session and cannot log in again", async ({ browser }) => {
  const victimContext = await browser.newContext();
  const victim = await victimContext.newPage();
  await login(victim, "e2e-victim");
  await expectPath(victim, "/catalog");

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, "e2e-admin");
  await expectPath(admin, "/dashboard");
  await admin.goto("/agents");
  await admin.getByRole("button", { name: "Tindakan e2e-victim" }).click();
  await admin.getByRole("menuitem", { name: "Nonaktifkan" }).click();
  await confirmAction(admin, "Nonaktifkan e2e-victim");
  await expect(admin.getByRole("row", { name: /e2e-victim/ }).getByRole("cell", { name: "Nonaktif", exact: true }).first()).toBeVisible();

  await victim.goto("/catalog");
  await expectPath(victim, "/login");
  await login(victim, "e2e-victim");
  await expect(victim.getByRole("main").getByRole("alert")).toHaveText("Akun Anda sudah dinonaktifkan. Silakan hubungi admin Aurora.");

  await victimContext.close();
  await adminContext.close();
});

test("new account must change the password before continuing", async ({ page }) => {
  await login(page, "e2e-fresh");
  await expectPath(page, "/change-password");
  await page.goto("/catalog");
  await expectPath(page, "/change-password");

  await page.getByLabel("Password lama").fill(E2E_PASSWORD);
  await page.getByLabel("Password baru", { exact: true }).fill("Password-baru-456");
  await page.getByLabel("Ulangi password baru").fill("Password-baru-456");
  await page.getByRole("button", { name: "Simpan password" }).click();
  await expectPath(page, "/catalog");

  await logout(page);
  await expectPath(page, "/login");
  await login(page, "e2e-fresh", "Password-baru-456");
  await expectPath(page, "/catalog");
});

test("admin creates an agent who then logs in with the initial password", async ({ browser }) => {
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, "e2e-admin");
  await expectPath(admin, "/dashboard");
  await admin.goto("/agents");
  await admin.getByRole("button", { name: "Tambah agen" }).click();
  const form = admin.getByRole("dialog", { name: "Tambah agen" }).locator("form");
  await form.getByLabel("Username").fill("e2e-created");
  await form.getByLabel("Nama lengkap").fill("Agen Baru");
  await form.getByLabel("Kode agen").fill("e2e-new");
  await form.getByRole("button", { name: "Buat agen" }).click();
  const status = admin.getByRole("status");
  await expect(status).toContainText("Password awal:");
  const initialPassword = (await status.textContent())?.match(/Password awal: (\S+)/)?.[1] ?? "";
  expect(initialPassword).toHaveLength(12);

  const agentContext = await browser.newContext();
  const agent = await agentContext.newPage();
  await login(agent, "e2e-created", initialPassword);
  await expectPath(agent, "/change-password");

  await adminContext.close();
  await agentContext.close();
});

test("five failed attempts lock the username for 15 minutes", async ({ page }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await login(page, "e2e-locked", "salah-sekali");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Username atau password salah.");
  }
  await login(page, "e2e-locked");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi 15 menit lagi.");
});

test("logout ends the session", async ({ page }) => {
  await login(page, "e2e-logout");
  await expectPath(page, "/catalog");
  await logout(page);
  await expectPath(page, "/login");
  await page.goto("/catalog");
  await expectPath(page, "/login");
});
