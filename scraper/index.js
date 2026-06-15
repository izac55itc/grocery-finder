'use strict'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'
import { fetchFlippPrices } from './flipp.js'

const STAPLE_ITEMS = [
  'milk', 'eggs', 'bread', 'butter', 'cheese',
  'chicken', 'ground beef', 'rice', 'pasta',
  'bananas', 'apples'
]

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  console.log(`[supabase] URL: ${supabaseUrl}`)
  console.log(`[supabase] Key: ${supabaseKey.substring(0, 20)}...`)

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: { transport: ws }
  })

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  console.log(`\n🛒 Grocery Price Scraper — ${todayStr}\n`)

  try {
    // Fetch individual prices from Flipp API
    console.log('Fetching prices via Flipp API...')
    const allPrices = await fetchFlippIndividualPrices('V6B4X8')

    console.log(`\n✓ Collected ${allPrices.length} individual prices`)

    // Delete old prices for today
    const { error: deleteErr } = await supabase
      .from('item_prices')
      .delete()
      .eq('date', todayStr)

    if (deleteErr) {
      console.error('Error deleting old prices:', deleteErr.message)
    } else {
      console.log('✓ Deleted old prices for today')
    }

    // Insert new prices
    if (allPrices.length > 0) {
      const { error } = await supabase
        .from('item_prices')
        .insert(allPrices)

      if (error) {
        console.error('Error inserting prices:', error.message)
        console.error('Full error:', JSON.stringify(error, null, 2))
        process.exit(1)
      }

      console.log(`✓ Inserted ${allPrices.length} prices → Supabase\n`)
    }
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

const PRICE_LIMITS = {
  'milk': 8,
  'eggs': 10,
  'bread': 6,
  'butter': 10,
  'cheese': 20,
  'chicken': 15,
  'ground beef': 15,
  'rice': 8,
  'pasta': 5,
  'bananas': 3,
  'apples': 3
}

async function fetchFlippIndividualPrices(postalCode) {
  const allPrices = []
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const baseUrl = 'https://cdn-gateflipp.flippback.com/bf/flipp/items/search'

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
        console.log(`[${item}] HTTP ${response.status}`)
        continue
      }

      const data = await response.json()

      // Group by merchant and find cheapest price
      const merchantBest = {}
      const priceLimit = PRICE_LIMITS[item] || 100

      if (data.ecom_items && Array.isArray(data.ecom_items)) {
        if (item === 'bananas' && data.ecom_items.length > 0) {
          console.log(`[DEBUG] Sample product fields:`, Object.keys(data.ecom_items[0]))
        }
        data.ecom_items.forEach(product => {
          const price = product.current_price
          if (price > 0 && price <= priceLimit) {
            const merchant = product.merchant
            if (!merchantBest[merchant] || price < merchantBest[merchant].price) {
              // Try to construct a valid product URL
              let url = ''
              if (product.url) {
                url = product.url
              } else if (product.link) {
                url = product.link
              } else if (product.flyerPageId) {
                url = `https://flipp.com/flyer/${product.flyerPageId}`
              }

              merchantBest[merchant] = {
                price,
                name: product.name || item,
                url: url
              }
            }
          }
        })
      }

      // Insert cheapest price per merchant
      Object.entries(merchantBest).forEach(([merchant, data]) => {
        allPrices.push({
          item_name: item,
          merchant_name: merchant,
          price: Math.round(data.price * 100) / 100,
          product_name: data.name,
          product_url: data.url,
          date: todayStr
        })
      })

      console.log(`[${item}] Found ${Object.keys(merchantBest).length} merchants (limit: $${priceLimit})`)

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (err) {
      console.log(`[${item}] Error: ${err.message}`)
    }
  }

  return allPrices
}

// Hard timeout: 4 minutes
setTimeout(() => {
  console.error('Hard timeout: force killing process')
  process.kill(process.pid, 'SIGKILL')
}, 240_000)

main()
  .then(() => { process.exit(0) })
  .catch(err => { console.error('Fatal:', err.message); process.exit(1) })
