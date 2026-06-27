import React from "react";
import { Metadata } from "next";
import HomeExperienceClient from "@/components/home/HomeExperienceClient";
import { SITE_WARM_BACKGROUND } from "@/lib/site-theme";

export const metadata: Metadata = {
    title: "大盈若冲 | 阿松的个人主页",
    description: "阿松的个人主页：技术、创作、生活与投资记录。",
    openGraph: {
        title: "大盈若冲 | 阿松的个人主页",
        description: "阿松的个人主页：技术、创作、生活与投资记录。",
    },
};

export default function HomePage() {
    return (
        <main
            className="min-h-screen w-full text-slate-900 overflow-x-hidden"
            style={{ backgroundColor: SITE_WARM_BACKGROUND }}
        >
            <HomeExperienceClient />
        </main>
    );
}
