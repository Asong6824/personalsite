// 统一数据模型与归一化工具
import { parseISO, isValid } from 'date-fns'

/**
 * 将任意 Provider 的原始点位归一化为 SampledPoint
 * @param {Array<{ timestamp: string|number|Date, price: number }>} points
 * @returns {Array<{ timestamp: string, price: number, change?: number, changePct?: number }>}
 */
export function normalizePoints(points = []) {
  const out = []
  let prev = null
  for (const p of points) {
    const ts = typeof p.timestamp === 'string'
      ? (isValid(parseISO(p.timestamp)) ? new Date(p.timestamp) : new Date(p.timestamp))
      : new Date(p.timestamp)
    const price = Number(p.price)
    const item = {
      timestamp: ts.toISOString(),
      price
    }
    if (prev != null && Number.isFinite(prev)) {
      const change = price - prev
      const changePct = prev === 0 ? 0 : (change / prev) * 100
      item.change = Number(change.toFixed(4))
      item.changePct = Number(changePct.toFixed(4))
    }
    out.push(item)
    prev = price
  }
  return out
}

/**
 * 根据点位计算 latest 指标
 * @param {Array<{ price: number }>} points
 */
function buildLatest(points = []) {
  if (!points.length) {
    return {
      price: 0,
      change: 0,
      changePct: 0,
      prevClose: 0
    }
  }
  const last = points[points.length - 1]
  const prev = points.length > 1 ? points[points.length - 2] : { price: last.price }
  const change = last.price - prev.price
  const changePct = prev.price === 0 ? 0 : (change / prev.price) * 100
  return {
    price: Number(last.price.toFixed(4)),
    change: Number(change.toFixed(4)),
    changePct: Number(changePct.toFixed(4)),
    prevClose: Number(prev.price.toFixed(4))
  }
}

/**
 * 归一化单只股票的序列
 * @param {{ symbol: string, name?: string, currency?: string, points: Array<{ timestamp: any, price: number }> }} input
 */
export function normalizeSeries(input) {
  const points = normalizePoints(input.points)
  return {
    symbol: input.symbol,
    name: input.name || input.symbol,
    currency: input.currency || 'USD',
    points,
    latest: buildLatest(points)
  }
}

/**
 * 构建统一 Payload
 * @param {Array<any>} series
 * @param {{ id: string, start: string, end: string }} range
 * @param {'alpha'|'yahoo'|'custom'|'mock'} source
 */
export function buildPayload(series, range, source = 'mock') {
  return {
    meta: {
      source,
      range,
      generatedAt: new Date().toISOString()
    },
    series
  }
}