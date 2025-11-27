import { NextResponse } from 'next/server'
import { listDatasetMetas } from '../../../lib/datasets/store.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseQuery(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const tag = searchParams.get('tag')
  const q = searchParams.get('q')
  return { type, tag, q }
}

export async function GET(req) {
  try {
    const params = parseQuery(req)
    const metas = listDatasetMetas(params)
    const res = NextResponse.json({ metas }, { status: 200 })
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    return res
  } catch (err) {
    console.error('[api/datasets] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

