import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function PriceTracker() {
  const [items, setItems] = useState([
    { id: 1, name: 'Eggs', store: 'Costco Instacart', price: 11.91, packSize: 24, unit: 'ea' },
    { id: 2, name: 'Eggs', store: 'Walmart Online', price: 10.22, packSize: 30, unit: 'ea' },
    { id: 3, name: 'Bananas', store: 'Costco Instacart', price: 2.26, packSize: 1.36, unit: 'kg' },
    { id: 4, name: 'Bananas', store: 'Walmart Online', price: 1.70, packSize: 1, unit: 'kg' },
    { id: 5, name: 'Milk (1% 4L)', store: 'Costco Instacart', price: 6.50, packSize: 4, unit: 'L' },
    { id: 6, name: 'Milk (1% 4L)', store: 'Walmart Online', price: 5.73, packSize: 4, unit: 'L' },
    { id: 7, name: 'Cheddar Cheese', store: 'Costco Instacart', price: 18.15, packSize: 1.15, unit: 'kg' },
    { id: 8, name: 'Cheddar Cheese', store: 'Walmart Online', price: 8.77, packSize: 0.7, unit: 'kg' },
    { id: 9, name: 'Chicken Breast', store: 'Costco Instacart', price: 17.58, packSize: 1, unit: 'kg' },
    { id: 10, name: 'Chicken Breast', store: 'Walmart Online', price: 14.00, packSize: 0.93, unit: 'kg' },
    { id: 11, name: 'Avocado', store: 'Costco Instacart', price: 1.89, packSize: 1, unit: 'ea' },
    { id: 12, name: 'Avocado', store: 'Walmart Online', price: 0.98, packSize: 1, unit: 'ea' },
    { id: 13, name: 'GoGo Squeez Fruit Sauce', store: 'Costco Instacart', price: 21.55, packSize: 2.52, unit: 'kg' },
    { id: 14, name: 'GoGo Squeez Fruit Sauce', store: 'Walmart Online', price: 13.97, packSize: 1.8, unit: 'kg' },
    { id: 15, name: 'Bubly Sparkling Water', store: 'Costco Instacart', price: 17.92, packSize: 32, unit: 'ea' },
    { id: 16, name: 'Bubly Sparkling Water', store: 'Walmart Online', price: 6.27, packSize: 12, unit: 'ea' },
    { id: 17, name: 'Bell Peppers', store: 'Costco Instacart', price: 9.64, packSize: 6, unit: 'ea' },
    { id: 18, name: 'Bell Peppers', store: 'Walmart Online', price: 1.28, packSize: 1, unit: 'ea' },
    { id: 19, name: 'English Cucumber', store: 'Costco Instacart', price: 3.39, packSize: 3, unit: 'ea' },
    { id: 20, name: 'English Cucumber', store: 'Walmart Online', price: 0.84, packSize: 1, unit: 'ea' },
    { id: 21, name: 'Rice Crackers', store: 'Costco Instacart', price: 2.38, packSize: 100, unit: 'g' },
    { id: 22, name: 'Rice Crackers', store: 'Walmart Online', price: 1.48, packSize: 100, unit: 'g' },
    { id: 23, name: 'Little Potatoes', store: 'Costco Instacart', price: 9.07, packSize: 2.27, unit: 'kg' },
    { id: 24, name: 'Little Potatoes', store: 'Walmart Online', price: 2.74, packSize: 0.68, unit: 'kg' },
    { id: 25, name: 'Romaine Lettuce Hearts', store: 'Costco Instacart', price: 10.20, packSize: 6, unit: 'ea' },
    { id: 26, name: 'Romaine Lettuce Hearts', store: 'Walmart Online', price: 4.97, packSize: 3, unit: 'ea' },
    { id: 27, name: 'Oranges', store: 'Costco Instacart', price: 11.34, packSize: 2.27, unit: 'kg' },
    { id: 28, name: 'Oranges', store: 'Walmart Online', price: 1.42, packSize: 0.28, unit: 'kg' },
    { id: 29, name: 'Eggs', store: 'Save-On-Foods', price: 10.45, packSize: 30, unit: 'ea' },
    { id: 30, name: 'Bananas', store: 'Save-On-Foods', price: 0.39, packSize: 0.2, unit: 'kg' },
    { id: 31, name: 'Milk (1% 4L)', store: 'Save-On-Foods', price: 6.35, packSize: 4, unit: 'L' },
    { id: 32, name: 'Cheddar Cheese', store: 'Save-On-Foods', price: 14.99, packSize: 0.82, unit: 'kg' },
    { id: 33, name: 'Chicken Breast', store: 'Save-On-Foods', price: 16.51, packSize: 1.25, unit: 'kg' },
    { id: 34, name: 'Avocado', store: 'Save-On-Foods', price: 2.00, packSize: 1, unit: 'ea' },
    { id: 35, name: 'GoGo Squeez Fruit Sauce', store: 'Save-On-Foods', price: 13.99, packSize: 12, unit: 'ea' },
    { id: 36, name: 'Bubly Sparkling Water', store: 'Save-On-Foods', price: 6.49, packSize: 12, unit: 'ea' },
    { id: 37, name: 'Bell Peppers', store: 'Save-On-Foods', price: 4.99, packSize: 0.91, unit: 'kg' },
    { id: 38, name: 'English Cucumber', store: 'Save-On-Foods', price: 6.99, packSize: 3, unit: 'ea' },
    { id: 39, name: 'Rice Crackers', store: 'Save-On-Foods', price: 2.67, packSize: 100, unit: 'g' },
    { id: 40, name: 'Little Potatoes', store: 'Save-On-Foods', price: 8.99, packSize: 1.36, unit: 'kg' },
    { id: 41, name: 'Romaine Lettuce Hearts', store: 'Save-On-Foods', price: 8.99, packSize: 3, unit: 'ea' },
    { id: 42, name: 'Oranges', store: 'Save-On-Foods', price: 2.54, packSize: 0.385, unit: 'kg' }
  ])
  const [form, setForm] = useState({ name: '', store: '', price: '', packSize: '', unit: 'ea' })
  const [nextId, setNextId] = useState(43)

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

  function calculateStoreTotal(storeName) {
    const grouped = getItemsByName()
    let total = 0

    Object.entries(grouped).forEach(([itemName, itemList]) => {
      const storeItem = itemList.find(item => item.store === storeName)
      if (storeItem) {
        total += storeItem.price
      }
    })
    return total
  }

  function getCheapestStore() {
    const stores = ['Costco Instacart', 'Walmart Online', 'Save-On-Foods']
    const totals = {}
    stores.forEach(store => {
      totals[store] = calculateStoreTotal(store)
    })
    return totals
  }

  const storeTotals = getCheapestStore()
  const costcoTotal = storeTotals['Costco Instacart'] || 0
  const walmartTotal = storeTotals['Walmart Online'] || 0
  const saveOnTotal = storeTotals['Save-On-Foods'] || 0

  return (
    <div className="price-tracker">
      <div className="summary-section">
        <h2>💰 Annual Cost Comparison (54 Weeks)</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-store">Costco Instacart</div>
            <div className="summary-row">
              <span>Weekly:</span>
              <strong>${costcoTotal.toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>54 Weeks:</span>
              <strong>${(costcoTotal * 54).toFixed(2)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-store">Walmart Online</div>
            <div className="summary-row">
              <span>Weekly:</span>
              <strong>${walmartTotal.toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>54 Weeks:</span>
              <strong>${(walmartTotal * 54).toFixed(2)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-store">Save-On-Foods</div>
            <div className="summary-row">
              <span>Weekly:</span>
              <strong>${saveOnTotal.toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>54 Weeks:</span>
              <strong>${(saveOnTotal * 54).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="savings-section">
          <h3>Savings vs Costco</h3>
          <div className="savings-grid">
            <div className="saving-card">
              <div className="saving-label">Walmart Online</div>
              <div className="saving-amount">${((costcoTotal - walmartTotal) * 54).toFixed(2)}</div>
              <div className="saving-percent">{(((costcoTotal - walmartTotal) / costcoTotal) * 100).toFixed(1)}% cheaper</div>
            </div>
            <div className="saving-card">
              <div className="saving-label">Save-On-Foods</div>
              <div className="saving-amount">${((costcoTotal - saveOnTotal) * 54).toFixed(2)}</div>
              <div className="saving-percent">{(((costcoTotal - saveOnTotal) / costcoTotal) * 100).toFixed(1)}% {costcoTotal > saveOnTotal ? 'cheaper' : 'more expensive'}</div>
            </div>
          </div>
        </div>
      </div>

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
