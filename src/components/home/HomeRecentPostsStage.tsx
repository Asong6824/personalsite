import Image from "next/image";
import Link from "next/link";
import { CHANNELS_CONFIG } from "@/lib/channels";
import type { Post } from "@/types";

interface HomeRecentPostsStageProps {
  posts: Post[];
}

interface RecentPostItem {
  slug: string;
  title: string;
  date: string;
  href: string;
  image: string;
  columnLabel: string;
  tags: string[];
}

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function resolvePostImage(post: Post) {
  if (post.coverImage) return post.coverImage;

  const channel = post.channel ? CHANNELS_CONFIG[post.channel as keyof typeof CHANNELS_CONFIG] : undefined;
  const column = channel && post.column ? channel.columns[post.column] : undefined;

  return column?.cover || column?.coverImage || channel?.icon || PLACEHOLDER_IMAGE;
}

function resolvePostItems(posts: Post[]): RecentPostItem[] {
  return posts.slice(0, 3).map((post) => {
    const channel = post.channel ? CHANNELS_CONFIG[post.channel as keyof typeof CHANNELS_CONFIG] : undefined;
    const column = channel && post.column ? channel.columns[post.column] : undefined;
    const tags = post.tags?.length ? post.tags : [channel?.name, column?.name].filter(Boolean) as string[];

    return {
      slug: post.slug,
      title: post.title,
      date: post.date,
      href: `/blog/${post.slug}`,
      image: resolvePostImage(post),
      columnLabel: column?.name || post.column || "近期",
      tags: tags.slice(0, 3),
    };
  });
}

function shouldContainImage(image: string) {
  return image === PLACEHOLDER_IMAGE || image.endsWith(".svg");
}

export function HomeRecentPostsStage({ posts }: HomeRecentPostsStageProps) {
  const items = resolvePostItems(posts);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-recent-posts-title"
      className="relative z-20 w-full overflow-hidden px-8 py-20 text-[#0a0c20] md:px-12 md:py-24 lg:px-16 lg:py-28"
    >
      <div className="pointer-events-auto">
        <div className="relative flex items-end justify-between gap-6 border-b border-[#0a0c20]/70 pb-8 md:pb-10">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">
              Articles
            </p>
            <h2
              id="home-recent-posts-title"
              className="mt-2 max-w-4xl text-3xl font-semibold uppercase leading-[0.95] tracking-tight md:text-4xl lg:text-5xl"
            >
              抵达最新文章前沿
            </h2>
          </div>
          <Link
            href="/blog"
            className="mb-1 hidden shrink-0 rounded-full border border-[#0a0c20]/70 px-3 py-1 text-sm font-medium leading-none transition-colors hover:bg-[#0a0c20] hover:text-[#f3efe6] md:block"
          >
            查看全部
          </Link>
        </div>

        <div>
          {items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group relative grid gap-6 border-b border-[#0a0c20]/70 py-8 transition-colors md:grid-cols-[minmax(260px,33.333%)_minmax(0,1fr)_2.5rem] md:gap-10"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#e7e1d6] md:aspect-auto md:h-[18vw] md:min-h-[210px]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={[
                    "transition duration-500 group-hover:scale-[1.035]",
                    shouldContainImage(item.image) ? "object-contain p-10 opacity-80" : "object-cover",
                  ].join(" ")}
                />
                <div className="absolute inset-0 flex flex-col items-end gap-1 p-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/80 bg-black/10 px-2 py-1 text-xs font-medium leading-none text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute inset-0 hidden items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
                  <span className="font-mono text-4xl uppercase leading-none text-white">Read</span>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-10 md:gap-12">
                <h3 className="max-w-3xl text-2xl font-medium leading-[1.08] tracking-tight md:text-3xl lg:text-4xl">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-[#0a0c20]/72 md:text-base">
                  <span className="font-semibold text-[#0a0c20]">{item.columnLabel}</span>
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#0a0c20]" />
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </div>
              </div>

              <span
                aria-hidden="true"
                className="hidden self-start text-3xl leading-none text-[#0a0c20]/70 transition-transform duration-300 group-hover:translate-x-1 md:block"
              >
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-8 inline-flex rounded-full border border-[#0a0c20]/70 px-3 py-1 text-sm font-medium leading-none transition-colors hover:bg-[#0a0c20] hover:text-[#f3efe6] md:hidden"
        >
          查看全部
        </Link>
      </div>
    </section>
  );
}
