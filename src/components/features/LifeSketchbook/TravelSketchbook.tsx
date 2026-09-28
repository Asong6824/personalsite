"use client";

/* eslint-disable @next/next/no-css-tags, @next/next/no-img-element -- the scene stylesheet and images render inside Shadow DOM */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { createSketchbookRenderer } from "./sketchbookRenderer.js";
import type {
  SketchbookRendererController,
  TravelSketchbookCopy,
  TravelSketchbookPage,
} from "./types";

interface TravelSketchbookProps {
  pages: readonly TravelSketchbookPage[];
  copy: TravelSketchbookCopy;
  initialPageId?: string;
  backHref?: string;
  backLabel?: string;
  onPageChange?: (page: TravelSketchbookPage, index: number) => void;
  onPageOpen?: (page: TravelSketchbookPage, index: number) => void;
}

interface SketchbookSceneProps {
  pages: readonly TravelSketchbookPage[];
  copy: TravelSketchbookCopy;
  initialPageId?: string;
  requestedPageId?: string;
  onError: (message: string) => void;
  onPageChange: (page: TravelSketchbookPage, index: number) => void;
  onPageOpen: (page: TravelSketchbookPage, index: number) => void;
  onReady: () => void;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  const points = direction === "left" ? "11,3 3,22 11,41" : "3,3 11,22 3,41";
  return (
    <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SketchbookScene({
  pages,
  copy,
  initialPageId,
  requestedPageId,
  onError,
  onPageChange,
  onPageOpen,
  onReady,
}: SketchbookSceneProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const stylesheetRef = useRef<HTMLLinkElement>(null);
  const controllerRef = useRef<SketchbookRendererController | null>(null);
  const [stylesheetReady, setStylesheetReady] = useState(false);

  useEffect(() => {
    if (stylesheetRef.current?.sheet) setStylesheetReady(true);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !stylesheetReady) return;

    let controller: SketchbookRendererController;
    try {
      controller = createSketchbookRenderer(scene, pages, {
        initialPageId,
        onError,
        onPageChange,
        onPageOpen,
        onReady,
      });
      controllerRef.current = controller;
      controller.ready.catch(() => undefined);
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "手绘本初始化失败");
      return;
    }

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [initialPageId, onError, onPageChange, onPageOpen, onReady, pages, stylesheetReady]);

  useEffect(() => {
    if (requestedPageId) controllerRef.current?.goTo(requestedPageId);
  }, [requestedPageId]);

  return (
    <>
      <link
        ref={stylesheetRef}
        rel="stylesheet"
        href="/life/sketchbook/sketchbook.css"
        onLoad={() => setStylesheetReady(true)}
        onError={() => onError("手绘本样式加载失败")}
      />
      <div className="wash" aria-hidden="true" />
      <main ref={sceneRef} className="page home">
        <header className="top">
          <button id="navTop" className="name" type="button">
            {copy.title}
          </button>
          <nav aria-label="手绘本目录导航">
            <button id="navJournal" type="button">旅行目录</button>
            <button id="navAbout" type="button">关于</button>
          </nav>
        </header>

        <section id="sketchbook" className="hero" aria-label="可翻阅的旅行手绘本">
          <img
            className="botany l"
            src="/life/sketchbook/meng-to-sketchbook/botany-left.png"
            alt=""
            aria-hidden="true"
          />
          <img
            className="botany r"
            src="/life/sketchbook/meng-to-sketchbook/botany-right.png"
            alt=""
            aria-hidden="true"
          />
          <p className="hero-kicker">{copy.kicker}</p>

          <div className="sb-wrap" id="sbWrap">
            <svg width="0" height="0" className="sb-filter-definitions" aria-hidden="true">
              <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0" /></filter>
              <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0" /></filter>
            </svg>
            <div className="sb-stage" id="sbStage">
              <button className="sb-arrow left" id="sbLeft" type="button" aria-label="上一页">
                <ArrowIcon direction="left" />
              </button>
              <div className="sb-3d" id="sb3d">
                <div className="sb-tilt" id="sbTilt">
                  <div className="sb-cast ambient" aria-hidden="true" />
                  <div className="sb-cast contact" aria-hidden="true" />
                  <div className="sb-cast hair" aria-hidden="true" />
                  <div className="sb-book" id="sbBook" />
                </div>
                <div className="zoomwrap" id="zoomWrap" aria-hidden="true">
                  <div className="zoominner" id="zoomInner" />
                </div>
                <div className="loupe" id="loupe">
                  <span className="grip" />
                  <span className="ring">
                    <span className="lens"><span className="mag" /></span>
                  </span>
                </div>
              </div>
              <button className="sb-arrow right" id="sbRight" type="button" aria-label="下一页">
                <ArrowIcon direction="right" />
              </button>
            </div>
            <div className="sb-captions" id="sbCaptions" aria-live="polite" />
            <div className="sb-tools" role="group" aria-label="手绘本缩放">
              <button className="tool" id="zOut" type="button" aria-label="缩小手绘本">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8.6" cy="8.6" r="5.6" />
                  <path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8" />
                </svg>
              </button>
              <span className="zoom-read" id="zRead">100%</span>
              <button className="tool" id="zIn" type="button" aria-label="放大手绘本">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8.6" cy="8.6" r="5.6" />
                  <path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8" />
                </svg>
              </button>
              <span className="tool-sep" aria-hidden="true" />
              <button className="tool" id="loupeBtn" type="button" aria-label="切换放大镜" aria-pressed="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8.8" cy="8.8" r="5.8" />
                  <path d="M13 13l4.4 4.4" />
                  <path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55" />
                </svg>
              </button>
            </div>
            <p className="sb-hint" id="sbHint">拖动纸页翻阅 · 拖动放大镜查看细节</p>
          </div>

          <button className="hero-down" id="heroDown" type="button" aria-label="查看手绘本介绍">
            <svg viewBox="0 0 44 22" width="34" height="17" fill="none" aria-hidden="true">
              <polyline points="3,3 22,11 41,3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="3,11 22,19 41,11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </section>

        <div className="rule" aria-hidden="true" />
        <section id="about" className="about">
          <div>
            <p className="section-label">{copy.aboutLabel}</p>
            <p className="bio">{copy.about}</p>
          </div>
          <img
            className="bloom"
            src="/life/sketchbook/meng-to-sketchbook/bloom.png"
            alt=""
            aria-hidden="true"
          />
        </section>

        <div className="rule short" aria-hidden="true" />
        <section id="plates" className="plates">
          <p className="section-label">{copy.indexLabel}</p>
          <ol className="plate-list" id="plateList" />
        </section>
        <div className="rule short" aria-hidden="true" />
        <p className="foot">{copy.footer}</p>
      </main>
    </>
  );
}

export function TravelSketchbook({
  pages,
  copy,
  initialPageId,
  backHref = "/blog/life",
  backLabel = "返回生活频道",
  onPageChange,
  onPageOpen,
}: TravelSketchbookProps) {
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const initialPageIdRef = useRef(initialPageId);
  const pageChangeRef = useRef(onPageChange);
  const pageOpenRef = useRef(onPageOpen);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [error, setError] = useState("");
  const [currentPageId, setCurrentPageId] = useState(initialPageId ?? pages[0]?.id ?? "");

  pageChangeRef.current = onPageChange;
  pageOpenRef.current = onPageOpen;

  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;
    setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  const handleReady = useCallback(() => setStatus("ready"), []);
  const handleError = useCallback((message: string) => {
    setError(message);
    setStatus("unavailable");
  }, []);
  const handlePageChange = useCallback((page: TravelSketchbookPage, index: number) => {
    setCurrentPageId(page.id);
    pageChangeRef.current?.(page, index);
  }, []);
  const handlePageOpen = useCallback((page: TravelSketchbookPage, index: number) => {
    pageOpenRef.current?.(page, index);
  }, []);

  return (
    <section
      className="fixed inset-0 z-[60] isolate overflow-hidden bg-site-stone-100 text-site-stone-800"
      aria-label="旅行手绘翻页书"
      data-current-spread={currentPageId}
      data-sketchbook-status={status}
    >
      <div ref={shadowHostRef} className="absolute inset-0 size-full" />
      {shadowRoot && createPortal(
        <SketchbookScene
          pages={pages}
          copy={copy}
          initialPageId={initialPageIdRef.current}
          requestedPageId={initialPageId}
          onReady={handleReady}
          onError={handleError}
          onPageChange={handlePageChange}
          onPageOpen={handlePageOpen}
        />,
        shadowRoot,
      )}

      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-site-stone-100 transition-[opacity,visibility] duration-500 ${
          status === "ready" ? "invisible opacity-0" : "visible opacity-100"
        }`}
        role="status"
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        {status === "unavailable" ? (
          <div className="max-w-md px-6 text-center">
            <p className="font-serif text-2xl">手绘本暂时无法展开</p>
            <p className="mt-3 text-sm leading-6 text-site-stone-800/60">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="size-10 animate-spin rounded-full border border-site-stone-800/15 border-t-site-amber-600 motion-reduce:animate-none" aria-hidden="true" />
            <span className="font-serif text-sm italic tracking-[0.08em] text-site-stone-800/60">
              正在展开旅行手绘本
            </span>
          </div>
        )}
      </div>

      <Link
        href={backHref}
        className="absolute bottom-4 left-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-site-stone-800/15 bg-site-stone-100/80 px-4 text-xs tracking-[0.08em] text-site-stone-800/70 shadow-[0_10px_35px_rgba(43,39,33,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-site-stone-50 hover:text-site-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-amber-600 md:bottom-6 md:left-6"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>
    </section>
  );
}
