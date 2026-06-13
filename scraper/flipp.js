'use strict'

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

async function fetchFlippPrices(postalCode = 'V6B4X8', daysAhead = 7) {
  const results = []

  try {
    console.log(`[flipp] Fetching staple items for postal code ${postalCode}...`)

    const baseUrl = 'https://cdn-gateflipp.flippback.com/bf/flipp/items/search'
    const allPrices = new Map() // Store item name -> prices
    const storeInfo = new Set() // Track which stores we found

    for (const item of STAPLE_ITEMS) {
      try {
        const params = new URLSearchParams({
          'locale': 'en-ca',
          'postal_code': postalCode,
          'sid': '',
          'q': item
        })

        const url = `${baseUrl}?${params}`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 10000
        })

        if (!response.ok) {
          console.log(`[flipp] ${item}: HTTP ${response.status}`)
          continue
        }

        const data = await response.json()

        // Extract prices from ecom_items
        if (data.ecom_items && Array.isArray(data.ecom_items)) {
          const prices = []

          data.ecom_items.forEach(product => {
            if (product.current_price > 0) {
              prices.push({
                price: product.current_price,
                merchant: product.merchant,
                product: product.name
              })
              storeInfo.add(product.merchant)
            }
          })

          if (prices.length > 0) {
            allPrices.set(item, prices)
            console.log(`[flipp] ${item}: found ${prices.length} prices from ${new Set(prices.map(p => p.merchant)).size} stores`)
          }
        }

        // Rate limiting - 2s between requests to avoid 429
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (itemErr) {
        console.log(`[flipp] ${item}: ${itemErr.message}`)
        continue
      }
    }

    // Calculate min/max across all items and stores
    if (allPrices.size > 0) {
      const allItemPrices = []
      allPrices.forEach((prices, item) => {
        prices.forEach(p => allItemPrices.push(p.price))
      })

      const minPrice = Math.min(...allItemPrices)
      const maxPrice = Math.max(...allItemPrices)

      // Generate 7 days of data
      for (let day = 0; day < daysAhead; day++) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        results.push({
          date: dateStr,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          availableCount: allPrices.size,
          hasHotDeals: false
        })
      }

      console.log(`[flipp] Found prices from ${storeInfo.size} stores: ${Array.from(storeInfo).join(', ')}`)
      console.log(`[flipp] Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    } else {
      console.log(`[flipp] No prices found`)
    }

    return results
  } catch (err) {
    console.log(`[flipp] Error: ${err.message}`)
    return []
  }
}

export { fetchFlippPrices }
