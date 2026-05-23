// Yahoo Finance via RapidAPI: fetch historical prices and normalize
import { normalizeSeries } from '../normalize'

const YH_ENDPOINT = 'https://yh-finance.p.rapidapi.com/stock/v3/get-historical-data'
const YH_HOST = 'yh-finance.p.rapidapi.com'

function parseYahooPrices(json) {
  const arr = json?.prices || []
  // Filter out events like DIVIDEND, SPLIT
  const rows = arr.filter(r => r?.close != null && typeof r.close === 'number' && !r?.type)
  const points = rows.map(r => ({
    timestamp: new Date((r.date || 0) * 1000).toISOString(),
    price: Number(r.close)
  }))
  // Sort by timestamp ascending
  points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  return points
}

export async function fetchYahooSeries(symbol, range) {
  const key = process.env.RAPIDAPI_KEY
  if (!key) throw new Error('RAPIDAPI_KEY missing')

  const url = `${YH_ENDPOINT}?symbol=${encodeURIComponent(symbol)}&region=US`
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': YH_HOST
    },
    next: { revalidate: 3600 }
  })
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`)
  const json = await res.json()

  const allPoints = parseYahooPrices(json)
  if (!allPoints.length) throw new Error('Yahoo empty timeseries')

  const start = range?.start ? new Date(range.start) : null
  const end = range?.end ? new Date(range.end) : null
  const points = allPoints.filter(p => {
    const d = new Date(p.timestamp)
    if (start && d < start) return false
    if (end && d > end) return false
    return true
  })

  return normalizeSeries({ symbol, points })
}