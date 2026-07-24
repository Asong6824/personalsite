"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart, CandlestickChart, LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { CandlestickChart as CandlestickIcon, LineChart as LineChartIcon, TrendingDown } from "lucide-react";

import {
  calculateDrawdownSeries,
  normalizeToBase100,
} from "@/lib/finance/market-study-metrics";
import type { MarketStudyArtifact } from "@/lib/finance/market-study-schema";

echarts.use([
  LineChart,
  BarChart,
  CandlestickChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

type ChartMode = "normalized" | "price" | "drawdown" | "candlestick";

interface StockStageChartProps {
  study: MarketStudyArtifact;
  compact?: boolean;
}

const MODES: { id: ChartMode; label: string; icon: typeof LineChartIcon }[] = [
  { id: "normalized", label: "相对表现", icon: LineChartIcon },
  { id: "price", label: "价格", icon: LineChartIcon },
  { id: "drawdown", label: "回撤", icon: TrendingDown },
  { id: "candlestick", label: "K 线", icon: CandlestickIcon },
];

function formatDate(value: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function lineData(study: MarketStudyArtifact, mode: Exclude<ChartMode, "candlestick">) {
  return study.instruments.map((instrument) => {
    if (mode === "normalized") return normalizeToBase100(instrument.points);
    if (mode === "drawdown") return calculateDrawdownSeries(instrument.points);
    return instrument.points.map((point) => [point.timestamp, point.adjustedClose]);
  });
}

export default function StockStageChart({ study, compact = false }: StockStageChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ChartMode>("normalized");
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(study.instruments[0].id);
  const selectedInstrument =
    study.instruments.find(({ id }) => id === selectedInstrumentId) ?? study.instruments[0];

  const option = useMemo(() => {
    const textColor = "#4b504c";
    const gridColor = "rgba(71, 79, 73, 0.12)";
    const common = {
      animationDuration: 450,
      backgroundColor: "transparent",
      textStyle: { color: textColor, fontFamily: "var(--font-inter)" },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(22, 27, 24, 0.94)",
        borderWidth: 0,
        textStyle: { color: "#f7f5ef", fontSize: 12 },
        formatter: (params: any[]) => {
          if (!params?.length) return "";
          const date = formatDate(params[0].value[0]);
          const values = params
            .map((item) => {
              if (mode === "candlestick") {
                const [, open, close, low, high] = item.value;
                return `${item.marker}${item.seriesName}<br/>开 ${open.toFixed(2)} · 高 ${high.toFixed(2)} · 低 ${low.toFixed(2)} · 收 ${close.toFixed(2)}`;
              }
              const suffix = mode === "drawdown" ? "%" : mode === "normalized" ? "" : ` ${study.instruments[item.seriesIndex]?.currency ?? ""}`;
              return `${item.marker}${item.seriesName} ${Number(item.value[1]).toFixed(2)}${suffix}`;
            })
            .join("<br/>");
          return `${date}<br/>${values}`;
        },
      },
      dataZoom: [
        { type: "inside", filterMode: "none" },
        {
          type: "slider",
          height: 18,
          bottom: 2,
          borderColor: "transparent",
          backgroundColor: "rgba(71, 79, 73, 0.06)",
          fillerColor: "rgba(23, 107, 91, 0.14)",
          handleStyle: { color: "#176b5b", borderColor: "#176b5b" },
          textStyle: { color: textColor },
        },
      ],
    };

    if (mode === "candlestick") {
      const candleData = selectedInstrument.points.map((point) => [
        point.timestamp,
        point.open,
        point.close,
        point.low,
        point.high,
      ]);
      const volumeData = selectedInstrument.points.map((point) => [
        point.timestamp,
        point.volume ?? 0,
        point.close >= point.open ? 1 : -1,
      ]);
      return {
        ...common,
        grid: [
          { left: 56, right: 20, top: 22, height: "61%" },
          { left: 56, right: 20, top: "72%", height: "14%" },
        ],
        xAxis: [
          { type: "time", gridIndex: 0, axisLabel: { show: false }, axisLine: { lineStyle: { color: gridColor } }, splitLine: { show: false } },
          { type: "time", gridIndex: 1, axisLabel: { color: textColor, hideOverlap: true }, axisLine: { lineStyle: { color: gridColor } }, splitLine: { show: false } },
        ],
        yAxis: [
          { scale: true, gridIndex: 0, axisLabel: { color: textColor }, splitLine: { lineStyle: { color: gridColor } } },
          { scale: true, gridIndex: 1, axisLabel: { color: textColor, formatter: (value: number) => Intl.NumberFormat("zh-CN", { notation: "compact" }).format(value) }, splitLine: { show: false } },
        ],
        series: [
          {
            name: selectedInstrument.symbol,
            type: "candlestick",
            data: candleData,
            itemStyle: {
              color: "#b33a3a",
              color0: "#176b5b",
              borderColor: "#b33a3a",
              borderColor0: "#176b5b",
            },
          },
          {
            name: "成交量",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: volumeData,
            itemStyle: { color: (params: any) => params.value[2] > 0 ? "rgba(179,58,58,.45)" : "rgba(23,107,91,.45)" },
          },
        ],
      };
    }

    const data = lineData(study, mode);
    return {
      ...common,
      legend: {
        top: 0,
        right: 12,
        textStyle: { color: textColor },
        icon: "roundRect",
        formatter: (name: string) => name.split(" · ")[0],
      },
      grid: { left: 58, right: 22, top: 46, bottom: 54, containLabel: false },
      xAxis: {
        type: "time",
        axisLabel: { color: textColor, hideOverlap: true },
        axisLine: { lineStyle: { color: gridColor } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: mode === "price",
        name: mode === "normalized" ? "起点 = 100" : mode === "drawdown" ? "%" : "",
        nameTextStyle: { color: textColor, align: "left" },
        axisLabel: {
          color: textColor,
          formatter: (value: number) => mode === "drawdown" ? `${value.toFixed(0)}%` : value.toFixed(mode === "price" ? 0 : 1),
        },
        splitLine: { lineStyle: { color: gridColor } },
      },
      series: study.instruments.map((instrument, index) => ({
        name: `${instrument.symbol} · ${instrument.name}`,
        type: "line",
        data: data[index],
        showSymbol: false,
        sampling: "lttb",
        smooth: 0.08,
        lineStyle: { width: 2.5, color: instrument.color },
        itemStyle: { color: instrument.color },
        emphasis: { focus: "series" },
        markLine: index === 0 && study.events?.length ? {
          silent: true,
          symbol: "none",
          label: { color: textColor, fontSize: 10, formatter: "{b}" },
          lineStyle: { color: "rgba(75,80,76,.35)", type: "dashed" },
          data: study.events.map((event) => ({ name: event.title, xAxis: Date.parse(`${event.date}T00:00:00Z`) })),
        } : undefined,
      })),
    };
  }, [mode, selectedInstrument, study]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
    chart.setOption(option, { notMerge: true });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return (
    <div className="min-w-0" data-testid="market-study-chart">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full grid-cols-2 rounded-md border border-[#cfd2cc] bg-[#f3f2ed] p-1 sm:flex sm:w-auto" role="group" aria-label="图表视图">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded px-3 text-xs font-medium transition-colors"
              style={mode === id ? { backgroundColor: "#1d2923", color: "#fff" } : { color: "#59605b" }}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        {mode === "candlestick" && study.instruments.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-[#59605b]">
            标的
            <select
              value={selectedInstrument.id}
              onChange={(event) => setSelectedInstrumentId(event.target.value)}
              className="h-9 rounded border border-[#cfd2cc] bg-white px-3 text-[#1d2923]"
            >
              {study.instruments.map((instrument) => (
                <option key={instrument.id} value={instrument.id}>{instrument.symbol} · {instrument.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div
        ref={containerRef}
        role="img"
        aria-label={`${study.title}，当前为${MODES.find(({ id }) => id === mode)?.label}图`}
        className={compact ? "h-[340px] w-full sm:h-[410px]" : "h-[420px] w-full sm:h-[520px]"}
      />
      <p className="mt-2 text-[11px] leading-relaxed text-[#747a75]">
        {mode === "candlestick"
          ? "可拖动底部时间轴或双指缩放。红色表示上涨、绿色表示下跌；涨跌同时通过位置和数值区分。"
          : "可拖动底部时间轴或双指缩放，悬停或轻触查看各标的在同一日期的数值。"}
      </p>
    </div>
  );
}
