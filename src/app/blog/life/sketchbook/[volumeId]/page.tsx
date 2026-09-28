import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LifeSketchbookExperience } from "@/components/features/LifeSketchbook/LifeSketchbookExperience";
import {
  getTravelSketchbookVolume,
  travelSketchbookVolumes,
} from "@/data/travel-sketchbook";

interface TravelSketchbookVolumePageProps {
  params: Promise<{ volumeId: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return travelSketchbookVolumes.map((volume) => ({ volumeId: volume.id }));
}

export async function generateMetadata({
  params,
}: TravelSketchbookVolumePageProps): Promise<Metadata> {
  const { volumeId } = await params;
  const volume = getTravelSketchbookVolume(volumeId);
  if (!volume) return {};

  return {
    title: `${volume.title} | 生活频道 | 大盈若冲`,
    description: volume.description,
  };
}

export default async function TravelSketchbookVolumePage({
  params,
}: TravelSketchbookVolumePageProps) {
  const { volumeId } = await params;
  const volume = getTravelSketchbookVolume(volumeId);
  if (!volume) notFound();

  return (
    <Suspense fallback={null}>
      <LifeSketchbookExperience volumeId={volume.id} />
    </Suspense>
  );
}
