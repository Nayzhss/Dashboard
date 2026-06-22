import { test, expect, type Page } from "@playwright/test"

async function login(page: Page) {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  test.skip(
    !email || !password,
    "Set E2E_TEST_EMAIL / E2E_TEST_PASSWORD in .env.local to run authenticated tests"
  )

  await page.goto("/login")
  await page.getByPlaceholder("Email ou nom d'utilisateur").fill(email!)
  await page.getByPlaceholder("Mot de passe").fill(password!)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL("/")
}

test("home page loads after login", async ({ page }) => {
  await login(page)
  await expect(page.getByRole("heading", { name: "OPENRF Community" })).toBeVisible()
})

test("shops page loads with the Top 3 section", async ({ page }) => {
  await login(page)
  await page.locator("nav").getByRole("link", { name: "Boutiques" }).click()
  await page.waitForURL("/boutiques")
  await expect(page.getByText("Top 3 rentabilité")).toBeVisible()
})

test("dashboard loads with stats and the new order button", async ({ page }) => {
  await login(page)
  await page.locator("nav").getByRole("link", { name: "Dashboard" }).click()
  await page.waitForURL("/dashboard")
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Nouvelle commande" })
  ).toBeVisible()
})
