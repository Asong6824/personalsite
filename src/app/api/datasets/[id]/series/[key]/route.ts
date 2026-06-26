import { NextResponse } from 'next/server'
import { appendSeriesPoints, loadDataset } from '../../../../../../lib/datasets/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const canWriteApiFiles = process.env.ALLOW_API_FILE_WRITES === '1'

export async function PUT(req, ctx) {
  try {
    if (!canWriteApiFiles) {
      return NextResponse.json(
        { error: 'Dataset mutation API is disabled. Use local ingest scripts or set ALLOW_API_FILE_WRITES=1 for local maintenance.' },
        { status: 403 }
      )
    }
    const { id, key } = (await ctx?.params) || {}
    if (!id || !key) return NextResponse.json({ error: 'Missing id/key' }, { status: 400 })
    const body = await req.json()
    const points = Array.isArray(body?.points) ? body.points : []
    const updated = appendSeriesPoints(id, key, points)
    const ds = loadDataset(id)
    const res = NextResponse.json({ id, series: updated, updatedAt: ds?.updatedAt }, { status: 200 })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (err) {
    console.error('[api/datasets/:id/series/:key] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
