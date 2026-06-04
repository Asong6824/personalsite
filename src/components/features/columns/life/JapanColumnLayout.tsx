"use client";
import Image from "next/image";
import InlineSvgWithHover from "@/components/features/InlineSvgWithHover";
import Link from "next/link";
import { PREF_MAP } from "@/lib/japan-prefectures";
import { useState } from "react";

export default function JapanColumnLayout({ channelKey, channelConfig, columnKey, columnConfig, posts }) {
  const [selectedPref, setSelectedPref] = useState(null)
  return (
    <div className="min-h-screen theme-muji overflow-x-hidden" style={{ backgroundColor: "var(--muji-bg)" }} data-life-page>
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto px-4 pt-24 lg:pt-32 xl:pt-36 2xl:pt-40 pb-16">
        

        <div className="grid grid-cols-12 gap-8 lg:gap-10 xl:gap-12 2xl:gap-16 items-center">
          <div className="col-span-6 xl:col-span-7 lg:sticky lg:top-40 xl:top-44 2xl:top-48 order-2">
            <div className="muji-card mt-10 lg:mt-20 xl:mt-20 2xl:mt-24" style={{ backgroundColor: "var(--muji-bg)", border: "none", boxShadow: "none" }}>
              <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[4/3] xl:aspect-[3/2] 2xl:aspect-[16/9]">
                <InlineSvgWithHover
                  src="/images/maps/japan.svg"
                  idToLabel={PREF_MAP}
                  hoverStyle={{ stroke: "var(--muji-wood)", strokeWidth: "2", filter: "brightness(1.05)" }}
                  onRegionClick={(id, label) => setSelectedPref(label || id)}
                  className="origin-center scale-[1.44] md:scale-[1.62] xl:scale-[1.8] translate-y-[8%] lg:translate-y-[16%] xl:translate-y-[14%] 2xl:translate-y-[16%]"
                  style={{ width: "100%", height: "100%" }}
                />
                {selectedPref && (
                  <div className="absolute left-3 bottom-3 px-3 py-1 text-sm" style={{ backgroundColor: "var(--muji-paper)", color: "var(--muji-wood)", border: "1px solid var(--muji-border)", borderRadius: 6 }}>
                    已选择：{selectedPref}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-6 xl:col-span-5 flex items-center justify-center order-1">
            <div
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                color: "var(--muji-wood)",
                fontFamily: "Yu Mincho, Hiragino Mincho ProN, Hiragino Mincho Pro, Hiragino Mincho, Noto Serif JP, Source Han Serif JP, serif",
                letterSpacing: "0.06em",
                fontWeight: 300,
                fontSize: "clamp(28px, 5vw, 56px)",
                lineHeight: 1.15
              }}
              className="grid auto-rows-max gap-y-6 lg:gap-y-8 xl:gap-y-10 2xl:gap-y-12 place-content-center"
            >
              <span className="inline-block whitespace-nowrap -translate-y-[10%] lg:-translate-y-[12%] xl:-translate-y-[12%] 2xl:-translate-y-[14%]" style={{ wordBreak: "keep-all" }}>風の音</span>
              <span className="inline-block whitespace-nowrap" style={{ wordBreak: "keep-all" }}>道にまかせて</span>
              <span className="inline-block whitespace-nowrap translate-y-[10%] lg:translate-y-[12%] xl:translate-y-[12%] 2xl:translate-y-[14%]" style={{ wordBreak: "keep-all" }}>日本みる</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--muji-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <div className="text-center mb-10 mt-36 lg:mt-48 xl:mt-56 2xl:mt-64">
            <h1 className="text-4xl font-light" style={{ color: "var(--muji-wood)", letterSpacing: "0.02em" }}>{columnConfig?.name || "日本旅行"}</h1>
            <p className="mt-4 text-lg font-light max-w-2xl mx-auto" style={{ color: "var(--muji-taupe)", letterSpacing: "0.01em" }}>{columnConfig?.description || "日本旅行记录与文化体验"}</p>
            <div className="mt-6">
              <Link
                href="/blog/life/japan/stamps"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-light transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: "var(--muji-paper)",
                  color: "var(--muji-wood)",
                  border: "1px solid var(--muji-border)",
                  borderRadius: 4,
                }}
              >
                <span>🚉</span>
                <span>駅スタンプ收藏</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 w-12 h-px mx-auto" style={{ backgroundColor: "var(--muji-accent)", opacity: 0.6 }}></div>
          </div>

          {Array.isArray(posts) && posts.length > 0 ? (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <div className="p-6 md:p-8 muji-card transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-light mb-3 line-clamp-2" style={{ color: "var(--muji-wood)" }}>{post.title}</h2>
                        {post.excerpt && (
                          <p className="font-light mb-4 line-clamp-3 leading-relaxed" style={{ color: "var(--muji-taupe)" }}>{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muji-taupe)" }}>
                          <span>{post.author || "阿松"}</span>
                          {post.date && <span>{post.date}</span>}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs" style={{ backgroundColor: "var(--muji-bg)", color: "var(--muji-wood)", border: "1px solid var(--muji-border)" }}>#{tag}</span>
                            ))}
                            {post.tags.length > 4 && (
                              <span className="px-2 py-1 text-xs" style={{ backgroundColor: "var(--muji-bg)", color: "var(--muji-taupe)", border: "1px solid var(--muji-border)" }}>+{post.tags.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <svg className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-light mb-2" style={{ color: "var(--muji-wood)" }}>暂无文章</h3>
              <p className="font-light mb-6" style={{ color: "var(--muji-taupe)" }}>该专栏下暂时还没有文章，敬请期待</p>
              <Link href={`/blog/${channelKey}`} className="inline-flex items-center gap-2 px-6 py-3" style={{ backgroundColor: "var(--muji-wood)", color: "var(--muji-paper)" }}>
                返回{channelConfig?.name || "生活"}频道
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
