"use client"
import React from 'react'
import StockComparisonChart from '../../../components/features/StockComparisonChart'

export default function Page() {
  const ranges = [
    { id: 'q1-2025', label: '2025 Q1', start: '2025-01-01', end: '2025-03-31' }
  ]
  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 pb-12 pt-28 sm:px-6">
      <h1 className="mb-4 text-2xl font-bold">Datasets Demo</h1>
      <StockComparisonChart
        symbols={["AAPL","MSFT"]}
        ranges={ranges}
        defaultRangeId={ranges[0].id}
        datasetId={"stocks-aapl-msft-demo"}
        theme={'light'}
      />
    </main>
  )
}
