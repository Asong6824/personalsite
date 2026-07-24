import { getMarketStudy } from "@/lib/finance/market-study-loader";
import MarketStudySection from "@/components/finance/market-study/MarketStudySection";

export async function MarketStudy({ studyId }: { studyId: string }) {
  const study = await getMarketStudy(studyId);
  if (!study) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <p className="my-8 border-l-2 border-amber-600 pl-4 text-sm text-amber-800">
          MarketStudy: 未找到已发布研究 “{studyId}”。先运行 npm run finance:build。
        </p>
      );
    }
    return null;
  }
  return <MarketStudySection study={study} compact />;
}
