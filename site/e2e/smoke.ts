import { expect, test } from "@playwright/test";

test("shared download links hydrate, select a setup, and survive browser history", async ({
  page,
}) => {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failed.push(request.url()));
  await page.goto("/releases/?setup=fabric");
  await expect(page.getByRole("radio", { name: /Fabric mods/u })).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Two matching mods. One tested setup.", exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: /Client modpack/u }).check();
  await expect(
    page.getByRole("heading", { name: "A Fabric client, ready to import.", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("radio", { name: /Fabric mods/u })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("radio", { name: /Fabric mods/u })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("an unknown shared setup falls back to ViaProxy", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/releases/?setup=bogus");
  await expect(page.getByRole("radio", { name: /ViaProxy/u })).toBeChecked();
  await expect(page.getByRole("link", { name: "Read the installation guide" })).toHaveAttribute(
    "href",
    "/getting-started/#use-viaproxy",
  );
  expect(errors).toEqual([]);
});

test("static search opens the matching guide section without a server", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Search docs", exact: true }).click();
  await page.getByRole("combobox", { name: "Search", exact: true }).fill("Realms");
  const result = page
    .getByRole("option")
    .filter({ hasText: "To join a friend, Realm, or LAN world" });
  await result.click();
  await expect(page).toHaveURL(/\/getting-started\/#use-viafabricplus-and-the-bedrock-add-on$/u);
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
  await page.getByRole("radio", { name: /Client modpack/u }).check();
  await expect(page.getByRole("link", { name: "Download Client modpack" })).toHaveAttribute(
    "href",
    /\.mrpack$/u,
  );
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
    page.getByRole("heading", { name: "Play Bedrock servers from Java Edition", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe("guide navigation on a wide screen", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("the guide sidebar starts on the header logo edge", async ({ page }) => {
    await page.goto("/projects/");
    const logo = await page
      .getByRole("link", { name: "StackAnvil home", exact: true })
      .boundingBox();
    const item = await page
      .locator("#nd-sidebar")
      .getByRole("link", { name: "Projects", exact: true })
      .boundingBox();
    expect(Math.abs((logo?.x ?? 0) - (item?.x ?? Infinity))).toBeLessThanOrEqual(1);
  });
});

test("the skip link on a guide page passes the header and the sidebar", async ({ page }) => {
  await page.goto("/projects/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest("#nd-page") !== null)).toBe(
    true,
  );
});

test.describe("guide navigation on a phone", () => {
  test.use({ viewport: { width: 390, height: 664 } });

  test("the site header opens the guide drawer, which closes from its own button", async ({
    page,
  }) => {
    await page.goto("/projects/");
    const drawer = page.locator("#nd-sidebar-mobile");
    // A click before hydration does nothing, so retry until the drawer opens.
    await expect(async () => {
      // One banner: Fumadocs adds no second bar above the page.
      await page
        .getByRole("banner")
        .getByRole("button", { name: "Open Sidebar", exact: true })
        .click();
      await expect(drawer.getByRole("link", { name: "Projects", exact: true })).toBeVisible({
        timeout: 1000,
      });
    }).toPass();
    await drawer.getByRole("button", { name: "Close Sidebar", exact: true }).click();
    await expect(drawer).toBeHidden();
  });
});

test("patch stacks explain their blocks without hover", async ({ page, hasTouch }) => {
  await page.goto("/");
  const stack = page.locator(".patch-stack").first();
  const readout = stack.locator(".patch-readout");
  await expect(readout).toHaveText(/^\d+ features? · /u);
  const block = stack.locator(".patch-block").first();
  await block.scrollIntoViewIfNeeded();
  await (hasTouch ? block.tap() : block.hover());
  await expect(block).toHaveAttribute("data-active", "true");
  await expect(readout).toHaveText(/^[a-z]+(\([^)]+\))?: \S/u);
});
