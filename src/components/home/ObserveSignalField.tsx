"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

const observeSignals = [
  {
    src: "/home-experience/stages/observe/goon.webp",
    name: "goon.webp",
    x: "-23vw",
    y: "-13vh",
    width: 775,
    height: 1033,
    desktopWidth: 270,
    mobileWidth: 220,
  },
  {
    src: "/home-experience/stages/observe/autumn.webp",
    name: "autumn.webp",
    x: "22vw",
    y: "-11vh",
    width: 1050,
    height: 788,
    desktopWidth: 360,
    mobileWidth: 280,
  },
  {
    src: "/home-experience/stages/observe/hashidate.webp",
    name: "hashidate.webp",
    x: "-25vw",
    y: "25vh",
    width: 950,
    height: 713,
    desktopWidth: 330,
    mobileWidth: 260,
  },
  {
    src: "/home-experience/stages/observe/sea.webp",
    name: "sea.webp",
    x: "27vw",
    y: "21vh",
    width: 1075,
    height: 806,
    desktopWidth: 370,
    mobileWidth: 290,
  },
  {
    src: "/home-experience/stages/observe/matsuri.webp",
    name: "matsuri.webp",
    x: "14vw",
    y: "-17vh",
    width: 825,
    height: 619,
    desktopWidth: 285,
    mobileWidth: 230,
  },
  {
    src: "/home-experience/stages/observe/izu.webp",
    name: "izu.webp",
    x: "-17vw",
    y: "27vh",
    width: 1000,
    height: 750,
    desktopWidth: 345,
    mobileWidth: 270,
  },
  {
    src: "/home-experience/stages/observe/tamp.webp",
    name: "tamp.webp",
    x: "-31vw",
    y: "11vh",
    width: 900,
    height: 675,
    desktopWidth: 310,
    mobileWidth: 250,
  },
];

export default function ObserveSignalField() {
  return (
    <div
      className="observe-signal-field fixed inset-0 z-20 pointer-events-none overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <div className="observe-signal-crosshair observe-signal-crosshair-x absolute left-0 top-1/2 h-px w-full border-t border-dashed border-[#0a0c20]/20 opacity-0" />
      <div className="observe-signal-crosshair observe-signal-crosshair-y absolute left-1/2 top-0 h-full w-px border-l border-dashed border-[#0a0c20]/20 opacity-0" />

      {observeSignals.map((signal, index) => (
        <figure
          key={signal.name}
          className="observe-signal-item absolute left-1/2 top-1/2 m-0 w-[var(--observe-mobile-width)] opacity-0 will-change-transform lg:w-[var(--observe-desktop-width)]"
          data-start-x={signal.x}
          data-start-y={signal.y}
          style={{
            "--observe-mobile-width": `${signal.mobileWidth}px`,
            "--observe-desktop-width": `${signal.desktopWidth}px`,
          } as CSSProperties}
        >
          <div className="overflow-hidden border border-[#0a0c20]/18 bg-[#f7f8f1]/82 shadow-[0_10px_30px_rgba(10,12,32,0.08)] backdrop-blur-sm">
            <Image
              className="block h-auto w-full object-contain"
              src={signal.src}
              alt=""
              width={signal.width}
              height={signal.height}
              sizes={`(min-width: 1024px) ${signal.desktopWidth}px, ${signal.mobileWidth}px`}
              loading={index < 2 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        </figure>
      ))}
    </div>
  );
}
