"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowLeft,
    ArrowUpRight,
    MoveHorizontal,
    MousePointer2,
} from 'lucide-react';
import { getCreativeGalleryItems } from '@/data/creative-gallery';
import {
    assignCreativeCardLevels,
    creativeEntryTone,
    creativeEntryVariant,
    type CreativeEntryKind,
} from '@/lib/creative/canvas-entries';
import {
    createCreativeCanvasLayout,
    type CreativeCanvasLayout,
    type CreativeCanvasLayoutItem,
    type CreativeCanvasPlacement,
} from '@/lib/creative/canvas-layout';

gsap.registerPlugin(ScrollTrigger);

export interface CreativePostPreview {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
}

export interface CreativeCanvasColumn {
    key: string;
    name: string;
    description: string;
    cover: string;
    articles: CreativePostPreview[];
}

interface CreativeInfiniteCanvasProps {
    columns: CreativeCanvasColumn[];
}

interface CreativeArtboardProps {
    model: CreativeCanvasModel;
    duplicate: boolean;
    cycleRef?: React.RefObject<HTMLDivElement | null>;
}

interface CreativeCanvasEntry {
    id: string;
    kind: CreativeEntryKind;
    group: string;
    title: string;
    eyebrow: string;
    description: string;
    image: string;
    alt: string;
    href?: string;
    date?: string;
    featured?: boolean;
}

interface CreativeCanvasModel {
    layout: CreativeCanvasLayout;
    width: number;
    entries: CreativeCanvasEntry[];
    fillers: CreativeCanvasPlacement[];
}

const CELL_WIDTH = 160;
const CELL_GAP = 24;

function findVisualArticle(column?: CreativeCanvasColumn) {
    return column?.articles.find((article) => article.coverImage) ?? column?.articles[0];
}

function placementStyle(placement?: CreativeCanvasPlacement): CSSProperties | undefined {
    if (!placement) {
        return undefined;
    }
    return {
        gridColumn: `${placement.column + 1} / span ${placement.columns}`,
        gridRow: `${placement.row + 1} / span ${placement.rows}`,
    };
}

function buildCreativeCanvasModel(columns: CreativeCanvasColumn[]): CreativeCanvasModel {
    const columnEntries: CreativeCanvasEntry[] = columns.map((column) => {
        const visualArticle = findVisualArticle(column);
        return {
            id: `column-${column.key}`,
            kind: 'column',
            group: column.key,
            title: column.name,
            eyebrow: 'Column / 专栏',
            description: column.description,
            image: visualArticle?.coverImage || column.cover,
            alt: column.name,
            href: `/blog/creative/${column.key}`,
        };
    });
    const articleEntries: CreativeCanvasEntry[] = columns.flatMap((column) => (
        column.articles.map((article) => ({
            id: `article-${article.slug}`,
            kind: 'article' as const,
            group: column.key,
            title: article.title,
            eyebrow: column.name,
            description: article.excerpt,
            image: article.coverImage,
            alt: article.title,
            href: `/blog/${article.slug}`,
            date: article.date,
        }))
    ));
    const galleryEntries: CreativeCanvasEntry[] = getCreativeGalleryItems('creative').map((item) => ({
        id: `gallery-${item.id}`,
        kind: 'gallery',
        group: 'gallery',
        title: item.title,
        eyebrow: item.eyebrow,
        description: '来自首页 Creative 阶段的视觉实验。',
        image: item.src,
        alt: item.alt,
        featured: item.featured,
    }));
    const sizedEntries = assignCreativeCardLevels([
        ...columnEntries,
        ...articleEntries,
        ...galleryEntries,
    ]);
    const entries = sizedEntries.map(({ entry }) => entry);

    const items: CreativeCanvasLayoutItem[] = [
        { id: 'intro', sizes: [{ columns: 5, rows: 2 }], anchor: { column: 0, row: 0 }, priority: 100 },
        ...sizedEntries.map(({ entry, size }, index): CreativeCanvasLayoutItem => ({
            id: entry.id,
            sizes: [size],
            tone: creativeEntryTone(entry.id),
            order: index,
        })),
    ];
    const layout = createCreativeCanvasLayout(items, {
        seed: 'creative-channel-v3',
        fillEmpty: true,
        fillerIdPrefix: 'unit',
    });

    return {
        layout,
        width: layout.columns * (CELL_WIDTH + CELL_GAP),
        entries,
        fillers: layout.placements.filter((placement) => placement.id.startsWith('unit-')),
    };
}

