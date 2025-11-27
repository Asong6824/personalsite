// Mock Provider：在缺失外部 API Key 或开发环境下生成可用的时间序列
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'

function toDate(input) {
  if (input instanceof Date) return input
  try { return parseISO(input) } catch { return new Date(input) }
}

/**
 * 生成某只股票的日线数据（简单的趋势+噪声）
 * @param {string} symbol
 * @param {{ start: string, end: string }} range
 */
export async function fetchMockSeries(symbol, range) {
  const start = toDate(range.start)
  const end = toDate(range.end)
  const days = Math.max(1, differenceInCalendarDays(end, start))
  const base = 10 + Math.random() * 90 // 10~100 随机基准价
  const drift = (Math.random() - 0.5) * 0.02 // 每日漂移（-2%~+2%）
  const vol = 0.03 + Math.random() * 0.04 // 波动系数

  const points = []
  let price = base
  for (let i = 0; i <= days; i++) {
    const date = addDays(start, i)
    // 简单噪声模型：正弦 + 随机扰动
    const noise = Math.sin(i / 12) * vol * base + (Math.random() - 0.5) * vol * base
    price = Math.max(0.5, price * (1 + drift)) + noise / base
    points.push({ timestamp: date.toISOString(), price })
  }

  return {
    symbol,
    name: symbol,
    currency: 'USD',
    points
  }
}