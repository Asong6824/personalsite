// src/app/page.js
import HeroSection from '@/components/features/HeroSection';
import AboutMeSection from '@/components/features/AboutMeSection';
import ProgrammerDetails from "@/components/features/ProgrammerDetails";
import RecentPosts from "@/components/features/RecentPosts";
import FootprintsSection from "@/components/features/FootprintsSection";
import TravelSection from "@/components/features/TravelSection";
import {getSortedPostsData} from "@/lib/post";
// ... 导入 ProgrammerDetails, TraderDetails, TravelerDetails 等组件或直接编写内容

// 示例身份详情组件 (与上一回答中类似)

const TraderDetails = () => (
    <section id="trader-details" className="py-16 md:py-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-emerald-400">市场洞察 (交易者)</h2>
            {/* 内容... */}
        </div>
    </section>
);


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
            <ProgrammerDetails />
            <FootprintsSection />
            <TravelSection />
            <RecentPosts posts={recentPostsData}/>

            {/* 其他区域 */}
        </>
    );
}