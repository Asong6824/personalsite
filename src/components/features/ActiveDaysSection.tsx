"use client";

import React from "react";
import CircadianChart from "./CircadianChart";
// import SankeyChart from "./SankeyChart";

function CodingActivityPeriods() {
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState("day");
  const [hourly, setHourly] = React.useState([]);

  React.useEffect(() => {
    setMounted(true);
    const genDay = () => {
      return Array.from({ length: 24 }, (_, h) => {
        const daylightBoost = h >= 9 && h <= 18 ? 0.4 : 0.0;
        const baseline = 20 + 40 * daylightBoost;
        const wave = 25 * Math.sin((h - 6) * Math.PI / 12);
        const nightPenalty = (h >= 22 || h <= 5) ? -15 : 0;
        const v = Math.max(0, Math.round(baseline + wave + nightPenalty));
        return v;
      });
    };
    const genWeek = () => {
      const acc = Array(24).fill(0);
      for (let d = 0; d < 7; d++) {
        const day = genDay().map((v, h) => v + Math.round(6 * Math.sin((h + d) * Math.PI / 8)));
        for (let h = 0; h < 24; h++) acc[h] += day[h];
      }
      return acc.map(v => Math.round(v / 7));
    };
    setHourly(mode === "day" ? genDay() : genWeek());
  }, [mode]);

  return (
    <div className="rounded-xl border bg-background text-foreground p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base md:text-lg font-medium">Coding Activity Periods</h3>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <g clipPath="url(#clip0)">
              <path d="M7 .58C10.54.58 13.42 3.46 13.42 7s-2.88 6.42-6.42 6.42S.58 10.54.58 7 .58 3.46 7 .58Z" fill="white" fillOpacity="0.25" />
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="14" height="14" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-2 py-1 text-xs rounded border ${mode === 'day' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-neutral-700 text-neutral-300'}`}
            onClick={() => setMode('day')}
          >日</button>
          <button
            className={`px-2 py-1 text-xs rounded border ${mode === 'week' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-neutral-700 text-neutral-300'}`}
            onClick={() => setMode('week')}
          >周</button>
        </div>
      </div>

      {!mounted ? (
        <div className="h-64 w-full bg-[var(--secondary)] rounded animate-pulse" />
      ) : (
        <CircadianChart hourly={hourly} height={272} />
      )}
    </div>
  );
}


const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildWeeks({ totalCells = 364 }) {
  const today = new Date();
  // 原始范围起点：确保最后一个有效日期是今天
  const startRange = new Date(today);
  startRange.setDate(today.getDate() - totalCells + 1);
  // 将范围起点对齐到该周的周日，以保证列按自然周对齐
  const firstWeekStart = new Date(startRange);
  firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay()); // 周日=0
  // 计算从对齐起点到今天的天数
  const diffDays = Math.floor((new Date(today.toDateString()).getTime() - new Date(firstWeekStart.toDateString()).getTime()) / (24 * 3600 * 1000)) + 1;
  const cols = Math.ceil(diffDays / 7);
  const result = Array.from({ length: cols }, () => Array(7).fill(null));
  // 填充每一天到正确的列和星期行
  for (let offset = 0; offset < cols * 7; offset++) {
    const d = new Date(firstWeekStart);
    d.setDate(firstWeekStart.getDate() + offset);
    // 超过今天或早于真实起点的天不填充
    if (d < startRange || d > today) continue;
    const colIdx = Math.floor(offset / 7);
    const rowIdx = d.getDay(); // 0=周日, 6=周六
    result[colIdx][rowIdx] = d;
  }
  return result; // 每列固定7行，按周日到周六对齐；空位为 null
}

