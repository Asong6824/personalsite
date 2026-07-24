import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MarketStudySection from "@/components/finance/market-study/MarketStudySection";
import { getMarketStudy, getMarketStudyCatalog } from "@/lib/finance/market-study-loader";
import { SITE_WARM_BACKGROUND } from "@/lib/site-theme";

export const dynamicParams = false;

export async function generateStaticParams() {
  const catalog = await getMarketStudyCatalog();
  return catalog.studies.map(({ id }) => ({ studyId: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ studyId: string }> }): Promise<Metadata> {
  const { studyId } = await params;
  const study = await getMarketStudy(studyId);
  if (!study) return {};
  return {
    title: `${study.title} | 市场阶段研究`,
    description: study.summary,
  };
}

export default async function MarketStudyPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params;
  const study = await getMarketStudy(studyId);
  if (!study) notFound();
  return (
    <main className="min-h-screen" style={{ backgroundColor: SITE_WARM_BACKGROUND }}>
      <MarketStudySection study={study} />
    </main>
  );
}
