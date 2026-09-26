import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { expectPath, login } from "./fixtures";
import { e2eDatabaseUrl } from "./database";

const databaseUrl = e2eDatabaseUrl();

const psql = (sql: string): string =>
  execFileSync("psql", [databaseUrl, "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", sql], { encoding: "utf8" }).trim();

const ORDER_COUNT = 25;

test("admin order search runs in the database and pages beyond the first 20 results", async ({ page }) => {
  psql(`
    do $$
    declare
      pager uuid := (select id from users where username = 'e2e-pager');
      batch uuid := (select b.id from po_batches b join products p on p.id = b.product_id where p.slug = 'e2e-cart-two' and b.status = 'open');
      variant uuid := (
        select v.id from product_variants v join products p on p.id = v.product_id join product_colors c on c.id = v.color_id
        where p.slug = 'e2e-cart-two' and c.name = 'Putih' and v.size_code = 'S'
      );
    begin
      for i in 1..${ORDER_COUNT} loop
        perform cart_upsert_item(pager, batch, 1, variant);
        perform checkout_cart(pager, gen_random_uuid());
      end loop;
    end $$;
  `);
  const numbers = psql(
    "select string_agg(number, ',' order by created_at desc, id desc) from orders where agent_id = (select id from users where username = 'e2e-pager')",
  ).split(",");
  expect(numbers).toHaveLength(ORDER_COUNT);

  await login(page, "e2e-admin");
  await expectPath(page, "/dashboard");
  await page.goto("/orders?q=e2e-pager");
  const table = page.locator("table");
  await expect(page.getByText(`Halaman 1 dari 2 · ${ORDER_COUNT} data`)).toBeVisible();
  await expect(table.getByRole("link", { name: /^AUR-/ })).toHaveCount(20);
  await expect(table.getByRole("link", { name: numbers[0], exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Berikutnya" }).click();
  await expect(page.getByText(`Halaman 2 dari 2 · ${ORDER_COUNT} data`)).toBeVisible();
  await expect(table.getByRole("link", { name: /^AUR-/ })).toHaveCount(ORDER_COUNT - 20);
  await expect(table.getByRole("link", { name: numbers[ORDER_COUNT - 1], exact: true })).toBeVisible();

  const oldest = numbers[ORDER_COUNT - 1];
  await page.goto(`/orders?status=AWAITING_DP&q=${oldest}`);
  await expect(table.getByRole("link", { name: /^AUR-/ })).toHaveCount(1);
  await expect(table.getByRole("link", { name: oldest, exact: true })).toBeVisible();

  await page.goto(`/orders?q=${encodeURIComponent("Ny. (x), y")}`);
  await expect(page.getByText("Tidak ada pesanan yang cocok dengan filter ini.")).toBeVisible();

  await page.goto("/orders?q=tidak-ada-pesanan-ini");
  await expect(page.getByText("Tidak ada pesanan yang cocok dengan filter ini.")).toBeVisible();
});
