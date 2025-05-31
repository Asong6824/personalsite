// src/components/features/AboutMeSection.jsx
"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel"; // 确保路径正确
import { scrollToSection } from '@/lib/scrollUtils';
import { RainbowButton } from "@/components/magicui/rainbow-button"; // 确保路径正确

// IdentityCardContent 子组件
const IdentityCardContent = ({ title, description, targetId, imageUrl }) => {
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
                    onClick={() => scrollToSection(targetId)}
                    // size="lg" // RainbowButton 可能没有 size prop，或您需要自定义
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
        targetId: '#programmer-details',
        content: (
            <IdentityCardContent
                title="深入代码世界"
                description="作为一名程序员，我热衷于用代码解决复杂问题，构建高效、可扩展的应用程序，并持续探索前沿技术。"
                targetId="#programmer-details"
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
        targetId: '#traveler-details',
        content: (
            <IdentityCardContent
                title="体验多元文化"
                description="作为一名旅行爱好者，我相信行万里路能开阔视野、丰富人生。我享受探索未知，体验不同的文化和风景。"
                targetId="#traveler-details"
                imageUrl="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop"
            />
        ),
    },
];

export function AboutMeSection() {
    const cards = identityData.map((cardData, index) => (
        <Card key={cardData.id} card={cardData} index={index} />
    ));

    return (
        // section 的背景会从 body 或父级继承，通常是 --background
        // 如果需要特定背景，可以设置 bg-background 或 bg-secondary 等
        <section id="about" className="py-16 md:py-24"> {/* 移除了内联的背景色，使其依赖全局样式 */}
            <div className="container mx-auto px-4"> {/* 添加 container 和水平 padding */}
                <h2
                    // 使用全局定义的前景颜色
                    className="max-w-7xl mx-auto text-3xl md:text-5xl font-bold text-foreground font-sans mb-10 md:mb-16 text-center"
                >
                    关于我
                </h2>
                {/* Carousel 组件本身可能也需要一些样式调整以适应主题 */}
                <Carousel items={cards} />
            </div>
        </section>
    );
}

export default AboutMeSection;