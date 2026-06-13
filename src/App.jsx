import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const STAPLE_ITEMS = [
  'milk', 'eggs', 'bread', 'butter', 'cheese',
  'chicken', 'ground beef', 'rice', 'pasta',
  'bananas', 'apples'
]

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kevikdfqkbptebgugess.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    fetchPrices()
  }, [])

  async function fetchPrices() {
    try {
      const { data, error } = await supabase
        .from('price_summaries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const latest = data[0]
        setPrices({
          minPrice: latest.min_price,
          maxPrice: latest.max_price,
          date: new Date(latest.date).toLocaleDateString(),
          availableCount: latest.available_count
        })
      }
    } catch (err) {
      console.error('Error fetching prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const sortedItems = [...STAPLE_ITEMS].sort((a, b) => {
    if (sortBy === 'price-low') return a.localeCompare(b)
    return a.localeCompare(b)
  })

  return (
    <div className="app">
      <header className="header">
        <h1>🛒 Grocery Finder</h1>
        <p>Compare grocery prices across Canadian stores</p>
      </header>

      <div className="container">
        {loading ? (
          <div className="loading">Loading prices...</div>
        ) : (
          <>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-label">Lowest Price</div>
                <div className="stat-value">${prices.minPrice?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Highest Price</div>
                <div className="stat-value">${prices.maxPrice?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Stores Found</div>
                <div className="stat-value">{prices.availableCount || 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Last Updated</div>
                <div className="stat-value text-sm">{prices.date || 'Never'}</div>
              </div>
            </div>

            <div className="items-section">
              <h2>Staple Items</h2>
              <div className="items-grid">
                {sortedItems.map(item => (
                  <div key={item} className="item-card">
                    <div className="item-name">{item.charAt(0).toUpperCase() + item.slice(1)}</div>
                    <div className="item-price">
                      {prices.minPrice && prices.maxPrice ? (
                        <>
                          <div className="price-range">${prices.minPrice.toFixed(2)} - ${prices.maxPrice.toFixed(2)}</div>
                          <div className="price-avg">${((prices.minPrice + prices.maxPrice) / 2).toFixed(2)} avg</div>
                        </>
                      ) : (
                        <div className="no-data">No data</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="refresh-hint">
              Prices update at 6 AM, 12 PM, and 5 PM PST
            </div>
          </>
        )}
      </div>
    </div>
  )
}
