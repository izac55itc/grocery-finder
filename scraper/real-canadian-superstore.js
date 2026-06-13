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

async function fetchRealCanadianSuperStorePrices(postalCode = 'V3A3M2', daysAhead = 7) {
  const results = []
  let browser

  try {
    console.log(`[real-canadian-superstore] Fetching staple items for postal code ${postalCode}...`)

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-http2'
      ]
    })

    const page = await browser.newPage()
    const allPrices = new Set()

    for (const item of STAPLE_ITEMS) {
      try {
        const searchUrl = `https://www.realcanadiansuperstore.ca/search?q=${encodeURIComponent(item)}`
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 })

        // Extract prices from product listings
        const prices = await page.evaluate(() => {
          const prices = []

          // Try multiple selector strategies
          const selectors = [
            '[data-price]',
            '.price',
            '.product-price',
            '[class*="price"]',
            '[class*="Price"]',
            'span[class*="price"]',
            'div[class*="price"]'
          ]

          let priceElements = []
          for (const selector of selectors) {
            priceElements = [...priceElements, ...document.querySelectorAll(selector)]
          }

          priceElements.forEach(el => {
            const text = el.textContent?.trim()
            if (text && /\$?\d+[.,]\d{2}/.test(text)) {
              const match = text.match(/\d+[.,]\d{2}/)
              if (match) {
                const price = parseFloat(match[0].replace(',', '.'))
                if (price > 0 && price < 10000) prices.push(price)
              }
            }
          })

          return [...new Set(prices)]
        })

        prices.forEach(price => allPrices.add(price))
        console.log(`[real-canadian-superstore] ${item}: found ${prices.length} prices`)

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (itemErr) {
        console.log(`[real-canadian-superstore] ${item}: ${itemErr.message}`)
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

      console.log(`[real-canadian-superstore] Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    }

    return results
  } catch (err) {
    console.log(`[real-canadian-superstore] Error: ${err.message}`)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

export { fetchRealCanadianSuperStorePrices }
