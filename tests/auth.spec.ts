import { test, expect } from "@playwright/test"

test("unauthenticated visitor is redirected to /login", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/login$/)
})

test("login page has an identifier and password field", async ({ page }) => {
  await page.goto("/login")
  await expect(
    page.getByPlaceholder("Email ou nom d'utilisateur")
  ).toBeVisible()
  await expect(page.getByPlaceholder("Mot de passe")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Se connecter" })
  ).toBeVisible()
})

test("signup page has email, username and password fields", async ({ page }) => {
  await page.goto("/signup")
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.getByPlaceholder("Nom d'utilisateur")).toBeVisible()
  await expect(page.getByPlaceholder(/Mot de passe/)).toBeVisible()
})
