"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";

import {
  createBookshelfRenderer,
  type BookshelfRendererController,
  type BookshelfSelection,
} from "./bookshelfRenderer.js";
import styles from "./BookshelfExperience.module.css";
import {
  bookshelfBooks,
  getBookshelfOpenHref,
  type BookshelfBook,
} from "@/data/bookshelf-books";
import { startRouteTransition } from "@/lib/route-transition";

type ExperienceStatus = "loading" | "ready" | "unavailable";
type ExperienceMode = "shelf" | "detail";

const INITIAL_SELECTION: BookshelfSelection = {
  id: bookshelfBooks[0].id,
  index: 0,
  total: bookshelfBooks.length,
  title: bookshelfBooks[0].shortTitle,
  author: bookshelfBooks[0].author,
};

function RendererSourceControls() {
  return (
    <div className={styles.sourceControls} aria-hidden="true">
      <div id="loading" hidden />
      <p id="fallback-status" />
      <section id="browse-ui" />
      <aside id="detail-panel">
        <div className="detail-controls">
          <p className="microcopy" />
        </div>
      </aside>
      <span id="selection-title" />
      <span id="selection-note" />
      <span id="counter" />
      <span id="palette-label" />
      <div id="markers" />
      <button id="previous" type="button" />
      <button id="next" type="button" />
      <button id="inspect" type="button" />
      <button id="close-detail" type="button" />
      <button id="reset-view" type="button" />
      <button id="toggle-book" type="button" />
      <button id="previous-page" type="button" />
      <button id="next-page" type="button" />
      <span id="page-label" />
      <span id="page-counter" />
      <span id="detail-eyebrow" />
      <span id="detail-title" />
      <span id="detail-deck" />
      <span id="detail-binding" />
      <span id="detail-format" />
      <span id="detail-theme" />
      <span id="detail-motif" />
      <span id="live-region" />
      <span id="pointer-label">
        <span id="pointer-label-index" />
        <span id="pointer-label-title" />
      </span>
    </div>
  );
}

export function LifeBookshelfExperience() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedBookId = searchParams.get("book") ?? bookshelfBooks[0].id;
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<BookshelfRendererController | null>(null);
  const initialBookIdRef = useRef(requestedBookId);
  const [status, setStatus] = useState<ExperienceStatus>("loading");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ExperienceMode>("shelf");
  const [selection, setSelection] = useState<BookshelfSelection>(INITIAL_SELECTION);
  const selectedBook = bookshelfBooks[selection.index] ?? bookshelfBooks[0];
  const handleSelectionChange = useCallback((nextSelection: BookshelfSelection) => {
    setSelection(nextSelection);
    router.replace(`${pathname}?book=${encodeURIComponent(nextSelection.id)}`, { scroll: false });
  }, [pathname, router]);
  const selectionChangeRef = useRef(handleSelectionChange);
  selectionChangeRef.current = handleSelectionChange;
  const handleOpenRequest = useCallback((book: BookshelfBook) => {
    const href = getBookshelfOpenHref(book);
    if (!href) return;
    startRouteTransition(href);
    router.push(href);
  }, [router]);
  const openRequestRef = useRef(handleOpenRequest);
  openRequestRef.current = handleOpenRequest;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let controller: BookshelfRendererController;

    try {
      controller = createBookshelfRenderer(host, canvas, bookshelfBooks, {
        initialBookId: initialBookIdRef.current,
        onReady: () => {
          if (!disposed) setStatus("ready");
        },
        onError: (message) => {
          if (!disposed) {
            setError(message);
            setStatus("unavailable");
          }
        },
        onSelectionChange: (nextSelection) => {
          if (!disposed) selectionChangeRef.current(nextSelection);
        },
        onModeChange: (nextMode) => {
          if (!disposed) setMode(nextMode);
        },
        onOpenRequest: (book) => {
          if (!disposed) openRequestRef.current(book);
        },
      });
      controllerRef.current = controller;
      controller.ready.catch((reason: unknown) => {
        if (!disposed) {
          setError(reason instanceof Error ? reason.message : "渲染器初始化失败");
          setStatus("unavailable");
        }
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "渲染器初始化失败");
      setStatus("unavailable");
      return;
    }

    const resizeObserver = new ResizeObserver(() => controller.resize());
    resizeObserver.observe(host);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  const controller = () => controllerRef.current;

  return (
    <section className={styles.experience} aria-label="可交互的 3D 翻页书房">
      <div
        ref={hostRef}
        className={styles.bookshelf}
        data-state={status}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${status === "ready" ? styles.canvasReady : ""}`}
          aria-label={`${bookshelfBooks.length} 册可选择、可打开和翻页的三维书籍`}
        />
        <RendererSourceControls />
      </div>

      <div
        className={`${styles.loading} ${status === "ready" ? styles.loadingHidden : ""}`}
        role="status"
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        {status === "loading" ? (
          <div className="flex flex-col items-center gap-4">
            <span className={styles.loadingMark} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.24em] text-site-stone-50/60">
              正在布置书房
            </span>
          </div>
        ) : (
          <div className="max-w-lg text-center">
            <p className="font-serif text-2xl">这台设备暂时无法开启 3D 书房</p>
            <p className="mt-3 text-sm leading-6 text-site-stone-50/60">
              {error || "浏览器没有提供可用的 WebGL 图形环境。"}
            </p>
          </div>
        )}
      </div>

      <div className={styles.chrome}>
        <div className={`${styles.topCopy} ${mode === "detail" ? styles.topCopyDetail : ""}`}>
          <p className={styles.eyebrow}>Life archive · interactive edition</p>
          <h1 className={styles.title}>可翻阅的书房</h1>
          <p className={styles.hint}>
            移动指针选择一册，点击封面打开；进入书中后拖拽纸页，或使用下方按钮翻阅。
          </p>
        </div>

        <Link href="/blog/life" className={styles.backLink}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className={styles.backLabel}>返回生活频道</span>
        </Link>

        {status === "ready" && (
          <>
            <p className={styles.status} aria-live="polite" data-testid="bookshelf-selection">
              {mode === "shelf"
                ? `${String(selection.index + 1).padStart(2, "0")} / ${String(selection.total).padStart(2, "0")} · ${selection.title}`
                : `${selection.title} · 拖动封面或页角翻阅`}
            </p>

            <div
              className={styles.controls}
              role="group"
              aria-label={mode === "shelf" ? "书架控制" : "阅读控制"}
            >
              {mode === "shelf" ? (
                <>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => controller()?.previousVolume()}
                    disabled={selection.index === 0}
                    aria-label="选择上一册"
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => controller()?.openSelected()}
                  >
                    <BookOpen className="size-4" aria-hidden="true" />
                    <span className={styles.buttonLabel}>
                      {selectedBook.open.type === "sketchbook"
                        ? "展开游记"
                        : selectedBook.open.type === "article"
                          ? "阅读笔记"
                          : "打开这册"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => controller()?.nextVolume()}
                    disabled={selection.index === selection.total - 1}
                    aria-label="选择下一册"
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => controller()?.close()}
                    aria-label="合上并返回书架"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => controller()?.previousPage()}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                    <span className={styles.buttonLabel}>上一页</span>
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => controller()?.toggle()}
                    aria-label="打开或合上封面"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    <span className={styles.buttonLabel}>翻开 / 合上</span>
                  </button>
                  <button
                    type="button"
                    className={styles.controlButton}
                    onClick={() => controller()?.nextPage()}
                  >
                    <span className={styles.buttonLabel}>下一页</span>
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
