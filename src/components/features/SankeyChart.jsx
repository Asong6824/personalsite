/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export default function SankeyChart() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const chart = echarts.init(el)

    // 双系列：左(Goals→KRs，权重)，右(KRs→Activities，分钟)
    const renderOptionDual = (leftSeries, rightSeries, formatLabel) => {
      const option = {
        title: { text: 'Goals → KRs → Activities（上一周）', left: 'center' },
        tooltip: { trigger: 'item', triggerOn: 'mousemove', formatter: params => {
          if (params.dataType === 'edge') {
            const s = params.data.source || ''
            const t = params.data.target || ''
            const isWeight = params.seriesIndex === 0 // 左系列为权重
            const unit = isWeight ? '权重' : '分钟'
            const val = Math.round(Number(params.data.value) || 0)
            return `${formatLabel(s)} → ${formatLabel(t)} · ${val} ${unit}`
          }
          return formatLabel(params.name)
        } },
        series: [
          {
            type: 'sankey',
            left: '5%', right: '52%', top: 40, bottom: 20,
            nodeAlign: 'justify', nodeGap: 16,
            lineStyle: { color: 'source', curveness: 0.5, opacity: 0.65 },
            emphasis: { focus: 'adjacency' },
            label: { show: true, formatter: (p) => formatLabel(p.name) },
            levels: [
              { depth: 0, itemStyle: { color: '#3b82f6' }, label: { color: '#1f2937' } }, // Goals
              { depth: 1, itemStyle: { color: '#10b981' }, label: { color: '#1f2937' } }, // KRs
            ],
            ...leftSeries
          },
          {
            type: 'sankey',
            left: '52%', right: '5%', top: 40, bottom: 20,
            nodeAlign: 'justify', nodeGap: 16,
            lineStyle: { color: 'source', curveness: 0.5, opacity: 0.65 },
            emphasis: { focus: 'adjacency' },
            label: { show: true, formatter: (p) => formatLabel(p.name) },
            levels: [
              { depth: 0, itemStyle: { color: '#10b981' }, label: { color: '#1f2937' } }, // KRs
              { depth: 1, itemStyle: { color: '#f59e0b' }, label: { color: '#1f2937' } },  // Activities
            ],
            ...rightSeries
          }
        ]
      }
      chart.setOption(option)
    }

    const renderSample = () => {
      const goals = [
        { id: 'g1', title: 'Health', weight: 3 },
        { id: 'g2', title: 'Career', weight: 4 },
        { id: 'g3', title: 'Learning', weight: 3 }
      ]
      const krs = [
        { id: 'kr1', title: 'Run 3x', goalId: 'g1', weight: 2 },
        { id: 'kr2', title: 'Meditate', goalId: 'g1', weight: 1 },
        { id: 'kr3', title: 'Ship feature', goalId: 'g2', weight: 3 },
        { id: 'kr4', title: 'Write blog', goalId: 'g2', weight: 1 },
        { id: 'kr5', title: 'Read papers', goalId: 'g3', weight: 1 },
        { id: 'kr6', title: 'Practice coding', goalId: 'g3', weight: 2 }
      ]
      const activities = [
        { name: 'Morning Run', krId: 'kr1', value: 45 },
        { name: 'Breathing Exercise', krId: 'kr2', value: 20 },
        { name: 'Implement API', krId: 'kr3', value: 120 },
        { name: 'Draft Article', krId: 'kr4', value: 60 },
        { name: 'Paper: RLHF', krId: 'kr5', value: 90 },
        { name: 'LeetCode Practice', krId: 'kr6', value: 80 }
      ]

      // 左系列：Goals→KRs（权重）
      const nodesLeft = [
        ...goals.map(g => ({ name: `G:${g.id}` })),
        ...krs.map(k => ({ name: `KRw:${k.id}` })),
      ]
      const krsByGoal = new Map()
      krs.forEach(k => {
        const arr = krsByGoal.get(k.goalId) || []
        arr.push(k)
        krsByGoal.set(k.goalId, arr)
      })
      const linksLeft = []
      goals.forEach(g => {
        const group = krsByGoal.get(g.id) || []
        const sumKw = group.reduce((s, k) => s + (Number(k.weight) || 0), 0)
        if (group.length === 0) return
        group.forEach(k => {
          const share = sumKw > 0 ? (Number(k.weight) || 0) / sumKw : (1 / group.length)
          const value = (Number(g.weight) || 1) * share
          linksLeft.push({ source: `G:${g.id}`, target: `KRw:${k.id}`, value })
        })
      })

      // 右系列：KRs→Activities（分钟）
      const nodesRight = [
        ...krs.map(k => ({ name: `KRm:${k.id}` })),
        ...activities.map(a => ({ name: `A:${a.name}` })),
      ]
      const linksRight = activities.map(a => ({ source: `KRm:${a.krId}`, target: `A:${a.name}`, value: a.value }))

      const goalTitles = new Map(goals.map(g => [g.id, g.title]))
      const krTitles = new Map(krs.map(k => [k.id, k.title]))
      const formatLabel = (name) => {
        if (name.startsWith('G:')) return goalTitles.get(name.slice(2)) || name.slice(2)
        if (name.startsWith('KRw:') || name.startsWith('KRm:')) return krTitles.get(name.slice(4)) || name.slice(4)
        if (name.startsWith('A:')) return name.slice(2)
        return name
      }

      renderOptionDual(
        { data: nodesLeft, links: linksLeft },
        { data: nodesRight, links: linksRight },
        formatLabel
      )
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/notion/heatmap?days=7', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        const days = json?.days || []
        const entries = days.flatMap(d => d?.entries || [])

        const goals = json?.goals || []
        const krs = json?.krs || []

        const goalTitles = new Map(goals.map(g => [g.id, g.title || g.id]))
        const krTitles = new Map(krs.map(k => [k.id, k.title || k.id]))
        const krGoalMap = new Map(krs.map(k => [k.id, k.goalId || '']))
        const goalWeight = new Map(goals.map(g => [g.id, Number(g.weight) || 1]))
        const krWeight = new Map(krs.map(k => [k.id, Number(k.weight) || 1]))

        // 左系列：Goals→KRs（权重）
        const nodesLeftSet = new Set()
        goals.forEach(g => nodesLeftSet.add(`G:${g.id}`))
        krs.forEach(k => nodesLeftSet.add(`KRw:${k.id}`))
        const nodesLeft = Array.from(nodesLeftSet).map(name => ({ name }))

        const krsByGoal = new Map()
        krs.forEach(k => {
          const gid = krGoalMap.get(k.id) || ''
          if (!gid) return
          const arr = krsByGoal.get(gid) || []
          arr.push(k)
          krsByGoal.set(gid, arr)
        })
        const linksLeft = []
        goals.forEach(g => {
          const gid = g.id
          const group = krsByGoal.get(gid) || []
          if (group.length === 0) return
          const sumKw = group.reduce((s, k) => s + (krWeight.get(k.id) || 0), 0)
          const gW = goalWeight.get(gid) || 1
          group.forEach(k => {
            const kW = krWeight.get(k.id) || 0
            const share = sumKw > 0 ? (kW / sumKw) : (1 / group.length)
            const value = gW * share
            linksLeft.push({ source: `G:${gid}`, target: `KRw:${k.id}`, value })
          })
        })

        // 右系列：KRs→Activities（分钟）
        const nodesRightSet = new Set()
        krs.forEach(k => nodesRightSet.add(`KRm:${k.id}`))
        const activityValueMap = new Map()
        entries.forEach(e => {
          const aKey = `A:${e.name || 'Unnamed Activity'}`
          const v = Number(e.effMinutes || e.minutes || 0)
          activityValueMap.set(aKey, (activityValueMap.get(aKey) || 0) + v)
          nodesRightSet.add(aKey)
        })
        const nodesRight = Array.from(nodesRightSet).map(name => ({ name }))

        const kraMap = new Map()
        entries.forEach(e => {
          const kid = e.krId || ''
          const aName = e.name || 'Unnamed Activity'
          if (!kid) return
          const key = `${kid}|${aName}`
          const v = Number(e.effMinutes || e.minutes || 0)
          kraMap.set(key, (kraMap.get(key) || 0) + v)
        })
        const linksRight = Array.from(kraMap.entries()).map(([key, value]) => {
          const [kid, aName] = key.split('|')
          return { source: `KRm:${kid}`, target: `A:${aName}`, value }
        })

        const formatLabel = (name) => {
          if (name.startsWith('G:')) {
            const id = name.slice(2)
            return goalTitles.get(id) || id
          }
          if (name.startsWith('KRw:') || name.startsWith('KRm:')) {
            const id = name.slice(4)
            return krTitles.get(id) || id
          }
          if (name.startsWith('A:')) return name.slice(2)
          return name
        }

        renderOptionDual(
          { data: nodesLeft, links: linksLeft },
          { data: nodesRight, links: linksRight },
          formatLabel
        )
      } catch (err) {
        console.error('Sankey fetch/render error', err)
        renderSample()
      }
    }

    fetchData()
    window.addEventListener('resize', chart.resize)
    return () => {
      window.removeEventListener('resize', chart.resize)
      chart.dispose()
    }
  }, [])

  return (
    <div className="w-full" style={{ height: 380 }}>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}