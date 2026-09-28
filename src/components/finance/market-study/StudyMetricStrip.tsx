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
    <div className="grid grid-cols-1 border-y border-site-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
      {study.instruments.map((instrument) => (
        <div key={instrument.id} className="border-b border-site-neutral-300 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: instrument.color }} aria-hidden="true" />
            <p className="text-xs font-semibold tracking-wide text-site-emerald-900">{instrument.symbol}</p>
            <span className="truncate text-xs text-site-neutral-500">{instrument.name}</span>
          </div>
          <p className="font-mono text-2xl font-semibold text-site-emerald-950">{percent(instrument.metrics.totalReturn)}</p>
          <div className="mt-3 flex gap-4 text-[11px] text-site-neutral-500">
            <span>最大回撤 {percent(instrument.metrics.maxDrawdown)}</span>
            <span>{instrument.metrics.tradingDays} 个交易日</span>
          </div>
        </div>
      ))}
    </div>
  );
}
