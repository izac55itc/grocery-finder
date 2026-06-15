import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function PriceTracker() {
  const [items, setItems] = useState([
    { id: 1, name: 'Eggs', store: 'Costco Instacart', price: 11.91, packSize: 24, unit: 'ea' },
    { id: 2, name: 'Eggs', store: 'Walmart Online', price: 10.22, packSize: 30, unit: 'ea' },
    { id: 3, name: 'Bananas', store: 'Costco Instacart', price: 2.26, packSize: 1.36, unit: 'kg' },
    { id: 4, name: 'Bananas', store: 'Walmart Online', price: 1.70, packSize: 1, unit: 'kg' },
    { id: 5, name: 'Milk (1% 4L)', store: 'Costco Instacart', price: 6.50, packSize: 4, unit: 'L' },
    { id: 6, name: 'Milk (1% 4L)', store: 'Walmart Online', price: 5.73, packSize: 4, unit: 'L' }
  ])
  const [form, setForm] = useState({ name: '', store: '', price: '', packSize: '', unit: 'ea' })
  const [nextId, setNextId] = useState(7)

  const stores = ['Costco In-Store', 'Costco Instacart', 'Walmart Online', 'Walmart In-Store', 'Save-On-Foods']
  const units = ['ea', 'lb', 'kg', 'L', 'ml', 'oz']

  function addItem() {
    if (!form.name || !form.store || !form.price || !form.packSize) {
      alert('Please fill in all fields')
      return
    }

    setItems([...items, { id: nextId, ...form, price: parseFloat(form.price), packSize: parseFloat(form.packSize) }])
    setNextId(nextId + 1)
    setForm({ name: '', store: '', price: '', packSize: '', unit: 'ea' })
  }

  function deleteItem(id) {
    setItems(items.filter(item => item.id !== id))
  }

  function calculateCostPerUnit(price, packSize) {
    return (price / packSize).toFixed(2)
  }

  function getItemsByName() {
    const grouped = {}
    items.forEach(item => {
      if (!grouped[item.name]) grouped[item.name] = []
      grouped[item.name].push(item)
    })
    return grouped
  }

  function exportToExcel() {
    const grouped = getItemsByName()
    const data = []

    Object.entries(grouped).forEach(([itemName, itemList]) => {
      itemList.forEach((item, idx) => {
        data.push({
          'Item': idx === 0 ? itemName : '',
          'Store': item.store,
          'Price': item.price,
          'Pack Size': item.packSize,
          'Unit': item.unit,
          'Cost Per Unit': calculateCostPerUnit(item.price, item.packSize),
          'Cheapest?': parseFloat(calculateCostPerUnit(item.price, item.packSize)) === Math.min(...itemList.map(i => parseFloat(calculateCostPerUnit(i.price, i.packSize)))) ? 'YES' : ''
        })
      })
      data.push({}) // Blank row between items
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Price Comparison')

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 14 },
      { wch: 12 }
    ]

    XLSX.writeFile(workbook, 'grocery_price_comparison.xlsx')
  }

  const grouped = getItemsByName()

  return (
    <div className="price-tracker">
      <div className="tracker-form">
        <h2>Add Price</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Item name (e.g., Eggs)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
          >
            <option value="">Select Store</option>
            {stores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-row">
          <input
            type="number"
            placeholder="Price ($)"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Pack size"
            step="0.1"
            value={form.packSize}
            onChange={(e) => setForm({ ...form, packSize: e.target.value })}
          />
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            {units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <button className="btn-add" onClick={addItem}>Add Item</button>
      </div>

      {items.length > 0 && (
        <div className="tracker-results">
          {Object.entries(grouped).map(([itemName, itemList]) => {
            const cheapest = Math.min(...itemList.map(i => parseFloat(calculateCostPerUnit(i.price, i.packSize))))

            return (
              <div key={itemName} className="item-comparison">
                <h3>{itemName}</h3>
                <div className="comparison-grid">
                  {itemList.map(item => (
                    <div
                      key={item.id}
                      className={`comparison-card ${parseFloat(calculateCostPerUnit(item.price, item.packSize)) === cheapest ? 'cheapest' : ''}`}
                    >
                      <div className="card-header">
                        <div className="store">{item.store}</div>
                        <button className="btn-delete" onClick={() => deleteItem(item.id)}>×</button>
                      </div>
                      <div className="card-price">${item.price.toFixed(2)}</div>
                      <div className="card-detail">{item.packSize} {item.unit}</div>
                      <div className="card-cost-per-unit">
                        <div className="label">Cost per {item.unit}</div>
                        <div className="value">${calculateCostPerUnit(item.price, item.packSize)}</div>
                      </div>
                      {parseFloat(calculateCostPerUnit(item.price, item.packSize)) === cheapest && (
                        <div className="cheapest-badge">Cheapest</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <button className="btn-export" onClick={exportToExcel}>📊 Export to Excel</button>
        </div>
      )}
    </div>
  )
}
