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
