import { test, expect } from '@playwright/test'

test.describe('Party Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the party page
    await page.goto('/party') // Adjust this URL based on your routing
  })

  test('displays party room information correctly', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText('Party Rooms')
    
    // Check all party room names are visible
    await expect(page.locator('text=Carousel Party Room')).toBeVisible()
    await expect(page.locator('text=Large Party Room')).toBeVisible()
    await expect(page.locator('text=Midway Point Party Station')).toBeVisible()
    await expect(page.locator('text=Turning Point Party Station')).toBeVisible()
  })

  test('shows pricing information for all rooms', async ({ page }) => {
    // Check pricing is displayed
    await expect(page.locator('text=$32/Wristband')).toHaveCount(3)
    await expect(page.locator('text=$30/Wristband')).toBeVisible()
    
    // Check minimum requirements
    await expect(page.locator('text=Min 8')).toBeVisible()
    await expect(page.locator('text=Min 75')).toBeVisible()
  })

  test('party room links navigate to booking page', async ({ page }) => {
    // Click on Carousel party room
    const carouselRoom = page.locator('a[href*="/collections/party-booking?room=Carousel"]')
    await expect(carouselRoom).toBeVisible()
    
    // Test the href attribute
    await expect(carouselRoom).toHaveAttribute('href', '/collections/party-booking?room=Carousel')
  })

  test('main book now button works', async ({ page }) => {
    // Find and test the main Book Now button
    const bookNowButton = page.locator('a[href="/collections/party-booking"]:has-text("Book Now")')
    await expect(bookNowButton).toBeVisible()
    await expect(bookNowButton).toHaveAttribute('href', '/collections/party-booking')
  })

  test('printable invitation buttons function', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('popup')
    
    // Click Switchback Style button
    await page.locator('text=Switchback Style').click()
    
    const popup = await downloadPromise
    expect(popup.url()).toContain('Invitation_Switchback.pdf')
    await popup.close()
  })

  test('displays food options', async ({ page }) => {
    // Check Food Options section
    await expect(page.locator('h2:has-text("Food Options")')).toBeVisible()
    await expect(page.locator('text=Pizza Based on Party Attendance')).toBeVisible()
    await expect(page.locator('text=Whole Pizzas')).toBeVisible()
  })

  test('shows policy information', async ({ page }) => {
    // Check important policy text
    await expect(page.locator('text=$60 non-refundable deposit')).toBeVisible()
    await expect(page.locator('text=Children ages 3-15 require wristbands')).toBeVisible()
  })

  test('images load correctly', async ({ page }) => {
    // Check that party room images are loaded
    const carouselImage = page.locator('img[alt="Carousel Party Room"]')
    await expect(carouselImage).toBeVisible()
    await expect(carouselImage).toHaveAttribute('src', /Carousel\.jpg/)
    
    const largeImage = page.locator('img[alt="Large Party Room"]')
    await expect(largeImage).toBeVisible()
    await expect(largeImage).toHaveAttribute('src', /Large\.jpg/)
  })

  test('page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Carousel Party Room')).toBeVisible()
    
    // Check that mobile layout doesn't break
    const partyRooms = page.locator('text=Party Room')
    await expect(partyRooms).toHaveCount(2) // Carousel and Large
  })
})