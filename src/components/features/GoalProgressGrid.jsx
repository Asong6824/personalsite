"use client"

import React from "react"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"

export default function GoalProgressGrid({ days = 7, height = 220 }) {
  const [data, setData] = React.useState({ goals: [], krs: [], entries: [] })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/notion/heatmap?days=${days}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const d = json?.days || []
        const entries = d.flatMap(x => x?.entries || [])
        setData({ goals: json?.goals || [], krs: json?.krs || [], entries })
      } catch (err) {
        console.error("GoalProgressGrid fetch error", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [days])

  const { goals, krs, entries } = data
  const totalMinutes = entries.reduce((s, e) => s + (Number(e.effMinutes || e.minutes || 0) || 0), 0)

  // Map KR -> Goal
  const krGoalMap = React.useMemo(() => new Map(krs.map(k => [k.id, k.goalId || ""])) , [krs])

  // Aggregate minutes by goal
  const minutesByGoal = React.useMemo(() => {
    const m = new Map()
    entries.forEach(e => {
      const kid = e.krId || ""
      const gid = krGoalMap.get(kid) || ""
      if (!gid) return
      const v = Number(e.effMinutes || e.minutes || 0) || 0
      m.set(gid, (m.get(gid) || 0) + v)
    })
    return m
  }, [entries, krGoalMap])

  const sumGoalWeight = goals.reduce((s, g) => s + (Number(g.weight) || 1), 0) || 1

  // Heatmap intensity palette (same as calendar heatmap)
  const heatColorForPercent = (p) => {
    if (p <= 0) return "#EDEFF2";        // none
    if (p <= 20) return "#e7f5ff";       // very light
    if (p <= 40) return "#a5d8ff";       // light
    if (p <= 60) return "#4dabf7";       // medium
    if (p <= 80) return "#228be6";       // strong
    return "#1971c2";                    // strongest
  }
  const heatSecondary = "#EDEFF2"

  return (
    <div className="rounded-xl border bg-background text-foreground p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-medium">OKR 目标进度（上一周）</h3>
        {loading && <span className="text-sm text-muted-foreground">加载中…</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {goals.map(g => {
          const gid = g.id
          const gTitle = g.title || gid
          const gWeight = Number(g.weight) || 1
          const targetMinutes = totalMinutes > 0 ? (totalMinutes * gWeight / sumGoalWeight) : 0
          const actualMinutes = minutesByGoal.get(gid) || 0
          const percent = targetMinutes > 0 ? Math.min(100, Math.round(actualMinutes / targetMinutes * 100)) : 0
          const primary = heatColorForPercent(percent)
          return (
            <div key={gid} className="flex flex-col items-center justify-center rounded-lg border p-3">
              <div className="text-sm font-medium mb-2 text-center truncate w-full" title={gTitle}>{gTitle}</div>
              <AnimatedCircularProgressBar
                value={percent}
                min={0}
                max={100}
                gaugePrimaryColor={primary}
                gaugeSecondaryColor={heatSecondary}
                className="shrink-0" />
            </div>
          )
        })}
        {goals.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">未检测到目标，请检查 Notion 数据或同步设置。</div>
        )}
      </div>
    </div>
  )
}