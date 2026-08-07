"use client";

import Image from "next/image";

const observeSignals = [
  {
    src: "/home-experience/stages/observe/light-memory.webp",
    name: "light-memory.jpg",
    meta: "240x320",
    x: "-23vw",
    y: "-13vh",
    width: 182,
    height: 227,
  },
  {
    src: "/images/backgrounds/bamboo-leaves.webp",
    name: "branch-shadow.png",
    meta: "255x169",
    x: "22vw",
    y: "-11vh",
    width: 255,
    height: 169,
  },
  {
    src: "/images/life/japan-map.svg",
    name: "city-path.svg",
    meta: "231x171",
    x: "-25vw",
    y: "25vh",
    width: 231,
    height: 171,
  },
  {
    src: "/home-experience/stages/observe/time-field.webp",
    name: "time-field.jpeg",
    meta: "320x180",
    x: "27vw",
    y: "21vh",
    width: 264,
    height: 149,
  },
  {
    src: "/images/channels/tech-cover.svg",
    name: "tech-signal.svg",
    meta: "182x227",
    x: "14vw",
    y: "-17vh",
    width: 188,
    height: 227,
  },
  {
    src: "/home-experience/stages/observe/ideas-card.webp",
    name: "voice-sample.png",
    meta: "260x160",
    x: "-17vw",
    y: "27vh",
    width: 236,
    height: 145,
  },
  {
    src: "/home-experience/stages/observe/body-shadow.webp",
    name: "body-shadow.png",
    meta: "210x156",
    x: "-31vw",
    y: "11vh",
    width: 210,
    height: 156,
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
