'use strict'

async function fetchCostcoPrices(postalCode = 'V6B4X8', daysAhead = 7) {
  const results = []

  try {
    console.log(`[costco] Fetching prices for postal code ${postalCode}...`)

    // Costco API endpoint (reverse-engineered)
    const baseUrl = 'https://www.costco.ca/api/search/browse'

    const params = new URLSearchParams({
      keyword: 'grocery',
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
      console.log(`[costco] API returned ${response.status}`)
      return results
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      console.log(`[costco] No products found`)
      return results
    }

    // Extract prices from products
    const prices = new Set()
    data.results.forEach(product => {
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
          availableCount: data.results.length,
          hasHotDeals: false
        })
      }

      console.log(`[costco] Found ${data.results.length} products, price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    }
  } catch (err) {
    console.log(`[costco] Error: ${err.message}`)
  }

  return results
}

export { fetchCostcoPrices }
