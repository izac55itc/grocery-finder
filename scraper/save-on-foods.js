'use strict'

async function fetchSaveOnFoodsPrices(postalCode = 'V6B4X8', daysAhead = 7) {
  const results = []

  try {
    console.log(`[save-on-foods] Fetching prices for postal code ${postalCode}...`)

    // Save-On-Foods API endpoint (reverse-engineered)
    const baseUrl = 'https://api.saveonfoods.com/products/search'

    let skip = 0
    const take = 50
    let hasMore = true
    let pageCount = 0
    const maxPages = 20 // Limit to avoid rate limiting

    while (hasMore && pageCount < maxPages) {
      const url = `${baseUrl}?postalCode=${postalCode}&skip=${skip}&take=${take}`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 10000
      })

      if (!response.ok) {
        console.log(`[save-on-foods] API returned ${response.status}, stopping pagination`)
        break
      }

      const data = await response.json()

      if (!data.products || data.products.length === 0) {
        hasMore = false
        continue
      }

      // Extract unique prices from products
      const prices = new Set()
      data.products.forEach(product => {
        if (product.price) {
          prices.add(parseFloat(product.price))
        }
        if (product.salePrice) {
          prices.add(parseFloat(product.salePrice))
        }
      })

      if (prices.size > 0) {
        const pricesArray = Array.from(prices).sort((a, b) => a - b)
        const minPrice = pricesArray[0]
        const maxPrice = pricesArray[pricesArray.length - 1]

        // Add result for each day (same prices)
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

        console.log(`[save-on-foods] Found ${data.products.length} products, price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
      }

      skip += take
      pageCount++

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  } catch (err) {
    console.log(`[save-on-foods] Error: ${err.message}`)
    return []
  }
}

export { fetchSaveOnFoodsPrices }
