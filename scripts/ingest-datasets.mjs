#!/usr/bin/env node
import { fetchStockComparison } from '../src/lib/stocks/fetch.js'
import { saveDataset } from '../src/lib/datasets/store.js'

function parseArgs(argv) {
  const args = {}
  for (const a of argv.slice(2)) {
    const [k, v] = a.split('=')
    args[k.replace(/^--/, '')] = v ?? true
  }
  return args
}

function toDatasetFromStocks(payload, { id, name, tags }) {
  const series = (payload?.series || []).map(s => ({
    key: s.symbol,
    label: s.name,
    unit: 'USD',
    points: (s.points || []).map(p => ({ t: p.timestamp, v: p.price }))
  }))
  return {
    id,
    type: 'timeseries',
    name: name || payload?.meta?.title || id,
    tags: Array.isArray(tags) ? tags : ['stocks'],
    series,
    granularity: '1d'
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const domain = (args.domain || 'stocks').toLowerCase()
  const id = args.id
  if (!id) {
    console.error('Usage: npm run ingest:datasets -- --id=<dataset-id> --domain=stocks --symbols=AAPL,MSFT --start=2024-01-01 --end=2024-12-31 --source=yahoo')
    process.exit(1)
  }
  if (domain === 'stocks') {
    const symbols = (args.symbols || '').split(',').map(s => s.trim()).filter(Boolean)
    const start = args.start
    const end = args.end
    const rangeId = args.rangeId || 'default'
    const source = (args.source || 'yahoo').toLowerCase()
    if (!symbols.length || !start || !end) {
      console.error('Missing required args: symbols,start,end')
      process.exit(1)
    }
    const params = { symbols, range: { id: rangeId, start, end }, source }
    console.log('[ingest/datasets] fetching stocks', params)
    const payload = await fetchStockComparison(params)
    const ds = toDatasetFromStocks(payload, { id, name: `${symbols.join(' vs ')} (${start}~${end})`, tags: ['stocks'] })
    const saved = saveDataset(ds)
    console.log('[ingest/datasets] saved', `src/data/datasets/${saved.id}.json`)
    return
  }
  console.error('Unsupported domain:', domain)
  process.exit(2)
}

main().catch(err => {
  console.error('[ingest/datasets] error:', err)
  process.exit(1)
})

