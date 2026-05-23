import { NextResponse } from 'next/server'
import { loadDataset } from '../../../../lib/datasets/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseQuery(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const series = (searchParams.get('series') || '').split(',').map(s => s.trim()).filter(Boolean)
  return { type, from, to, series }
}

function trimTimeseries(ds, { from, to, series }) {
  const ff = from ? new Date(from).toISOString() : null
  const tt = to ? new Date(to).toISOString() : null
  const keys = Array.isArray(series) && series.length ? new Set(series) : null
  const filteredSeries = (ds.series || [])
    .filter(s => (keys ? keys.has(s.key) : true))
    .map(s => ({
      ...s,
      points: (s.points || []).filter(p => {
        const t = p.t
        if (ff && t < ff) return false
        if (tt && t > tt) return false
        return true
      })
    }))
  return { ...ds, series: filteredSeries }
}

export async function GET(req, ctx) {
  try {
    const { id } = (await ctx?.params) || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const query = parseQuery(req)
    const ds = loadDataset(id)
    if (!ds) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    if (query.type && String(ds.type).toLowerCase() !== String(query.type).toLowerCase()) {
      return NextResponse.json({ error: 'Type mismatch' }, { status: 400 })
    }
    let result = ds
    if (ds.type === 'timeseries') result = trimTimeseries(ds, query)
    const res = NextResponse.json(result, { status: 200 })
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    return res
  } catch (err) {
    console.error('[api/datasets/:id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