function GridGuides({ columns }: { columns: number }) {
    return (
        <div className="pointer-events-none absolute inset-0 text-neutral-400/45" aria-hidden="true">
            <div
                className="absolute inset-0 grid gap-6 pr-6"
                style={{ gridTemplateColumns: `repeat(${columns}, ${CELL_WIDTH}px)` }}
            >
                {Array.from({ length: columns }, (_, index) => (
                    <span key={`column-${index}`} className="border-x border-dashed border-current" />
                ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-4 gap-6 py-20 sm:py-24">
                {Array.from({ length: 4 }, (_, index) => (
                    <span key={`row-${index}`} className="border-y border-dashed border-current" />
                ))}
            </div>
        </div>
    );
}

function CardArrow() {
    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current/15 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
    );
}

function CreativeEntryCard({
    entry,
    placement,
    duplicate,
}: {
    entry: CreativeCanvasEntry;
    placement?: CreativeCanvasPlacement;
    duplicate: boolean;
}) {
    if (!placement) {
        return null;
    }

    const variant = creativeEntryVariant(entry.id);
    const compact = placement.rows === 1 || placement.columns <= 2;
    const spacious = placement.rows >= 3 || (placement.rows >= 2 && placement.columns >= 4);
    const hasBackgroundImage = Boolean(entry.image) && (
        entry.kind === 'gallery' || variant === 0 || spacious
    );
    const titleSize = hasBackgroundImage
        ? spacious
            ? 'text-3xl sm:text-4xl'
            : compact
                ? 'text-lg sm:text-xl'
                : 'text-2xl'
        : spacious
            ? 'text-4xl sm:text-5xl'
            : compact
                ? 'text-xl sm:text-2xl'
                : 'text-3xl';
    const variantClasses = [
        'border-[#d8d0c2] bg-[#eee8dc] text-neutral-950',
        'border-neutral-200 bg-white text-neutral-950',
        'border-neutral-800 bg-[#181818] text-white',
        'border-[#cfc9ff] bg-[#dedaff] text-[#2f286f]',
        'border-[#ffc4ad] bg-[#ff684f] text-[#32140e]',
        'border-[#becbad] bg-[#dbe5cc] text-[#24331f]',
    ];
    const content = (
        <>
            {hasBackgroundImage ? (
                <Image
                    src={entry.image}
                    alt={duplicate ? '' : entry.alt}
                    fill
                    priority={placement.column < 8}
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    sizes={`${placement.columns * (CELL_WIDTH + CELL_GAP)}px`}
                />
            ) : null}
            <div className={`relative flex h-full flex-col justify-between ${compact ? 'p-5 sm:p-6' : 'p-7 sm:p-8'} ${hasBackgroundImage ? 'text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.72)]' : ''}`}>
                <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.22em] opacity-55">
                    <span className="truncate">{entry.eyebrow}</span>
                    <span className="shrink-0">{entry.date?.slice(0, 4) || (entry.kind === 'gallery' ? 'Object' : 'Index')}</span>
                </div>
                <div className="flex items-end justify-between gap-5">
                    <div className="min-w-0">
                        <h2 className={`${titleSize} line-clamp-3 font-semibold leading-[1.02] tracking-[-0.035em]`}>
                            {entry.title}
                        </h2>
                        {!compact && entry.description ? (
                            <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-5 opacity-65">{entry.description}</p>
                        ) : null}
                    </div>
                    {entry.href ? <CardArrow /> : (
                        <span className="shrink-0 rounded-full border border-current/20 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] opacity-65">
                            Material
                        </span>
                    )}
                </div>
            </div>
        </>
    );

    const className = `group relative z-10 overflow-hidden rounded-[30px] border shadow-[0_18px_50px_rgba(30,30,30,0.09)] transition-transform duration-500 hover:-translate-y-1 ${variantClasses[variant]}`;

    if (entry.href) {
        return (
            <Link
                href={entry.href}
                tabIndex={duplicate ? -1 : undefined}
                style={placementStyle(placement)}
                className={className}
            >
                {content}
            </Link>
        );
    }

    return (
        <article
            style={placementStyle(placement)}
            className={className}
        >
            {content}
        </article>
    );
}

function UnitWidget({
    placement,
    index,
}: {
    placement: CreativeCanvasPlacement;
    index: number;
}) {
    const variant = creativeEntryVariant(placement.id);
    const baseClass = 'relative z-10 flex items-center justify-center overflow-hidden rounded-[26px] border shadow-[0_12px_34px_rgba(30,30,30,0.07)]';
    const content = [
        <span key="dot" className="h-12 w-12 rounded-full bg-[#ff684f]" />,
        <div key="index" className="text-center font-mono text-neutral-500">
            <span className="block text-[9px] uppercase tracking-[0.2em]">Index</span>
            <span className="mt-1 block text-2xl text-neutral-950">{String(index + 1).padStart(2, '0')}</span>
        </div>,
        <div key="cross" className="relative h-14 w-14 text-[#776dff]" aria-hidden="true">
            <span className="absolute left-1/2 top-0 h-full w-px bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current bg-[#f4f3ef]" />
        </div>,
        <ArrowUpRight key="arrow" className="h-10 w-10 text-neutral-700" strokeWidth={1.25} aria-hidden="true" />,
        <div key="palette" className="grid grid-cols-2 gap-2" aria-hidden="true">
            <span className="h-5 w-5 rounded-full bg-[#ff6b5f]" />
            <span className="h-5 w-5 rounded-full bg-[#776dff]" />
            <span className="h-5 w-5 rounded-full bg-[#f1c94a]" />
            <span className="h-5 w-5 rounded-full bg-[#121212]" />
        </div>,
        <div key="signal" className="w-20 space-y-2" aria-hidden="true">
            <span className="block h-1 w-8 rounded-full bg-[#776dff]" />
            <span className="block h-1 w-16 rounded-full bg-[#776dff]" />
            <span className="block h-1 w-11 rounded-full bg-[#776dff]" />
        </div>,
    ][variant];
    const variantClass = [
        'border-[#ffc7b8] bg-[#ffe0d7]',
        'border-neutral-200 bg-white',
        'border-[#d2cdfd] bg-[#e3e0ff]',
        'border-[#cbd6bd] bg-[#e1ead5]',
        'border-neutral-200 bg-[#f7f3e8]',
        'border-neutral-800 bg-[#181818]',
    ][variant];

    return (
        <section
            style={placementStyle(placement)}
            className={`${baseClass} ${variantClass}`}
            aria-hidden="true"
        >
            {content}
        </section>
    );
}

function CreativeArtboard({ model, duplicate, cycleRef }: CreativeArtboardProps) {
    const tabIndex = duplicate ? -1 : undefined;

    return (
        <div
            ref={cycleRef}
            className="relative grid h-full shrink-0 grid-rows-4 gap-6 py-20 pr-6 sm:py-24"
            style={{
                width: model.width,
                gridTemplateColumns: `repeat(${model.layout.columns}, ${CELL_WIDTH}px)`,
            }}
            aria-hidden={duplicate ? true : undefined}
        >
            <GridGuides columns={model.layout.columns} />

            <header
                style={placementStyle(model.layout.byId.intro)}
                className="relative z-10 flex max-w-[720px] flex-col justify-center px-8 sm:px-12"
            >
                <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                    <span>Creative channel</span>
                    <span className="h-px w-10 bg-neutral-400" />
                    <span>Infinite index</span>
                </div>
                <h1 className="max-w-[680px] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-neutral-950 sm:text-5xl lg:text-6xl">
                    <span className="block">把想法，排成一张</span>
                    <span className="whitespace-nowrap text-[#776dff]">不断延伸</span>的画布。
                </h1>
                <p className="mt-6 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
                    专栏、文章与视觉实验不再按等级占位。滚动或拖拽，在完整而错落的秩序里继续探索。
                </p>
                <Link
                    href="/blog"
                    tabIndex={tabIndex}
                    className="mt-7 inline-flex w-fit items-center gap-2 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-950"
                >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    返回博客索引
                </Link>
            </header>

            {model.entries.map((entry) => (
                <CreativeEntryCard
                    key={entry.id}
                    entry={entry}
                    placement={model.layout.byId[entry.id]}
                    duplicate={duplicate}
                />
            ))}

            {model.fillers.map((placement, index) => (
                <UnitWidget key={placement.id} placement={placement} index={index} />
            ))}
        </div>
    );
}

/*
 * The repeated artboards below are translated as one track. The middle copy
 * is measured at runtime, so adding content only changes the cycle width and
 * never the infinite-wrap behavior.
 */
export function CreativeInfiniteCanvas({ columns }: CreativeInfiniteCanvasProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const cycleRef = useRef<HTMLDivElement>(null);
    const copies = useMemo(() => Array.from({ length: 3 }, (_, index) => index), []);
    const model = useMemo(() => buildCreativeCanvasModel(columns), [columns]);

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        const cycle = cycleRef.current;

        if (!viewport || !track || !cycle) {
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const position = { x: 0 };
        let targetX = 0;
        let cycleWidth = cycle.offsetWidth;
        let movementTween: gsap.core.Tween | null = null;
        let observer: ReturnType<typeof ScrollTrigger.observe> | null = null;
        let handleKeyDown: ((event: KeyboardEvent) => void) | null = null;
        let resetPosition: (() => void) | null = null;

        const context = gsap.context(() => {
            const render = () => {
                const wrappedX = gsap.utils.wrap(-cycleWidth * 2, -cycleWidth, position.x);
                gsap.set(track, { x: wrappedX });
            };

            resetPosition = () => {
                cycleWidth = cycle.offsetWidth;
                const visibleCut = Math.min(window.innerWidth * 0.08, 180);
                targetX = -cycleWidth + visibleCut;
                position.x = targetX;
                render();
                ScrollTrigger.refresh();
            };

            const moveBy = (distance: number, dragging = false) => {
                const limitedDistance = gsap.utils.clamp(-240, 240, distance);
                targetX += limitedDistance;
                movementTween?.kill();
                movementTween = gsap.to(position, {
                    x: targetX,
                    duration: reduceMotion ? 0 : dragging ? 0.24 : 0.72,
                    ease: dragging ? 'power2.out' : 'power3.out',
                    overwrite: true,
                    onUpdate: render,
                });
            };

            resetPosition();

            observer = ScrollTrigger.observe({
                target: viewport,
                type: 'wheel,touch,pointer',
                preventDefault: true,
                allowClicks: true,
                dragMinimum: 5,
                tolerance: 2,
                onChange: (self) => {
                    if (self.isDragging) {
                        moveBy(self.deltaX * 1.15, true);
                        return;
                    }

                    const wheelDelta = Math.abs(self.deltaX) > Math.abs(self.deltaY)
                        ? self.deltaX
                        : self.deltaY;
                    moveBy(-wheelDelta * 0.9);
                },
                onRelease: (self) => {
                    if (Math.abs(self.velocityX) > 120) {
                        moveBy(self.velocityX * 0.045);
                    }
                },
            });

            handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'ArrowRight' || event.key === 'PageDown') {
                    event.preventDefault();
                    moveBy(-Math.min(window.innerWidth * 0.42, 560));
                }
                if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
                    event.preventDefault();
                    moveBy(Math.min(window.innerWidth * 0.42, 560));
                }
            };

            viewport.addEventListener('keydown', handleKeyDown);
            window.addEventListener('resize', resetPosition);
        }, viewport);

        return () => {
            observer?.kill();
            movementTween?.kill();
            if (handleKeyDown) {
                viewport.removeEventListener('keydown', handleKeyDown);
            }
            if (resetPosition) {
                window.removeEventListener('resize', resetPosition);
            }
            context.revert();
        };
    }, []);

    return (
        <div
            ref={viewportRef}
            tabIndex={0}
            role="region"
            aria-roledescription="无限横向创意画布"
            aria-label="创意频道。上下滚动、左右拖拽或使用方向键浏览。"
            className="relative h-svh w-full touch-none cursor-grab overflow-hidden overscroll-none bg-[#f4f3ef] text-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#776dff] active:cursor-grabbing"
        >
            <div
                ref={trackRef}
                className="absolute inset-y-0 left-0 flex w-max will-change-transform"
            >
                {copies.map((copyIndex) => (
                    <CreativeArtboard
                        key={copyIndex}
                        model={model}
                        duplicate={copyIndex !== 2}
                        cycleRef={copyIndex === 1 ? cycleRef : undefined}
                    />
                ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between bg-gradient-to-t from-[#f4f3ef] via-[#f4f3ef]/75 to-transparent px-5 pb-5 pt-14 sm:px-8 sm:pb-7">
                <div className="flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/85 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-600 shadow-sm backdrop-blur-sm">
                    <MousePointer2 className="h-3.5 w-3.5" aria-hidden="true" />
                    滚动浏览
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
                    Drag · Wheel · Arrow keys
                </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#f4f3ef] to-transparent sm:w-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#f4f3ef] to-transparent sm:w-20" />
        </div>
    );
}
