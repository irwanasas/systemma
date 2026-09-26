import { expect, type Page } from "@playwright/test";

export const E2E_PASSWORD = "Rahasia-e2e-123";

export const login = async (page: Page, username: string, password: string = E2E_PASSWORD): Promise<void> => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
};

export const expectPath = async (page: Page, path: string): Promise<void> => {
  await expect(page).toHaveURL((url) => url.pathname === path);
};

export const logout = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: /^Akun / }).click();
  await page.getByRole("menuitem", { name: "Keluar" }).click();
};
