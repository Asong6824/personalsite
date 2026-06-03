import React from "react";
import { Metadata } from "next";
import NoomoPageClient from "@/components/noomo/NoomoPageClient";

export const metadata: Metadata = {
  title: "Noomo Agency Replicated — 3D Design & WebGL Experience",
  description:
    "An interactive 3D scrollytelling experience recreating the Noomo Agency website with Vanilla Three.js, GSAP, and WebGL.",
  openGraph: {
    title: "Noomo Agency Replicated — 3D Design & WebGL Experience",
    description:
      "An interactive 3D scrollytelling experience recreating the Noomo Agency website with Vanilla Three.js, GSAP, and WebGL.",
  },
};

export default function NoomoPage() {
  return (
    <main className="min-h-screen w-full bg-[#cad1fc] text-slate-900 overflow-x-hidden">
      <NoomoPageClient />
    </main>
  );
}