function buildMonthLabels(weeks) {
  const cols = weeks.length;
  const meta = weeks.map((col) => {
    let months = new Set();
    let count = 0;
    let leadingMonth = null;
    for (let i = 0; i < col.length; i++) {
      const d = col[i];
      if (!d) continue;
      if (leadingMonth === null) leadingMonth = d.getMonth();
      months.add(d.getMonth());
      count++;
    }
    const isFull = count === 7 && months.size === 1;
    const fullMonth = isFull ? [...months][0] : null;
    return { months, count, isFull, fullMonth, leadingMonth };
  });

  const findFirstFullMonthCol = (startIdx, month) => {
    for (let i = startIdx; i < cols; i++) {
      const m = meta[i];
      if (m.isFull && m.fullMonth === month) return i;
    }
    return -1;
  };
  const findFirstConsistentMonthCol = (startIdx, month) => {
    for (let i = startIdx; i < cols; i++) {
      const m = meta[i];
      if (m.count > 0 && m.months.size === 1 && [...m.months][0] === month) return i;
    }
    return -1;
  };

  const labels = [];
  let currentMonth = null;
  for (let colIdx = 0; colIdx < cols; colIdx++) {
    const lead = meta[colIdx].leadingMonth;
    if (lead === null || lead === undefined) continue; // 此列没有有效日期
    if (currentMonth === null || lead !== currentMonth) {
      currentMonth = lead;
      let anchor = findFirstFullMonthCol(colIdx, currentMonth);
      if (anchor === -1) {
        anchor = findFirstConsistentMonthCol(colIdx, currentMonth);
      }
      if (anchor === -1) anchor = colIdx; // 兜底：使用当前列
      labels.push({ label: MONTH_NAMES[currentMonth], col: anchor });
    }
  }
  return labels; // 数组：{ label, col }
}

function colorForCount(c) {
  if (c <= 0) return "#EDEFF2"; // no data
  if (c <= 1) return "#e7f5ff";
  if (c <= 2) return "#a5d8ff";
  if (c <= 3) return "#4dabf7";
  if (c <= 4) return "#228be6";
  return "#1971c2"; // 5+
}

function generateSampleData(weeks) {
  const map = new Map();
  let total = 0;
  weeks.flat().forEach((date, i) => {
    if (!date) return; // 跳过空位，避免 null.toISOString()
    const key = date.toISOString().slice(0, 10);
    const count = Math.max(0, Math.round((Math.sin(i / 4) + 1) * 2 + (Math.random() * 2 - 1)));
    total += count;
    map.set(key, count);
  });
  return { map, total };
}

