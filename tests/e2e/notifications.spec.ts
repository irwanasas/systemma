import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import { e2eDatabaseUrl } from "./database";
import { expectPath, login } from "./fixtures";

test.describe.configure({ mode: "serial" });

const databaseUrl = e2eDatabaseUrl();

const psql = (sql: string): string =>
  execFileSync("psql", [databaseUrl, "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", sql], { encoding: "utf8" }).trim();

const KINDS = ["ORDER_PLACED", "PAYMENT_SUBMITTED", "ORDER_CANCELLED"];

const RANGE = "from=2025-01-01&to=2025-12-31";

test.beforeAll(() => {
  psql(`
    delete from notifications where payload->>'fixture' = 'notif-e2e';
    insert into notifications (recipient_id, kind, payload, created_at)
    select (select id from users where username = 'e2e-notif-admin'),
           (array['${KINDS.join("','")}'])[1 + (i % 3)],
           jsonb_build_object('fixture', 'notif-e2e', 'order_number', 'FX-' || lpad(i::text, 3, '0'), 'agent_name', 'Agen Fixture', 'agent_code', 'FX'),
           timestamptz '2025-01-01 10:00+07' + (i * 2) * interval '1 day'
    from generate_series(0, 24) as i;
  `);
});

const counter = (page: Page, text: string) => page.getByText(text, { exact: true });

test("notification page filters by type and date and pages in the database", async ({ page }) => {
  await login(page, "e2e-notif-admin");
  await expectPath(page, "/dashboard");
  await page.goto(`/notifications?${RANGE}`);
  await expect(counter(page, "Menampilkan 1–20 dari 25")).toBeVisible();

  await page.getByRole("link", { name: "Pesanan dibatalkan" }).click();
  await expect(page).toHaveURL(/type=ORDER_CANCELLED/);
  await expect(counter(page, "Menampilkan 1–8 dari 8")).toBeVisible();
  await expect(page.getByRole("list", { name: "Daftar notifikasi" }).getByRole("listitem")).toHaveCount(8);

  await page.goto("/notifications?from=2025-01-01&to=2025-01-31");
  await expect(counter(page, "Menampilkan 1–16 dari 16")).toBeVisible();
  await page.getByLabel("Sampai tanggal").fill("2025-01-10");
  await expect(page).toHaveURL(/to=2025-01-10/);
  await expect(counter(page, "Menampilkan 1–5 dari 5")).toBeVisible();

  await page.goto(`/notifications?${RANGE}`);
  await page.getByLabel("Per halaman").selectOption("10");
  await expect(counter(page, "Menampilkan 1–10 dari 25")).toBeVisible();
  await page.getByRole("link", { name: "Halaman berikutnya" }).click();
  await expect(counter(page, "Menampilkan 11–20 dari 25")).toBeVisible();
  await page.getByRole("link", { name: "Halaman terakhir" }).click();
  await expect(counter(page, "Menampilkan 21–25 dari 25")).toBeVisible();
  await expect(page.getByText("FX-000")).toBeVisible();
});

test("rows toggle read state and bulk marking follows the filter", async ({ page }) => {
  await login(page, "e2e-notif-admin");
  await expectPath(page, "/dashboard");
  await page.goto(`/notifications?${RANGE}&status=unread`);
  await expect(counter(page, "Menampilkan 1–20 dari 25")).toBeVisible();

  await page.getByRole("button", { name: "Tandai dibaca FX-024" }).click();
  await expect(counter(page, "Menampilkan 1–20 dari 24")).toBeVisible();
  await page.goto(`/notifications?${RANGE}`);
  await page.getByRole("button", { name: "Tandai belum dibaca FX-024" }).click();
  await expect(page.getByRole("button", { name: "Tandai dibaca FX-024" })).toBeVisible();

  await page.goto(`/notifications?${RANGE}&type=ORDER_CANCELLED&status=unread`);
  await page.getByRole("button", { name: "Tandai semua dibaca (filter ini)" }).click();
  await expect(page.getByText("Tidak ada notifikasi yang cocok")).toBeVisible();
  await page.goto(`/notifications?${RANGE}&status=unread`);
  await expect(counter(page, "Menampilkan 1–17 dari 17")).toBeVisible();
});

test("bell panel shows the latest ten, marks all read and links to the full list", async ({ page }) => {
  await login(page, "e2e-notif-admin");
  await expectPath(page, "/dashboard");
  await page.getByRole("button", { name: /^Notifikasi/ }).click();
  const panel = page.getByRole("dialog", { name: "Notifikasi" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("listitem")).toHaveCount(10);

  const before = psql("select to_char(now(), 'YYYY-MM-DD\"T\"HH24:MI:SS.US') || '+00'");
  await panel.getByRole("button", { name: "Tandai semua dibaca" }).click();
  await expect(panel.getByRole("button", { name: "Tandai semua dibaca" })).toBeDisabled();
  expect(
    psql(`select count(*) from notifications where recipient_id = (select id from users where username = 'e2e-notif-admin') and read_at is null and created_at < '${before}'`),
  ).toBe("0");

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page.getByRole("button", { name: /^Notifikasi/ })).toBeFocused();

  await page.getByRole("button", { name: /^Notifikasi/ }).click();
  await page.getByRole("dialog", { name: "Notifikasi" }).getByRole("link", { name: "Lihat semua" }).click();
  await expectPath(page, "/notifications");
});

test("agents cannot open the notification page", async ({ page }) => {
  await login(page, "e2e-a11y");
  await expectPath(page, "/catalog");
  await page.goto("/notifications");
  await expectPath(page, "/catalog");
});
