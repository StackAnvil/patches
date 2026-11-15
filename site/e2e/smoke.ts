import { expect, test } from "@playwright/test";

test("shared download links hydrate, select a setup, and survive browser history", async ({
  page,
}) => {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failed.push(request.url()));
  await page.goto("/releases/?setup=fabric");
  await expect(page.getByRole("radio", { name: /Fabric mods/ })).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Two matching mods. One tested setup.", exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: /Client modpack/ }).check();
  await expect(
    page.getByRole("heading", { name: "A Fabric client, ready to import.", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("radio", { name: /Fabric mods/ })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("radio", { name: /Fabric mods/ })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("static search opens the matching guide section without a server", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await page.getByRole("combobox", { name: "Search", exact: true }).fill("Realms");
  const result = page
    .getByRole("option")
    .filter({ hasText: "To join a friend, Realm, or LAN world" });
  await result.click();
  await expect(page).toHaveURL(/\/getting-started\/#use-viafabricplus-and-the-bedrock-add-on$/);
  await expect(
    page.getByRole("heading", { name: "Play on Bedrock from Java Edition", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("theme preferences persist and missing pages remain useful", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("button", { name: "Toggle color theme", exact: true }).click();
  await expect(page.locator("html")).toHaveClass("light");
  await page.reload();
  await expect(page.locator("html")).toHaveClass("light");
  const response = await page.goto("/missing-guide/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await page.getByRole("link", { name: "Go to homepage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your Java client. Bedrock servers.", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
