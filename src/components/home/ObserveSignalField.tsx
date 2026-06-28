"use client";

import Image from "next/image";

const observeSignals = [
  {
    src: "/raw_shoji.jpg",
    name: "light-memory.jpg",
    meta: "240x320",
    x: "-23vw",
    y: "-13vh",
    width: 182,
    height: 227,
  },
  {
    src: "/bamboo_leaves.png",
    name: "branch-shadow.png",
    meta: "255x169",
    x: "22vw",
    y: "-11vh",
    width: 255,
    height: 169,
  },
  {
    src: "/images/maps/japan.svg",
    name: "city-path.svg",
    meta: "231x171",
    x: "-25vw",
    y: "25vh",
    width: 231,
    height: 171,
  },
  {
    src: "/home-experience/backTexture/beckground_04min.jpeg",
    name: "time-field.jpeg",
    meta: "320x180",
    x: "27vw",
    y: "21vh",
    width: 264,
    height: 149,
  },
  {
    src: "/tech_cover.svg",
    name: "tech-signal.svg",
    meta: "182x227",
    x: "14vw",
    y: "-17vh",
    width: 188,
    height: 227,
  },
  {
    src: "/home-experience/revs/rev1.png",
    name: "voice-sample.png",
    meta: "260x160",
    x: "-17vw",
    y: "27vh",
    width: 236,
    height: 145,
  },
  {
    src: "/shoji_shadow.png",
    name: "body-shadow.png",
    meta: "210x156",
    x: "-31vw",
    y: "11vh",
    width: 210,
    height: 156,
  },
  {
    src: "/home-experience/awards/awwwards.png",
    name: "external-mark.png",
    meta: "206x146",
    x: "31vw",
    y: "-8vh",
    width: 206,
    height: 146,
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
      <div className="observe-signal-core absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-[#8a4ec7]/35 bg-[#f5efff]/70 px-3 py-1.5 text-sm font-medium text-[#8a4ec7] opacity-0 shadow-sm backdrop-blur-sm">
        <span className="observe-signal-core-text" />
        <span className="observe-signal-cursor inline-block w-[1ch] text-center invisible" aria-hidden="true">|</span>
      </div>

      {observeSignals.map((signal, index) => (
        <figure
          key={signal.name}
          className="observe-signal-item absolute left-1/2 top-1/2 m-0 opacity-0 will-change-transform"
          data-start-x={signal.x}
          data-start-y={signal.y}
          style={{ width: signal.width }}
        >
          <div className="overflow-hidden border border-[#0a0c20]/18 bg-[#f7f8f1]/82 shadow-[0_10px_30px_rgba(10,12,32,0.08)] backdrop-blur-sm">
            <Image
              className="block h-auto w-full object-cover grayscale-[20%] saturate-[0.78] opacity-85"
              src={signal.src}
              alt=""
              width={signal.width}
              height={signal.height}
              loading={index < 2 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
          <figcaption className="mt-2 font-mono text-[11px] leading-tight tracking-normal text-[#42513b]">
            <span className="block">{signal.name}</span>
            <span className="block">{signal.meta}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
