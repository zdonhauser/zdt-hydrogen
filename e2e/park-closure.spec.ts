import { test, expect } from '@playwright/test'

test.describe('Park Closure Feature', () => {
  test('shows normal site before closing date', async ({ page }) => {
    await page.goto('/')
    
    // Should show the normal homepage
    await expect(page.locator('h1')).toContainText('ZDT\'S FINAL SEASON')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('nav').first()).toBeVisible()
  })

  test('shows farewell page after closing date', async ({ page }) => {
    // Use date override to simulate after closing
    await page.goto('/?date=2025-08-18')
    
    // Should show the farewell message
    await expect(page.locator('h1')).toContainText('ZDT\'s Amusement Park is now closed')
    await expect(page.locator('text=Thank you for 18 amazing years')).toBeVisible()
    
    // Should NOT show header/nav from main site (farewell page has no navigation)
    await expect(page.locator('header[role="banner"]')).not.toBeVisible()
    await expect(page.locator('nav[role="navigation"]').first()).not.toBeVisible()
  })

  test('farewell page has scroll video interaction', async ({ page }) => {
    await page.goto('/?date=2025-08-18')
    
    // Check that video element exists
    await expect(page.locator('video')).toBeVisible()
    
    // Check for scroll indicator (updated text)
    await expect(page.locator('text=Scroll')).toBeVisible()
  })

  test('all routes redirect to farewell after closing', async ({ page }) => {
    // Test that other pages also show farewell
    await page.goto('/party?date=2025-08-18')
    await expect(page.locator('h1')).toContainText('ZDT\'s Amusement Park is now closed')
    
    await page.goto('/products/switchback?date=2025-08-18')
    await expect(page.locator('h1')).toContainText('ZDT\'s Amusement Park is now closed')
  })
})