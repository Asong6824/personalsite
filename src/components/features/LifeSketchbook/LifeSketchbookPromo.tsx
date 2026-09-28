import Image from "next/image";
import Link from "next/link";

export function LifeSketchbookPromo() {
  return (
    <section
      className="relative isolate overflow-hidden bg-site-stone-100 px-5 py-20 text-site-stone-800 md:px-10 md:py-28"
      aria-labelledby="life-sketchbook-heading"
    >
      <Image
        src="/life/sketchbook/meng-to-sketchbook/bg-wash.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover opacity-80"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-site-stone-100/25 via-site-stone-100/50 to-site-stone-100" aria-hidden="true" />
      <Image
        src="/life/sketchbook/meng-to-sketchbook/botany-left.png"
        alt=""
        width={250}
        height={420}
        className="pointer-events-none absolute -bottom-16 -left-14 w-40 opacity-35 md:w-60"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.82fr_1.35fr] lg:gap-8">
        <div className="relative z-10 max-w-lg">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-site-stone-800/55">
            Interactive travel sketchbook
          </p>
          <h2
            id="life-sketchbook-heading"
            className="mt-4 font-serif text-4xl font-normal leading-[0.98] tracking-[-0.03em] text-site-stone-800 md:text-6xl"
          >
            一册会呼吸的
            <br />
            旅行手绘本
          </h2>
          <p className="mt-6 max-w-md font-serif text-base leading-7 text-site-stone-800/65 md:text-lg">
            拖住纸页，让它沿真实曲面弯折；移动放大镜，在墨线、水彩与自己的旅行记忆之间慢慢观看。
          </p>
          <Link
            href="/blog/life/sketchbook/singapore"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-site-stone-800 px-6 text-sm tracking-[0.04em] text-site-stone-100 shadow-[0_14px_40px_rgba(43,39,33,0.2)] transition hover:-translate-y-0.5 hover:bg-site-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-amber-600"
          >
            展开手绘本 →
          </Link>
        </div>

        <div className="relative aspect-[1.55/1] min-w-0">
          <div className="absolute inset-[12%_5%_4%] rounded-[50%] bg-site-stone-600/15 blur-3xl" aria-hidden="true" />
          <Image
            src="/life/sketchbook/meng-to-sketchbook/marina-bay-skyline.png"
            alt="摊开的水彩旅行手绘本"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain drop-shadow-[0_28px_30px_rgba(55,47,37,0.24)]"
          />
        </div>
      </div>
    </section>
  );
}
