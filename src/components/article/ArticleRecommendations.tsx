import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ArrowUpRight, BookOpen } from "lucide-react";

import type { ArticleRecommendation } from "@/lib/article/recommendations";
import { CHANNELS_CONFIG } from "@/lib/channels";
import { cn } from "@/lib/utils";

interface ArticleRecommendationsProps {
  recommendations: ArticleRecommendation[];
  className?: string;
}

function formatArticleDate(date?: string) {
  if (!date) return null;

  try {
    return format(parseISO(date), "yyyy年MM月dd日", { locale: zhCN });
  } catch {
    return date;
  }
}

function getArticleScopeLabel(recommendation: ArticleRecommendation) {
  const channel = recommendation.channel
    ? CHANNELS_CONFIG[recommendation.channel as keyof typeof CHANNELS_CONFIG]
    : null;
  const column = channel && recommendation.column
    ? channel.columns[recommendation.column]
    : null;

  if (channel && column) return `${channel.name} / ${column.name}`;
  if (channel) return channel.name;
  return "文章";
}

export function ArticleRecommendations({
  recommendations,
  className,
}: ArticleRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <section
      className={cn(
        "not-prose mt-16 border-t border-[var(--channel-border,#D8D0C3)] pt-10",
        className
      )}
      aria-labelledby="article-recommendations-title"
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--channel-muted,#68645d)]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Next Reads
          </p>
          <h2
            id="article-recommendations-title"
            className="text-2xl font-semibold tracking-normal text-[var(--channel-ink,#141413)]"
          >
            接下来阅读
          </h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((recommendation) => {
          const formattedDate = formatArticleDate(recommendation.date);

          return (
            <Link
              key={recommendation.slug}
              href={`/blog/${recommendation.slug}`}
              className="group grid min-h-44 overflow-hidden rounded-lg border border-[var(--channel-border,#D8D0C3)] bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_48%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_68%,transparent)] md:grid-cols-[9rem_1fr]"
            >
              {recommendation.coverImage ? (
                <div className="relative min-h-36 border-b border-[var(--channel-border,#D8D0C3)] bg-[#E2DBCE] md:border-b-0 md:border-r">
                  <Image
                    src={recommendation.coverImage}
                    alt={`${recommendation.title} 封面图`}
                    fill
                    className="object-cover grayscale-[12%] transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 144px"
                  />
                </div>
              ) : (
                <div className="flex min-h-28 items-center justify-center border-b border-[var(--channel-border,#D8D0C3)] bg-[#E2DBCE] text-[var(--channel-muted,#68645d)] md:min-h-0 md:border-b-0 md:border-r">
                  <BookOpen className="h-7 w-7" aria-hidden="true" />
                </div>
              )}

              <div className="flex min-w-0 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-xs font-medium text-[var(--channel-muted,#68645d)]">
                    {getArticleScopeLabel(recommendation)}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                  </p>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[var(--channel-muted,#68645d)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-normal text-[var(--channel-ink,#141413)]">
                  {recommendation.title}
                </h3>

                {recommendation.reason ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--channel-muted,#68645d)]">
                    {recommendation.reason}
                  </p>
                ) : recommendation.excerpt ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--channel-muted,#68645d)]">
                    {recommendation.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
