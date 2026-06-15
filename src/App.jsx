import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'
import FlippPrices from './components/FlippPrices'
import PriceTracker from './components/PriceTracker'

export default function App() {
  const [tab, setTab] = useState('flipp')

  return (
    <div className="app">
      <header className="header">
        <h1>🛒 Grocery Finder</h1>
        <p>Compare grocery prices across Canadian stores</p>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${tab === 'flipp' ? 'active' : ''}`}
            onClick={() => setTab('flipp')}
          >
            Live Prices
          </button>
          <button
            className={`tab ${tab === 'tracker' ? 'active' : ''}`}
            onClick={() => setTab('tracker')}
          >
            Price Tracker
          </button>
        </div>

        {tab === 'flipp' && <FlippPrices />}
        {tab === 'tracker' && <PriceTracker />}
      </div>
    </div>
  )
}

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
                    <a
                      key={idx}
                      href={row.product_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="price-row-link"
                    >
                      <div className="price-row">
                        <div className="store-and-product">
                          <div className="store-name">{row.merchant_name}</div>
                          {row.product_name && (
                            <div className="product-name">{row.product_name}</div>
                          )}
                        </div>
                        <div className="price">${row.price.toFixed(2)}</div>
                      </div>
                    </a>
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
