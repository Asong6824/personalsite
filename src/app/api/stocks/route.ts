import { NextResponse } from 'next/server'
import { fetchStockComparison } from '../../../lib/stocks/fetch'
import { buildStorageKey, loadStoredPayload, saveStoredPayload } from '../../../lib/stocks/store'

function parseQuery(req) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get('symbols') || ''
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const rangeId = searchParams.get('rangeId') || 'default'
  const source = (searchParams.get('source') || 'alpha').toLowerCase()
  const prefer = (searchParams.get('prefer') || '').toLowerCase()
  const save = (searchParams.get('save') || '1') === '1'
  const symbols = symbolsParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  return {
    symbols,
    range: { id: rangeId, start, end },
    source,
    prefer,
    save
  }
}

export async function GET(req) {
  try {
    const params = parseQuery(req)
    if (!params.symbols.length || !params.range.start || !params.range.end) {
      return NextResponse.json({ error: 'Missing required query: symbols,start,end' }, { status: 400 })
    }

    // 优先读取已存储数据（prefer=stored 或 source=stored）
    const wantStored = params.source === 'stored' || params.prefer === 'stored'
    const storageKey = buildStorageKey({ source: params.source, symbols: params.symbols, range: params.range })
    if (wantStored) {
      const stored = loadStoredPayload(storageKey)
      if (stored) {
        const res = NextResponse.json(stored, { status: 200 })
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
        return res
      }
    }

    const payload = await fetchStockComparison(params)
    // 将结果持久化（默认开启，可用 save=0 关闭）
    if (params.save) {
      try { saveStoredPayload(storageKey, payload) } catch (e) { /* ignore write errors */ }
    }
    const res = NextResponse.json(payload, { status: 200 })
    // 缓存策略：短期共享缓存 + S-W-R
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    return res
  } catch (err) {
    console.error('[api/stocks] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}