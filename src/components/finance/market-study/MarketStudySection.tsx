import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { MarketStudyArtifact } from "@/lib/finance/market-study-schema";
import StockStageChart from "./StockStageChart";
import StudyMetricStrip from "./StudyMetricStrip";
import StudySourceDisclosure from "./StudySourceDisclosure";

interface MarketStudySectionProps {
  study: MarketStudyArtifact;
  compact?: boolean;
}

export default function MarketStudySection({ study, compact = false }: MarketStudySectionProps) {
  return (
    <section className={compact ? "max-w-7xl mx-auto px-6 mb-24 md:mb-32" : "mx-auto w-full max-w-7xl px-5 pb-24 pt-24 sm:px-8 md:pt-28"}>
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)] lg:items-end">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-site-emerald-700">
            Market stage study · {study.period.label}
          </p>
          <h2 className={compact ? "text-3xl font-bold leading-tight text-site-emerald-950 md:text-4xl" : "text-4xl font-bold leading-tight text-site-emerald-950 md:text-5xl"} style={{ fontFamily: "var(--font-noto-serif-sc)" }}>
            {study.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-site-neutral-600">{study.subtitle}</p>
        </div>
        <div className="lg:text-right">
          <p className="font-mono text-sm text-site-emerald-900">{study.period.start} → {study.period.end}</p>
          <p className="mt-2 text-xs text-site-neutral-500">版本 {study.version} · 截至 {study.source.retrievedAt}</p>
          {compact && (
            <Link href={`/blog/finance/market-studies/${study.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-site-emerald-700 hover:underline">
              打开完整研究 <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mb-8 max-w-4xl border-l-2 border-site-amber-500 pl-5 text-sm leading-7 text-site-neutral-600">
          <p>{study.summary}</p>
          {study.thesis && <p className="mt-2 font-semibold text-site-emerald-900">研究判断：{study.thesis}</p>}
        </div>
      )}

      <StudyMetricStrip study={study} />
      <div className="mt-8 min-w-0">
        <StockStageChart study={study} compact={compact} />
      </div>
      <div className="mt-8">
        <StudySourceDisclosure study={study} />
      </div>
    </section>
  );
}
