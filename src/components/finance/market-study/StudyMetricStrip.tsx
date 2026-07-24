import type { MarketStudyArtifact } from "@/lib/finance/market-study-schema";

function percent(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("zh-CN", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

export default function StudyMetricStrip({ study }: { study: MarketStudyArtifact }) {
  return (
    <div className="grid grid-cols-1 border-y border-[#d8dad5] sm:grid-cols-2 lg:grid-cols-4">
      {study.instruments.map((instrument) => (
        <div key={instrument.id} className="border-b border-[#d8dad5] px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: instrument.color }} aria-hidden="true" />
            <p className="text-xs font-semibold tracking-wide text-[#3d453f]">{instrument.symbol}</p>
            <span className="truncate text-xs text-[#777d78]">{instrument.name}</span>
          </div>
          <p className="font-mono text-2xl font-semibold text-[#17231d]">{percent(instrument.metrics.totalReturn)}</p>
          <div className="mt-3 flex gap-4 text-[11px] text-[#6c736e]">
            <span>最大回撤 {percent(instrument.metrics.maxDrawdown)}</span>
            <span>{instrument.metrics.tradingDays} 个交易日</span>
          </div>
        </div>
      ))}
    </div>
  );
}
