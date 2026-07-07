"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CHANNELS_CONFIG } from "@/lib/channels";
import type { ChannelConfig, ColumnConfig } from "@/types";
import type { MouseEvent } from "react";

type ColumnListItem = {
  key: string;
  channelKey: string;
  channelName: string;
  columnName: string;
  description: string;
  href: string;
  image: string;
  countLabel: string;
};

const PLACEHOLDER_IMAGE = "/placeholder-image.svg";

function resolveColumnImage(columnCover?: string, channelIcon?: string) {
  return columnCover || channelIcon || PLACEHOLDER_IMAGE;
}

function buildColumnItems(postCounts: Record<string, number>): ColumnListItem[] {
  return (Object.entries(CHANNELS_CONFIG) as Array<[string, ChannelConfig]>).flatMap(([channelKey, channel]) =>
    (Object.entries(channel.columns) as Array<[string, ColumnConfig]>)
      .filter(([, column]) => column.featured)
      .map(([columnKey, column]) => ({
        key: `${channelKey}-${columnKey}`,
        channelKey,
        channelName: channel.name,
        columnName: column.name,
        description: column.description,
        href: `/blog/${channelKey}/${columnKey}`,
        image: resolveColumnImage(column.cover || column.coverImage, channel.icon),
        countLabel: String(postCounts[`${channelKey}/${columnKey}`] ?? 0).padStart(2, "0"),
      }))
  );
}

export function HomeColumnsListStage({ postCounts = {} }: { postCounts?: Record<string, number> }) {
  const items = useMemo(() => buildColumnItems(postCounts), [postCounts]);
  const listRef = useRef<HTMLElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const activeItem = items.find((item) => item.key === activeKey);

  const updatePreviewPosition = (event: MouseEvent<HTMLElement>) => {
    if (!listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const paddingX = 190;
    const paddingY = 150;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPreviewPosition({
      x: Math.min(Math.max(x, paddingX), rect.width - paddingX),
      y: Math.min(Math.max(y, paddingY), rect.height - paddingY),
    });
  };

  return (
    <section
      aria-labelledby="home-columns-title"
      className="home-columns-list-stage relative z-20 h-screen w-full overflow-visible px-8 pb-8 pt-24 md:px-12 md:pb-10 md:pt-28 lg:px-16"
    >
      <div className="pointer-events-auto relative z-10 flex h-full flex-col text-[#0a0c20]">
        <div className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">
            Columns
          </p>
          <h2
            id="home-columns-title"
            className="mt-2 max-w-4xl text-3xl font-semibold uppercase leading-[0.95] tracking-tight md:text-4xl lg:text-5xl"
          >
            探索更多专题内容
          </h2>
        </div>

        <div className="relative mt-10 min-h-0 flex-1 md:mt-14">
          <div
            className={[
              "pointer-events-none absolute z-20 hidden aspect-[4/3] w-[min(22vw,340px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden",
              "border border-[#0a0c20]/10 bg-[#f0eee7] shadow-[0_24px_80px_rgba(10,12,32,0.14)] transition duration-300 md:block",
              activeItem ? "opacity-100 blur-0" : "opacity-0 blur-sm",
            ].join(" ")}
            style={{
              left: previewPosition ? `${previewPosition.x}px` : "50%",
              top: previewPosition ? `${previewPosition.y}px` : "50%",
            }}
          >
            {activeItem ? (
              <Image
                src={activeItem.image}
                alt=""
                fill
                sizes="340px"
                className="object-cover"
                priority={false}
              />
            ) : null}
          </div>

          <nav
            ref={listRef}
            aria-label="专栏列表"
            className="relative z-10 flex h-full flex-col justify-center"
            onMouseLeave={() => {
              setActiveKey(null);
              setPreviewPosition(null);
            }}
          >
            {items.map((item) => {
              const isActive = item.key === activeKey;
              const hasHover = activeKey !== null;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={item.description}
                  onFocus={() => {
                    setActiveKey(item.key);
                    setPreviewPosition(null);
                  }}
                  onMouseEnter={(event) => {
                    setActiveKey(item.key);
                    updatePreviewPosition(event);
                  }}
                  onMouseMove={updatePreviewPosition}
                  className={[
                    "group grid grid-cols-[1fr_auto] items-center border-t border-[#0a0c20]/28 py-7 transition duration-200 last:border-b md:grid-cols-[minmax(0,1fr)_auto_2.5rem] md:gap-5 md:py-9 lg:py-10",
                    hasHover && !isActive ? "text-[#0a0c20]/28" : "text-[#0a0c20]",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate text-xl font-medium leading-none tracking-tight md:text-2xl lg:text-3xl">
                        {item.columnName}
                      </span>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-current/55">
                        / {item.countLabel}
                      </span>
                    </div>
                    <p className="sr-only">
                      {item.channelName} · {item.description}
                    </p>
                  </div>

                  <span className="hidden text-xs font-semibold uppercase tracking-[0.24em] text-current/55 md:block">
                    {item.channelKey}
                  </span>
                  <span className="text-xl leading-none text-current/65 transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
