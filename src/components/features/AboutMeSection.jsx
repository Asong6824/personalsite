// src/components/features/AboutMeSection.jsx
"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import { Carousel, Card } from "@/components/ui/apple-cards-carousel"; // 确保路径正确
import { scrollToSection } from '@/lib/scrollUtils';
import { RainbowButton } from "@/components/magicui/rainbow-button"; // 确保路径正确
import Image from "next/image";
import { BookShelf } from "./BookShelf3D/BookShelf";

// IdentityCardContent 子组件
const IdentityCardContent = ({ title, description, targetId, imageUrl }) => {
    const router = useRouter();
    return (
        // 使用全局定义的卡片背景和前景颜色
        <div className="bg-card text-card-foreground p-8 md:p-10 rounded-3xl mb-4 shadow-lg dark:shadow-neutral-700/50">
            <h3 className="text-xl md:text-3xl font-bold text-center mb-4"> {/* 文本颜色继承自父级的 text-card-foreground */}
                {title}
            </h3>
            {/* 使用柔和的前景文本颜色 */}
            <p className="text-muted-foreground text-base md:text-lg font-sans max-w-2xl mx-auto mb-6 text-center">
                {description}
            </p>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`${title} illustration`}
                    className="md:w-1/3 md:h-1/3 h-auto w-2/3 mx-auto object-contain mb-6 rounded-lg"
                />
            )}
            <div className="text-center">
                {/* RainbowButton 使用全局定义的主色和主色前景 */}
                <RainbowButton
                    onClick={() => {
                        if (targetId?.startsWith('#')) {
                            scrollToSection(targetId);
                        } else if (targetId) {
                            router.push(targetId);
                        }
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/80 dark:text-primary-foreground px-6 py-2.5 text-base font-medium" // 示例尺寸和字体样式
                >
                    查看详情 &rarr;
                </RainbowButton>
            </div>
        </div>
    );
};

// 身份数据 (保持不变)
const identityData = [
    {
        id: 'programmer',
        category: "程序员",
        title: "代码构建世界",
        src: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
        targetId: '/blog/tech',
        content: (
            <IdentityCardContent
                title="深入代码世界"
                description="作为一名程序员，我热衷于用代码解决复杂问题，构建高效、可扩展的应用程序，并持续探索前沿技术。"
                targetId="/blog/tech"
                imageUrl="https://assets.aceternity.com/macbook.png"
            />
        ),
    },
    {
        id: 'trader',
        category: "交易者",
        title: "市场洞察机遇",
        src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
        targetId: '#trader-details',
        content: (
            <IdentityCardContent
                title="驾驭市场波动"
                description="在金融市场的世界里，我运用数据分析和策略思维进行交易，旨在发现价值并管理风险。"
                targetId="#trader-details"
                imageUrl="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop"
            />
        ),
    },
    {
        id: 'traveler',
        category: "旅行家",
        title: "探索无垠视界",
        src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
        targetId: '/blog/life',
        content: (
            <IdentityCardContent
                title="体验多元文化"
                description="作为一名旅行爱好者，我相信行万里路能开阔视野、丰富人生。我享受探索未知，体验不同的文化和风景。"
                targetId="/blog/life"
                imageUrl="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop"
            />
        ),
    },
];

// 经历概览组件：左侧工作/教育经历，右侧个人照片
const workExperiences = [
    { period: "2025 - 至今", company: "作业帮", title: "Senior Staff Designer", description: "Senior Staff Designer at Meta Superintelligence Labs." },
];

const educationExperiences = [
    { period: "2021 - 2025", school: "大连理工大学", degree: "学位/专业" },
    { period: "2023 - 2025", school: "立命馆大学", degree: "学士学位" },
];

const normalizePeriod = (period) => period.replace(/\s*-\s*/g, ' – ');

const ExperienceOverview = () => {
    return (
        <div className="mb-10">
            <div className="grid grid-cols-12 gap-x-12 gap-y-12 p-8 md:p-10 items-start justify-items-center">
                {/* 左侧：经历 */}
                <div className="col-span-12 md:col-span-6 flex justify-center">
                    <div className="w-full max-w-[640px] rounded-2xl bg-card/50 shadow-sm p-6 md:p-8">
                        <div className="grid grid-cols-[12ch,1fr] md:grid-cols-[16ch,1fr] gap-x-8 md:gap-x-12 gap-y-6">
                            <h3 className="col-span-2 text-2xl md:text-3xl font-bold">工作经历</h3>
                            {workExperiences.map((item, idx) => (
                                <React.Fragment key={`work-${idx}`}>
                                    <span className="text-muted-foreground tabular-nums font-mono whitespace-nowrap leading-6">{normalizePeriod(item.period)}</span>
                                    <div>
                                        <p className="font-semibold min-w-0 truncate text-left leading-6">{item.company}</p>
                                        <p className="text-muted-foreground text-sm md:text-base leading-6">{item.description}</p>
                                    </div>
                                </React.Fragment>
                            ))}
                            <h3 className="col-span-2 text-2xl md:text-3xl font-bold">教育经历</h3>
                            {educationExperiences.map((item, idx) => (
                                <React.Fragment key={`edu-${idx}`}>
                                    <span className="text-muted-foreground tabular-nums font-mono whitespace-nowrap leading-6">{normalizePeriod(item.period)}</span>
                                    <div>
                                        <p className="font-semibold min-w-0 truncate text-left leading-6">{item.school}</p>
                                        <p className="text-muted-foreground text-sm md:text-base leading-6">{item.degree}{item.description ? ` — ${item.description}` : ''}</p>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 右侧：照片 */}
                <div className="col-span-12 md:col-span-6 flex justify-center">
                    <div className="w-full max-w-[640px] rounded-2xl bg-card/50 shadow-sm p-6 md:p-8 md:sticky md:top-24">
                        <div className="relative rounded-2xl overflow-hidden bg-muted/20 w-full aspect-[3/4] min-h-[240px]">
                            <img
                                src="https://blog-assets-asong.tos-cn-beijing.volces.com/personalsite/personalphoto.JPG"
                                alt="个人照片"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.currentTarget.src = "/placeholder-image.svg"; }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function AboutMeSection() {
    const cards = identityData.map((cardData, index) => (
        <Card key={cardData.id} card={cardData} index={index} />
    ));

    return (
        <>
            <section id="about" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <h2
                        className="max-w-7xl mx-auto text-3xl md:text-5xl font-bold text-foreground font-sans mb-10 md:mb-16 text-center"
                    >
                        关于我
                    </h2>
                    {/* <ExperienceOverview /> */}
                    {/* Carousel 组件本身可能也需要一些样式调整以适应主题 */}
                    <Carousel items={cards} />
                </div>
            </section>

            <section id="bookshelf" className="w-full relative bg-[#f2f2f2] dark:bg-[#0c0c0c]">
                <div className="absolute top-12 left-0 right-0 z-10 pointer-events-none">
                    <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white font-sans text-center">
                        书籍收藏
                    </h2>
                    <p className="text-center text-neutral-500 mt-2 max-w-2xl mx-auto">
                        沉浸式的思考空间
                    </p>
                </div>
                <BookShelf />
            </section>
        </>
    );
}

export default AboutMeSection;