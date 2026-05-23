#!/usr/bin/env node
import { fetchStockComparison } from '../src/lib/stocks/fetch'
import { buildStorageKey, saveStoredPayload } from '../src/lib/stocks/store'

function parseArgs(argv: string[]): Record<string, any> {
  const args: Record<string, any> = {}
  for (const a of argv.slice(2)) {
    const [k, v] = a.split('=')
    args[k.replace(/^--/, '')] = v ?? true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  const symbols = (args.symbols || '').split(',').map(s => s.trim()).filter(Boolean)
  const start = args.start
  const end = args.end
  const rangeId = args.rangeId || 'default'
  const source = (args.source || 'yahoo').toLowerCase()

  if (!symbols.length || !start || !end) {
    console.error('Usage: npm run ingest:stocks -- --symbols=BE,ETN --start=2024-10-01 --end=2025-07-01 --rangeId=ai-infra --source=yahoo')
    process.exit(1)
  }

  const params = { symbols, range: { id: rangeId, start, end }, source }
  console.log('[ingest] fetching', params)
  const payload = await fetchStockComparison(params)
  const key = buildStorageKey(params)
  saveStoredPayload(key, payload)
  console.log('[ingest] saved to', `src/data/stocks/${key}.json`)
}

main().catch(err => {
  console.error('[ingest] error:', err)
  process.exit(1)
})