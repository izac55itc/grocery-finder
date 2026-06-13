'use strict'

async function main() {
  console.log('🛒 Grocery Price Scraper')
  console.log('Ready to scrape grocery prices from stores')
  console.log('Stores to add:')
  console.log('- Save-On-Foods')
  console.log('- Costco')
  console.log('- Walmart')
  console.log('- Whole Foods')
  console.log('')
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
