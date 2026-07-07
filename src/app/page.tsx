import React from "react";
import { Metadata } from "next";
import HomeExperienceClient from "@/components/home/HomeExperienceClient";
import { getSortedPostsData } from "@/lib/post";
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
    const allPosts = getSortedPostsData();
    const recentPosts = [...allPosts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    const columnPostCounts = allPosts.reduce((acc, post) => {
        const key = `${post.channel}/${post.column}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <main
            className="min-h-screen w-full text-slate-900 overflow-x-hidden"
            style={{ backgroundColor: SITE_WARM_BACKGROUND }}
        >
            <HomeExperienceClient recentPosts={recentPosts} columnPostCounts={columnPostCounts} />
        </main>
    );
}
