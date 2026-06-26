#!/usr/bin/env node
import { fetchStockComparison } from '../src/lib/stocks/fetch'
import { saveDataset } from '../src/lib/datasets/store'
import type { Dataset } from '../src/types'

type CliArgs = Record<string, string | boolean | undefined>

interface StockPointPayload {
  timestamp: string
  price: number
}

interface StockSeriesPayload {
  symbol: string
  name?: string
  points: StockPointPayload[]
}

interface StockComparisonPayload {
  meta?: {
    title?: string
  }
  series?: StockSeriesPayload[]
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {}
  for (const a of argv.slice(2)) {
    const [k, v] = a.split('=')
    args[k.replace(/^--/, '')] = v ?? true
  }
  return args
}

function toDatasetFromStocks(payload: StockComparisonPayload, { id, name, tags }: { id: string, name?: string, tags?: string[] }): Dataset {
  const series = (payload?.series || []).map(s => ({
    key: s.symbol,
    label: s.name,
    unit: 'USD',
    points: (s.points || []).map(p => ({ t: p.timestamp, v: p.price }))
  }))
  return {
    id,
    type: 'timeseries' as const,
    name: name || payload?.meta?.title || id,
    tags: Array.isArray(tags) ? tags : ['stocks'],
    series,
    granularity: '1d'
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const domain = String(args.domain || 'stocks').toLowerCase()
  const id = String(args.id || '')
  if (!id) {
    console.error('Usage: npm run ingest:datasets -- --id=<dataset-id> --domain=stocks --symbols=AAPL,MSFT --start=2024-01-01 --end=2024-12-31 --source=yahoo')
    process.exit(1)
  }
  if (domain === 'stocks') {
    const symbols = String(args.symbols || '').split(',').map(s => s.trim()).filter(Boolean)
    const start = String(args.start || '')
    const end = String(args.end || '')
    const rangeId = String(args.rangeId || 'default')
    const source = String(args.source || 'yahoo').toLowerCase()
    if (!symbols.length || !start || !end) {
      console.error('Missing required args: symbols,start,end')
      process.exit(1)
    }
    const params = { symbols, range: { id: rangeId, start, end }, source }
    console.log('[ingest/datasets] fetching stocks', params)
    const payload = await fetchStockComparison(params) as StockComparisonPayload
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
