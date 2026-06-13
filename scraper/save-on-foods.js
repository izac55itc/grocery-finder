'use strict'

import puppeteer from 'puppeteer'

const STAPLE_ITEMS = [
  'milk',
  'eggs',
  'bread',
  'butter',
  'cheese',
  'chicken',
  'ground beef',
  'rice',
  'pasta',
  'bananas',
  'apples'
]

async function fetchSaveOnFoodsPrices(postalCode = 'V6B4X8', daysAhead = 7) {
  const results = []
  let browser

  try {
    console.log(`[save-on-foods] Fetching staple items for postal code ${postalCode}...`)

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    const allPrices = new Set()

    for (const item of STAPLE_ITEMS) {
      try {
        const searchUrl = `https://www.saveonfoods.com/search?q=${encodeURIComponent(item)}`
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 })

        // Extract prices from product listings
        const prices = await page.evaluate(() => {
          const priceElements = document.querySelectorAll('[data-price], .price, .product-price, [class*="price"]')
          const prices = []

          priceElements.forEach(el => {
            const text = el.textContent?.trim()
            if (text && /^\$?[\d,]+\.?\d*/.test(text)) {
              const price = parseFloat(text.replace(/[^\d.]/g, ''))
              if (price > 0) prices.push(price)
            }
          })

          return prices
        })

        prices.forEach(price => allPrices.add(price))
        console.log(`[save-on-foods] ${item}: found ${prices.length} prices`)

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (itemErr) {
        console.log(`[save-on-foods] ${item}: ${itemErr.message}`)
        continue
      }
    }

    await page.close()

    if (allPrices.size > 0) {
      const pricesArray = Array.from(allPrices).sort((a, b) => a - b)
      const minPrice = pricesArray[0]
      const maxPrice = pricesArray[pricesArray.length - 1]

      for (let day = 0; day < daysAhead; day++) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        results.push({
          date: dateStr,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          availableCount: STAPLE_ITEMS.length,
          hasHotDeals: false
        })
      }

      console.log(`[save-on-foods] Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    }

    return results
  } catch (err) {
    console.log(`[save-on-foods] Error: ${err.message}`)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

export { fetchSaveOnFoodsPrices }
