// Alpha Vantage provider: fetch daily adjusted time series and normalize
import { normalizeSeries } from '../normalize'

const ALPHA_ENDPOINT = 'https://www.alphavantage.co/query'

function parseAlphaDailyAdjusted(json) {
  const ts = json['Time Series (Daily)']
  if (!ts || typeof ts !== 'object') return []
  const points = Object.entries(ts)
    .map(([date, obj]) => ({
      timestamp: date, // YYYY-MM-DD (normalizePoints will parse)
      price: parseFloat(obj['5. adjusted close'] ?? obj['4. close'] ?? obj['1. open']),
      open: parseFloat(obj['1. open']),
      high: parseFloat(obj['2. high']),
      low: parseFloat(obj['3. low']),
      close: parseFloat(obj['4. close']),
      volume: parseInt(obj['6. volume'] ?? obj['5. volume'] ?? '0', 10),
    }))
    .filter(p => !Number.isNaN(p.price))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  return points
}

export async function fetchAlphaSeries(symbol, range) {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY missing')

  const url = `${ALPHA_ENDPOINT}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=full&apikey=${key}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`)
  const json = await res.json()

  if (json.Note || json['Error Message']) {
    throw new Error(json.Note || json['Error Message'] || 'Alpha Vantage error')
  }

  const allPoints = parseAlphaDailyAdjusted(json)
  if (!allPoints.length) {
    throw new Error('Alpha Vantage empty timeseries')
  }
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