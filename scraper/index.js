'use strict'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'
import { fetchFlippPrices } from './flipp.js'

const DAYS_AHEAD = 7

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
  console.log(`\n🛒 Grocery Price Scraper — ${todayStr} (${DAYS_AHEAD} days)\n`)

  const allSummaries = []

  try {
    // Scrape via Flipp API (aggregates all stores)
    console.log('Fetching prices via Flipp API...')
    const flippData = await fetchFlippPrices('V6B4X8', DAYS_AHEAD)
    flippData.forEach(item => {
      allSummaries.push({
        store_id: 1,
        date: item.date,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        available_count: item.availableCount,
        has_hot_deals: item.hasHotDeals
      })
    })

    console.log(`\n✓ Collected ${allSummaries.length} price summaries`)

    // Delete old prices and insert new ones
    const { error: deleteErr } = await supabase
      .from('price_summaries')
      .delete()
      .not('id', 'is', null)

    if (deleteErr) {
      console.error('Error deleting old prices:', deleteErr.message)
    } else {
      console.log('✓ Deleted old prices')
    }

    // Insert new prices (adjust for your schema)
    if (allSummaries.length > 0) {
      const { data, error } = await supabase
        .from('price_summaries')
        .insert(allSummaries)

      if (error) {
        console.error('Error inserting prices:', error.message)
        process.exit(1)
      }

      console.log(`✓ Upserted ${allSummaries.length} prices → Supabase\n`)
    }
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

// Hard timeout: 4 minutes
setTimeout(() => {
  console.error('Hard timeout: force killing process')
  process.kill(process.pid, 'SIGKILL')
}, 240_000)

main()
  .then(() => { process.exit(0) })
  .catch(err => { console.error('Fatal:', err.message); process.exit(1) })
