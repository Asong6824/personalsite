"use client"
import React from 'react'
import StockComparisonChart from '../../../components/features/StockComparisonChart.jsx'

export default function Page() {
  const ranges = [
    { id: 'q1-2025', label: '2025 Q1', start: '2025-01-01', end: '2025-03-31' }
  ]
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Datasets Demo</h2>
      <StockComparisonChart
        symbols={["AAPL","MSFT"]}
        ranges={ranges}
        defaultRangeId={ranges[0].id}
        datasetId={"stocks-aapl-msft-demo"}
        theme={'light'}
      />
    </div>
  )
}
