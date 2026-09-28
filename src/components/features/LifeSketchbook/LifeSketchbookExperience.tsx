"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { startRouteTransition } from "@/lib/route-transition";
import { bookshelfBooks } from "@/data/bookshelf-books";
import {
  defaultTravelSketchbookVolume,
  getTravelSketchbookVolume,
} from "@/data/travel-sketchbook";

import { TravelSketchbook } from "./TravelSketchbook";
import type { TravelSketchbookPage } from "./types";

interface LifeSketchbookExperienceProps {
  volumeId?: string;
}

export function LifeSketchbookExperience({
  volumeId,
}: LifeSketchbookExperienceProps) {
  const volume = volumeId
    ? getTravelSketchbookVolume(volumeId) ?? defaultTravelSketchbookVolume
    : defaultTravelSketchbookVolume;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSpread = searchParams.get("spread") ?? volume.defaultPageId;
  const sourceBookId = searchParams.get("fromBook");
  const sourceBook = bookshelfBooks.find(
    (book) => book.id === sourceBookId
      && book.open.type === "sketchbook"
      && book.open.sketchbookId === volume.id,
  );

  const handlePageChange = useCallback((page: TravelSketchbookPage) => {
    if (searchParams.get("spread") === page.id) return;
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("spread", page.id);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handlePageOpen = useCallback((page: TravelSketchbookPage) => {
    if (!page.href?.startsWith("/blog/")) return;
    startRouteTransition(page.href);
    router.push(page.href);
  }, [router]);

  return (
    <TravelSketchbook
      pages={volume.pages}
      copy={volume.copy}
      initialPageId={requestedSpread}
      backHref={sourceBook ? `/blog/life/bookshelf?book=${encodeURIComponent(sourceBook.id)}` : undefined}
      backLabel={sourceBook ? "返回书架" : undefined}
      onPageChange={handlePageChange}
      onPageOpen={handlePageOpen}
    />
  );
}
