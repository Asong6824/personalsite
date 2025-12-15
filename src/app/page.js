// src/app/page.js
import HeroSection from '@/components/features/HeroSection';
import AboutMeSection from '@/components/features/AboutMeSection';
import RecentPosts from "@/components/features/RecentPosts";
import FootprintsSection from "@/components/features/FootprintsSection";
import { getSortedPostsData } from "@/lib/post";
import ActiveDaysSection from "@/components/features/ActiveDaysSection";

export default function HomePage() {
    const allPosts = getSortedPostsData();
    const recentPostsData = allPosts.slice(0, 3);
    return (
        <>
            <section id="hero"> {/* Hero Section */}
                <HeroSection />
            </section>

            <AboutMeSection /> {/* 使用新的 AboutMeSection */}

            {/* 身份详情区域 */}
            <FootprintsSection />
            <ActiveDaysSection />
            <RecentPosts posts={recentPostsData} />

            {/* 其他区域 */}
        </>
    );
}