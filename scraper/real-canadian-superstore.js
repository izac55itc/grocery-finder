'use strict'

async function fetchRealCanadianSuperStorePrices(postalCode = 'V3A3M2', daysAhead = 7) {
  const results = []

  try {
    console.log(`[real-canadian-superstore] Fetching prices for postal code ${postalCode}...`)

    // Real Canadian Superstore API endpoint (Loblaws owned, similar API to PC)
    const baseUrl = 'https://www.realcanadiansuperstore.ca/api/products/search'

    const params = new URLSearchParams({
      q: 'grocery',
      limit: 100,
      postalCode: postalCode.replace(/\s/g, '')
    })

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000
    })

    if (!response.ok) {
      console.log(`[real-canadian-superstore] API returned ${response.status}`)
      return results
    }

    const data = await response.json()

    if (!data.products || data.products.length === 0) {
      console.log(`[real-canadian-superstore] No products found`)
      return results
    }

    // Extract prices from products
    const prices = new Set()
    data.products.forEach(product => {
      if (product.price) {
        prices.add(parseFloat(product.price))
      }
    })

    if (prices.size > 0) {
      const pricesArray = Array.from(prices).sort((a, b) => a - b)
      const minPrice = pricesArray[0]
      const maxPrice = pricesArray[pricesArray.length - 1]

      // Add result for each day
      for (let day = 0; day < daysAhead; day++) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        results.push({
          date: dateStr,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          availableCount: data.products.length,
          hasHotDeals: false
        })
      }

      console.log(`[real-canadian-superstore] Found ${data.products.length} products, price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    }
  } catch (err) {
    console.log(`[real-canadian-superstore] Error: ${err.message}`)
  }

  return results
}

export { fetchRealCanadianSuperStorePrices }
