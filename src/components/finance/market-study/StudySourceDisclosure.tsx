import { ExternalLink } from "lucide-react";

import type { MarketStudyArtifact } from "@/lib/finance/market-study-schema";

const ADJUSTMENT_LABELS = {
  raw: "未复权",
  split: "拆股复权",
  "total-return": "总回报复权",
};

export default function StudySourceDisclosure({ study }: { study: MarketStudyArtifact }) {
  return (
    <footer className="grid gap-6 border-t border-[#d8dad5] pt-6 text-xs leading-6 text-[#626964] md:grid-cols-[1fr_auto]">
      <div>
        <p className="font-semibold text-[#303832]">数据与口径</p>
        <p>
          {study.source.title} · {study.source.provider} · {ADJUSTMENT_LABELS[study.adjustment]} · 时区 {study.timezone} · 获取于 {study.source.retrievedAt}
        </p>
        {study.source.license && <p>许可：{study.source.license}</p>}
        {study.source.notes && <p>{study.source.notes}</p>}
      </div>
      {study.source.url && (
        <a href={study.source.url} target="_blank" rel="noreferrer" className="inline-flex h-fit items-center gap-1 font-medium text-[#176b5b] hover:underline">
          查看数据来源 <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
      <p className="md:col-span-2 text-[#7b5651]">{study.disclaimer}</p>
    </footer>
  );
}
