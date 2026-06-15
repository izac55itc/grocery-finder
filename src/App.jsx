import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kevikdfqkbptebgugess.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState('bananas')
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    fetchPrices(item)
  }, [item])

  async function fetchPrices(selectedItem) {
    try {
      const { data, error } = await supabase
        .from('item_prices')
        .select('*')
        .eq('item_name', selectedItem)
        .order('price', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setPrices(data)
        setLastUpdate(new Date(data[0].created_at).toLocaleDateString())
      } else {
        setPrices([])
        setLastUpdate('')
      }
    } catch (err) {
      console.error('Error fetching prices:', err)
      setPrices([])
    } finally {
      setLoading(false)
    }
  }

  const cheapest = prices.length > 0 ? prices[0].price : null
  const mostExpensive = prices.length > 0 ? prices[prices.length - 1].price : null

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
            <div className="item-selector">
              <label htmlFor="item">Select Item: </label>
              <select
                id="item"
                value={item}
                onChange={(e) => {
                  setItem(e.target.value)
                  setLoading(true)
                }}
              >
                <option value="milk">Milk</option>
                <option value="eggs">Eggs</option>
                <option value="bread">Bread</option>
                <option value="butter">Butter</option>
                <option value="cheese">Cheese</option>
                <option value="chicken">Chicken</option>
                <option value="ground beef">Ground Beef</option>
                <option value="rice">Rice</option>
                <option value="pasta">Pasta</option>
                <option value="bananas">Bananas</option>
                <option value="apples">Apples</option>
              </select>
            </div>

            {prices.length > 0 && (
              <div className="stats">
                <div className="stat-card">
                  <div className="stat-label">Cheapest</div>
                  <div className="stat-value">${cheapest?.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Most Expensive</div>
                  <div className="stat-value">${mostExpensive?.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Stores</div>
                  <div className="stat-value">{prices.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Last Updated</div>
                  <div className="stat-value text-sm">{lastUpdate}</div>
                </div>
              </div>
            )}

            <div className="prices-section">
              <h2>{item.charAt(0).toUpperCase() + item.slice(1)} Prices</h2>
              {prices.length > 0 ? (
                <div className="prices-table">
                  {prices.map((row, idx) => (
                    <div key={idx} className="price-row">
                      <div className="store-name">{row.merchant_name}</div>
                      <div className="price">${row.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No prices found for {item}</div>
              )}
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