export default function ActiveDaysSection() {
  const [mounted, setMounted] = React.useState(false);
  const [weeks, setWeeks] = React.useState([]);
  const [monthLabels, setMonthLabels] = React.useState([]);
  const [dataMap, setDataMap] = React.useState(new Map());
  const [total, setTotal] = React.useState(0);
  const TARGET_DAYS = 365;
  const TOTAL_CELLS = Math.round(TARGET_DAYS / 7) * 7; // 364
  const columnsCount = Math.ceil(TOTAL_CELLS / 7);
  const lastColumnCount = TOTAL_CELLS - (columnsCount - 1) * 7;
  const COL_W = 17; // grid column width (px)
  const COL_W_MIN = 15; // responsive min width per column
  const COL_W_MAX = 24; // responsive max width per column
  const COL_GAP = 2; // grid column gap (px)
  const MIN_LABEL_SPACING = 24; // minimum px distance between month labels
  const MONTH_HEADER_HEIGHT = 20; // px
  const MONTH_HEADER_SPACING = 4; // px
  const MONTH_LABEL_EDGE_PAD = 12; // left padding to avoid first label clipping

  const [colWidth, setColWidth] = React.useState(COL_W);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    setMounted(true);
    const w = buildWeeks({ totalCells: TOTAL_CELLS });
    setWeeks(w);
    setMonthLabels(buildMonthLabels(w));
    const sample = generateSampleData(w);
    setDataMap(sample.map);
    setTotal(sample.total);
  }, [TOTAL_CELLS]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth; // visible width of scroll container
      const currentColumns = weeks.length || columnsCount; // 使用实际列数
      const totalGaps = (currentColumns - 1) * COL_GAP;
      const desired = Math.floor((available - totalGaps) / currentColumns);
      const clamped = Math.max(COL_W_MIN, Math.min(COL_W_MAX, desired));
      setColWidth(clamped);
    };
    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [columnsCount, weeks]);
 
  const gridWidthPx = (weeks.length || columnsCount) * (colWidth + COL_GAP) - COL_GAP;
 
  return (
    <section id="active-days" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold">Active Days</h2>
              <div className="flex items-center gap-1" aria-label="强度示例">
                {['#e7f5ff','#a5d8ff','#4dabf7','#228be6','#1971c2'].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-[2px] border border-gray-200" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Month labels header moved into the scroll container for precise alignment */}
            <div className="relative h-0 mb-0" />

            {/* Week grid */}
        <div className="relative pb-2 flex">
          {/* Left labels column (does not occupy grid cell columns) */}
          <div className="mr-2" style={{ marginTop: MONTH_HEADER_HEIGHT + MONTH_HEADER_SPACING }}>
             <div className="flex flex-col" style={{ gap: COL_GAP }}>
               {Array.from({ length: 7 }).map((_, idx) => (
                 <div
                   key={idx}
                   className="text-[10px] text-muted-foreground text-center font-mono"
                   style={{ width: colWidth, height: colWidth, lineHeight: `${colWidth}px` }}
                 >
                   {idx === 1 ? 'M' : idx === 3 ? 'W' : idx === 5 ? 'F' : ''}
                 </div>
               ))}
             </div>
           </div>

          {/* Scrollable cells grid + month labels overlay */}
          <div className="relative overflow-x-auto w-full" ref={scrollRef}>
            <div className="relative" style={{ width: gridWidthPx, margin: '0 auto' }}>
              {/* Month labels overlay aligned to grid columns */}
              <div className="relative" style={{ height: MONTH_HEADER_HEIGHT, marginBottom: MONTH_HEADER_SPACING, width: '100%' }}>
                 {mounted && monthLabels.length > 0 && (() => {
                   const positions = monthLabels.map(m => m.col * (colWidth + COL_GAP) + colWidth / 2);
                   return positions.map((left, i) => (
                     <span
                       key={monthLabels[i].label + i}
                       className="absolute top-0 text-xs text-muted-foreground"
                       style={{ left: Math.max(colWidth / 2, Math.min(gridWidthPx - colWidth / 2, left)), transform: 'translateX(-50%)' }}
                     >
                       {monthLabels[i].label}
                     </span>
                   ));
                 })()}
               </div>

              {/* Cells grid */}
              <div className="grid grid-rows-7 grid-flow-col" style={{ gridTemplateColumns: `repeat(${weeks.length || columnsCount}, ${colWidth}px)`, columnGap: COL_GAP, rowGap: COL_GAP }}>
                {weeks.length > 0 ? (
                  weeks.map((week, wIdx) => (
                    <React.Fragment key={wIdx}>
                      {week.map((date, rIdx) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${wIdx}-${rIdx}`}
                              style={{ width: colWidth, height: colWidth, visibility: 'hidden' }}
                            />
                          );
                        }
                        const key = date.toISOString().slice(0, 10);
                        const count = dataMap.get(key) || 0;
                        const bg = colorForCount(count);
                        return (
                          <div
                            key={key}
                            className="rounded-[2px] border border-gray-200 hover:border-indigo-500/70 hover:ring-1 hover:ring-indigo-300/50 transition-transform hover:scale-105"
                            style={{ backgroundColor: bg, width: colWidth, height: colWidth }}
                            title={`${key}: ${count}`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  Array.from({ length: columnsCount }).map((_, cIdx) => (
                    <React.Fragment key={`s-${cIdx}`}>
                      {Array.from({ length: cIdx === columnsCount - 1 ? lastColumnCount : 7 }).map((_, rIdx) => (
                        <div
                          key={`s-${cIdx}-${rIdx}`}
                          className="rounded-[2px] border border-gray-200 bg-[#EDEFF2]"
                          style={{ width: colWidth, height: colWidth }}
                          title="loading"
                        />
                      ))}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
          </div>

          {/* Sankey chart under the calendar heatmap (暂时注释掉 OKR 展示) */}
          {/* <SankeyChart height={360} /> */}

          {/* Day/Night circadian chart below OKR progress */}
          <CodingActivityPeriods />
        </div>
      </div>
    </section>
  );
}
