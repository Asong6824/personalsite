"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'

function formatDateLabel(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function StockComparisonChart({
  symbols = [],
  ranges = [],
  defaultRangeId,
  source = 'alpha',
  theme = 'light',
  datasetId
}) {
  const [selectedRangeId, setSelectedRangeId] = useState(defaultRangeId || (ranges[0]?.id || 'default'))
  const selectedRange = useMemo(() => ranges.find(r => r.id === selectedRangeId) || ranges[0], [ranges, selectedRangeId])
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (!selectedRange || symbols.length === 0) return
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        if (datasetId) {
          const usp = new URLSearchParams({ from: selectedRange.start, to: selectedRange.end })
          if (symbols.length) usp.set('series', symbols.join(','))
          const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}?${usp.toString()}`, { signal: controller.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const ds = await res.json()
          if (ds && ds.type === 'timeseries' && Array.isArray(ds.series)) {
            const mapped = {
              meta: { source: 'dataset' },
              series: ds.series.map(s => ({
                symbol: s.key,
                name: s.label || s.key,
                points: (s.points || []).map(p => ({ timestamp: p.t, price: p.v })),
                latest: undefined
              }))
            }
            setPayload(mapped)
          } else {
            setPayload(null)
          }
        } else {
          const params = new URLSearchParams({
            symbols: symbols.join(','),
            start: selectedRange.start,
            end: selectedRange.end,
            rangeId: selectedRange.id,
            source
          })
          const res = await fetch(`/api/stocks?${params.toString()}`, { signal: controller.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          setPayload(data)
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [symbols.join(','), selectedRangeId, source, datasetId])

  useEffect(() => {
    if (!chartRef.current) return
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : undefined)
    }
    const chart = chartInstanceRef.current
    const dispose = () => {
      if (chart) chart.dispose()
      chartInstanceRef.current = null
    }
    return dispose
  }, [theme])

  useEffect(() => {
    const chart = chartInstanceRef.current || (chartRef.current ? echarts.init(chartRef.current, theme === 'dark' ? 'dark' : undefined) : null)
    if (!chart) return
    if (!payload || !payload.series) return
    const xAxisData = (payload.series[0]?.points || []).map(p => formatDateLabel(p.timestamp))
    const option = {
      animation: true,
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: { left: 40, right: 20, top: 40, bottom: 40 },
      xAxis: { type: 'category', data: xAxisData },
      yAxis: { type: 'value', scale: true },
      series: payload.series.map(s => ({
        name: s.symbol,
        type: 'line',
        showSymbol: false,
        data: s.points.map(p => Number(p.price.toFixed(4)))
      }))
    }
    chart.setOption(option)
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [payload, theme])

  const hasSingleRange = ranges.length <= 1
  const isDark = theme === 'dark'
  const sourceLabel = payload?.meta?.source ? (payload.meta.source === 'mock' ? 'Mock' : payload.meta.source.toUpperCase()) : (source === 'alpha' ? 'ALPHA' : source)

  return (
    <div style={{ border: '1px solid', borderColor: isDark ? '#444' : '#ddd', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Stock Comparison</div>
          <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 6, border: '1px solid', borderColor: isDark ? '#555' : '#ccc', color: isDark ? '#bbb' : '#666' }}>Source: {sourceLabel}</span>
        </div>
        {!hasSingleRange && (
          <div style={{ display: 'flex', gap: 8 }}>
            {ranges.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRangeId(r.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: selectedRangeId === r.id ? (isDark ? '#88f' : '#66f') : (isDark ? '#555' : '#ccc'),
                  background: selectedRangeId === r.id ? (isDark ? '#223' : '#eef') : (isDark ? '#222' : '#fff'),
                  color: isDark ? '#ddd' : '#333',
                  cursor: 'pointer'
                }}
              >{r.label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', height: 320, width: '100%', background: isDark ? '#171717' : '#fafafa' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            加载中...
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
            加载失败：{String(error.message || error)}
          </div>
        )}
        <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid ${isDark ? '#444' : '#ddd'}` }}>
              <th style={{ padding: '8px 4px' }}>Symbol</th>
              <th style={{ padding: '8px 4px' }}>Name</th>
              <th style={{ padding: '8px 4px' }}>Price</th>
              <th style={{ padding: '8px 4px' }}>Change</th>
              <th style={{ padding: '8px 4px' }}>% Change</th>
              <th style={{ padding: '8px 4px' }}>Prev Close</th>
            </tr>
          </thead>
          <tbody>
            {(payload?.series || []).map(s => {
              const up = (s.latest?.change || 0) >= 0
              const color = up ? (isDark ? '#5bd36d' : '#089f49') : (isDark ? '#f26d6d' : '#c62828')
              return (
                <tr key={s.symbol} style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}` }}>
                  <td style={{ padding: '6px 4px', fontWeight: 600 }}>{s.symbol}</td>
                  <td style={{ padding: '6px 4px', color: isDark ? '#bbb' : '#666' }}>{s.name}</td>
                  <td style={{ padding: '6px 4px' }}>{s.latest?.price?.toFixed(2)}</td>
                  <td style={{ padding: '6px 4px', color }}>{up ? `+${s.latest?.change?.toFixed(2)}` : s.latest?.change?.toFixed(2)}</td>
                  <td style={{ padding: '6px 4px', color }}>{up ? `+${s.latest?.changePct?.toFixed(2)}%` : `${s.latest?.changePct?.toFixed(2)}%`}</td>
                  <td style={{ padding: '6px 4px' }}>{s.latest?.prevClose?.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
