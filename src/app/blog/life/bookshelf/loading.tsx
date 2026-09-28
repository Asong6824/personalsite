import { RouteLoadingSkeleton } from "@/components/layout/RouteLoadingSkeleton";

export default function LifeBookshelfLoading() {
  return (
    <main className="min-h-screen bg-site-zinc-900">
      <div className="h-20 bg-site-canvas" aria-hidden="true" />
      <RouteLoadingSkeleton variant="canvas" />
    </main>
  );
}
