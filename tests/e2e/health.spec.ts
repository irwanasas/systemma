import { expect, test } from "@playwright/test";

test("health endpoint responds ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("pages render in Bahasa Indonesia", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("the app icon is public while app pages still need a session", async ({ request }) => {
  const icon = await request.get("/icon.svg", { maxRedirects: 0 });
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  for (const path of ["/catalog", "/dashboard", "/orders", "/icon.svg.evil"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(307);
    expect(response.headers().location, path).toContain("/login");
  }
});
