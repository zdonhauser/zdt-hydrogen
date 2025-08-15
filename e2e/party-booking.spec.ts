import { test, expect } from '@playwright/test'

test.describe('Basic App Functionality', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads without errors
    await expect(page.locator('body')).toBeVisible()
    
    // Check for common elements that indicate the app loaded
    // We'll look for any of these elements to confirm the page works
    const indicators = [
      page.locator('header'),
      page.locator('main'),
      page.locator('nav'),
      page.locator('[data-testid]'), // Any element with test id
      page.locator('h1, h2, h3'), // Any heading
    ]
    
    // At least one indicator should be present
    let found = false
    for (const indicator of indicators) {
      try {
        await indicator.waitFor({ timeout: 2000 })
        found = true
        break
      } catch {
        // Continue to next indicator
      }
    }
    
    expect(found).toBe(true)
  })

  test('app does not have critical React errors', async ({ page }) => {
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    
    // Wait a moment for any async errors
    await page.waitForTimeout(2000)
    
    // Filter out non-critical errors (you can adjust this)
    const criticalErrors = errors.filter(error => 
      error.includes('useContext') || 
      error.includes('Router') ||
      error.includes('Cannot read properties of null')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})