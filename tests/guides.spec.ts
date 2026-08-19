import { expect, test } from '@playwright/test'

test('serves the christian conversation starters guide', async ({ page }) => {
  await page.goto('/guides/christian-conversation-starters/')

  await expect(page).toHaveTitle(/Christian conversation starters/i)
  await expect(
    page.getByRole('heading', {
      name: 'Christian conversation starters for real faith',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Draw a card' }).first(),
  ).toHaveAttribute('href', '/')
})

test('guide question links open a live card', async ({ page }) => {
  await page.goto('/guides/small-group-questions/')
  const question = page.locator('.prompts a').first()
  await expect(question).toBeVisible()
  await question.click()
  await expect(page).toHaveURL(/\/c\/[a-z0-9]+\/?$/)
  await expect(page.locator('.card-prompt')).toBeVisible()
})
