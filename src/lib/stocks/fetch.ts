import { normalizeSeries, buildPayload } from './normalize'
import { fetchMockSeries } from './providers/mock'
import { fetchAlphaSeries } from './providers/alpha'
import { fetchYahooSeries } from './providers/yahoo'
import { getCache, setCache } from '../cache'

function selectSource(source) {
  const s = (source || 'alpha').toLowerCase()
  if (s === 'alpha') return 'alpha'
  if (s === 'yahoo') return 'yahoo'
  if (s === 'custom') return 'custom'
  return 'mock'
}

function envHasAlpha() {
  return !!process.env.ALPHA_VANTAGE_API_KEY
}

function envHasYahoo() {
  return !!process.env.RAPIDAPI_KEY
}

/**
 * 获取股票对比数据（统一模型）
 * @param {{ symbols: string[], range: { id: string, start: string, end: string }, source?: string }} params
 */
export async function fetchStockComparison(params) {
  const { symbols = [], range, source } = params
  const src = selectSource(source)
  // 路由不同 Provider（外部源缺失时回退）
  const useMock = src === 'mock' || (src === 'alpha' && !envHasAlpha()) || (src === 'yahoo' && !envHasYahoo())
  const initialSource = useMock ? 'mock' : src
  const cacheKeyParams = [initialSource, symbols.join(','), range.start, range.end, range.id || 'default']
  const cached = getCache('stocks', cacheKeyParams)
  if (cached) {
    return cached
  }

  const series = []
  let usedProvider = false

  for (const symbol of symbols) {
    let raw
    if (useMock) {
      raw = await fetchMockSeries(symbol, range)
    } else {
      try {
        if (src === 'alpha') {
          raw = await fetchAlphaSeries(symbol, range)
          usedProvider = true
        } else if (src === 'yahoo') {
          raw = await fetchYahooSeries(symbol, range)
          usedProvider = true
        } else {
          // 未来扩展：yahoo/custom
          raw = await fetchMockSeries(symbol, range)
        }
      } catch (e) {
        // 限流或错误时回退
        raw = await fetchMockSeries(symbol, range)
      }
    }
    series.push(normalizeSeries(raw))
  }

  const resolvedSource = usedProvider ? src : 'mock'
  const payload = buildPayload(series, range, resolvedSource)
  // 默认缓存 30 分钟（外部源），5 分钟（mock）
  const ttl = resolvedSource === 'mock' ? 5 * 60 * 1000 : 30 * 60 * 1000
  const finalKey = [resolvedSource, symbols.join(','), range.start, range.end, range.id || 'default']
  setCache('stocks', finalKey, payload, ttl)
  return payload
}