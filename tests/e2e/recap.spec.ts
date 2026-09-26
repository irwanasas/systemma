import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import ExcelJS from "exceljs";
import { expect, test } from "@playwright/test";
import { expectPath, login } from "./fixtures";
import { e2eDatabaseUrl } from "./database";

const databaseUrl = e2eDatabaseUrl();

const createRecapFixture = (): void => {
  const sql = `
    with agent as (select id from users where username = 'e2e-recap'),
         batch as (select b.id from po_batches b join products p on p.id = b.product_id where p.slug = 'e2e-cart-two' and b.status = 'open'),
         variants as (
           select v.id, v.size_code from product_variants v join products p on p.id = v.product_id join product_colors c on c.id = v.color_id
           where p.slug = 'e2e-cart-two' and c.name = 'Putih'
         )
    select cart_upsert_item((select id from agent), (select id from batch), 3, (select id from variants where size_code = 'S')),
           cart_upsert_item((select id from agent), (select id from batch), 2, (select id from variants where size_code = 'M'));
    select * from checkout_cart((select id from users where username = 'e2e-recap'), gen_random_uuid());
  `;
  execFileSync("psql", [databaseUrl, "-q", "-v", "ON_ERROR_STOP=1", "-c", sql], { stdio: ["ignore", "ignore", "inherit"] });
};

test("recap page and XLSX export show the same totals as the orders", async ({ page }) => {
  createRecapFixture();
  await login(page, "e2e-admin");
  await expectPath(page, "/dashboard");
  await page.goto("/recap");

  const agentSection = page.getByRole("region", { name: /e2e-recap/ });
  await agentSection.locator("summary").click();
  const row = agentSection.getByRole("row", { name: /E2E Kedua/ });
  await expect(row).toContainText("Koko");
  await expect(row).toContainText("5");
  await expect(row).toContainText("Rp 540.000");
  await expect(agentSection.getByRole("row", { name: /Total/ })).toContainText("Koko 5");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Unduh XLSX" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^rekap-aurora-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.xlsx$/);

  const workbook = new ExcelJS.Workbook();
  const file = await readFile((await download.path()) ?? "");
  await workbook.xlsx.load(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer);
  const sheet = workbook.getWorksheet("Rekap");
  const values: unknown[][] = [];
  sheet?.eachRow((excelRow) => values.push((excelRow.values as unknown[]).slice(1)));
  const fixtureRow = values.find((cells) => cells[1] === "e2e-recap" && cells[3] === "E2E Kedua");
  expect(fixtureRow).toEqual([expect.stringMatching(/^E2E-\d+$/), "e2e-recap", "Koko", "E2E Kedua", "B1", 1, 5, 540000, 0, 0]);
});

test("agents cannot open the recap or download the export", async ({ page }) => {
  await login(page, "e2e-recap");
  await expectPath(page, "/catalog");
  await page.goto("/recap");
  await expectPath(page, "/catalog");
  const response = await page.request.get("/recap/export");
  expect(response.headers()["content-type"]).not.toContain("spreadsheet");
});
