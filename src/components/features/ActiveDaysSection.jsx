"use client";

import React from "react";
import CircadianChart from "./CircadianChart";

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
  const start = new Date(today);
  // Ensure the last cell represents today
  start.setDate(today.getDate() - totalCells + 1);
  const cols = Math.ceil(totalCells / 7);
  const result = [];
  for (let c = 0; c < cols; c++) {
    const col = [];
    const base = c * 7;
    const cellsInCol = Math.min(7, totalCells - base);
    for (let r = 0; r < cellsInCol; r++) {
      const date = new Date(start);
      date.setDate(start.getDate() + base + r);
      col.push(date);
    }
    result.push(col);
  }
  return result; // columns of up to 7 days, last cell = today
}

function buildMonthLabels(weeks) {
  const segments = [];
  let current = null;
  weeks.forEach((col, colIdx) => {
    col.forEach((date) => {
      const m = date.getMonth();
      if (!current || current.month !== m) {
        if (current) segments.push(current);
        current = { month: m, startCol: colIdx, endCol: colIdx };
      } else {
        current.endCol = colIdx;
      }
    });
  });
  if (current) segments.push(current);
  return segments.map(seg => ({
    label: MONTH_NAMES[seg.month],
    startCol: seg.startCol,
    endCol: seg.endCol,
  })); // months with column ranges
}

function colorForCount(c) {
  if (c <= 0) return "#EDEFF2";
  if (c <= 2) return "#C9D1F5";
  if (c <= 4) return "#AEBBF2";
  if (c <= 7) return "#8FA4EE";
  return "#6A86E8";
}

function generateSampleData(weeks) {
  const map = new Map();
  let total = 0;
  weeks.flat().forEach((date, i) => {
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
    const { map, total } = generateSampleData(w);
    setDataMap(map);
    setTotal(total);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth; // visible width of scroll container
      const totalGaps = (columnsCount - 1) * COL_GAP;
      const desired = Math.floor((available - totalGaps) / columnsCount);
      const clamped = Math.max(COL_W_MIN, Math.min(COL_W_MAX, desired));
      setColWidth(clamped);
    };
    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [columnsCount]);
 
  const gridWidthPx = columnsCount * (colWidth + COL_GAP) - COL_GAP;
 
  return (
    <section id="active-days" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold">Active Days</h2>
              <div className="w-48 h-2 rounded bg-indigo-200/25 relative">
                <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.min(100, Math.round((total / 300) * 100))}%`, backgroundColor: "rgba(194,202,242,0.85)" }} />
                <span className="absolute -top-6 right-0 text-sm text-muted-foreground">{total}</span>
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
                 <div key={idx} className="flex items-center text-[10px] text-muted-foreground" style={{ height: colWidth }}>
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
                   const centers = monthLabels.map(m => Math.round((m.startCol + m.endCol) / 2));
                   const positions = centers.map(c => c * (colWidth + COL_GAP) + colWidth / 2);
                   for (let i = 1; i < positions.length; i++) {
                     const delta = positions[i] - positions[i - 1];
                     if (delta < MIN_LABEL_SPACING) positions[i] = positions[i - 1] + MIN_LABEL_SPACING;
                   }
                   return positions.map((left, i) => (
                     <span
                       key={monthLabels[i].label + i}
                       className="absolute top-0 text-xs text-muted-foreground"
                       style={{ left: Math.max(colWidth / 2, left), transform: 'translateX(-50%)' }}
                     >
                       {monthLabels[i].label}
                     </span>
                   ));
                 })()}
               </div>

              {/* Cells grid */}
              <div className="grid grid-rows-7 grid-flow-col" style={{ gridTemplateColumns: `repeat(${columnsCount}, ${colWidth}px)`, columnGap: COL_GAP, rowGap: COL_GAP }}>
                {weeks.length > 0 ? (
                  weeks.map((week, wIdx) => (
                    <React.Fragment key={wIdx}>
                      {week.map((date, rIdx) => {
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

          <CodingActivityPeriods />
        </div>
      </div>
    </section>
  );
}