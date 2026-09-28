export default function LifeSketchbookLoading() {
  return (
    <main className="fixed inset-0 z-[60] grid place-items-center bg-site-stone-100 text-site-stone-800">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <span className="size-10 animate-spin rounded-full border border-site-stone-800/15 border-t-site-amber-600 motion-reduce:animate-none" aria-hidden="true" />
        <span className="font-serif text-sm italic tracking-[0.08em] text-site-stone-800/60">
          正在展开旅行手绘本
        </span>
      </div>
    </main>
  );
}
