import type { Metadata } from "next";
import { Suspense } from "react";

import { LifeSketchbookExperience } from "@/components/features/LifeSketchbook/LifeSketchbookExperience";

export const metadata: Metadata = {
  title: "旅行手绘本 | 生活频道 | 大盈若冲",
  description: "一册可以拖拽翻页、倾斜、缩放并连接旅行故事的交互手绘本。",
};

export default function LifeSketchbookPage() {
  return (
    <Suspense fallback={null}>
      <LifeSketchbookExperience />
    </Suspense>
  );
}
