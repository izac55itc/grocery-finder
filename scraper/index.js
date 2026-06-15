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
      const merchantPrices = {}
      if (data.ecom_items && Array.isArray(data.ecom_items)) {
        data.ecom_items.forEach(product => {
          if (product.current_price > 0) {
            const merchant = product.merchant
            if (!merchantPrices[merchant] || product.current_price < merchantPrices[merchant]) {
              merchantPrices[merchant] = product.current_price
            }
          }
        })
      }

      // Insert cheapest price per merchant
      Object.entries(merchantPrices).forEach(([merchant, price]) => {
        allPrices.push({
          item_name: item,
          merchant_name: merchant,
          price: Math.round(price * 100) / 100,
          date: todayStr
        })
      })

      console.log(`[${item}] Found ${Object.keys(merchantPrices).length} merchants`)

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
