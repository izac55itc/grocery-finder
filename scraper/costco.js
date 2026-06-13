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

async function fetchCostcoPrices(postalCode = 'V6B4X8', daysAhead = 7) {
  const results = []

  try {
    console.log(`[costco] Fetching staple items for postal code ${postalCode}...`)

    const baseUrl = 'https://www.costco.ca/api/search'
    const allPrices = new Set()

    // Search for each staple item
    for (const item of STAPLE_ITEMS) {
      const params = new URLSearchParams({
        q: item,
        limit: 20,
        postalCode: postalCode.replace(/\s/g, '')
      })

      try {
        const response = await fetch(`${baseUrl}?${params}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.costco.ca/'
          },
          timeout: 10000
        })

        if (!response.ok) {
          console.log(`[costco] ${item}: HTTP ${response.status}`)
          continue
        }

        const data = await response.json()
        if (!data.results) continue
      } catch (itemErr) {
        console.log(`[costco] ${item}: ${itemErr.message}`)
        continue
      }

      // Extract prices from this item's results
      data.results.forEach(product => {
        if (product.price) allPrices.add(parseFloat(product.price))
      })

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    if (allPrices.size > 0) {
      const pricesArray = Array.from(allPrices).sort((a, b) => a - b)
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
          availableCount: STAPLE_ITEMS.length,
          hasHotDeals: false
        })
      }

      console.log(`[costco] Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`)
    }

    return results
  } catch (err) {
    console.log(`[costco] Error: ${err.message}`)
    return []
  }
}

export { fetchCostcoPrices }
