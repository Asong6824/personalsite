import type { Metadata } from "next";
import { Suspense } from "react";

import { LifeBookshelfExperience } from "@/components/features/LifeBookshelf/LifeBookshelfExperience";

export const metadata: Metadata = {
  title: "可翻阅的书房 | 生活频道 | 大盈若冲",
  description: "一座可以选择、打开并逐页翻阅的交互式 3D 书房。",
};

export default function LifeBookshelfPage() {
  return (
    <main className="min-h-screen bg-site-zinc-900 text-site-stone-50" data-life-bookshelf-page>
      <div className="h-20 bg-site-canvas" aria-hidden="true" />
      <Suspense fallback={null}>
        <LifeBookshelfExperience />
      </Suspense>
    </main>
  );
}
