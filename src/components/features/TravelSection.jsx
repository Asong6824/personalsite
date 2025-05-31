// src/components/features/TravelStoriesSection.jsx
"use client"; // 由于 CardDemo 的 JSX (如果包含交互或特定客户端渲染逻辑) 和 Link 组件，最好标记

import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils"; // CardDemo 的 JSX 可能使用了 cn
import NextImage from "next/image"; // CardDemo 的 JSX 使用了 img，我们将其升级为 NextImage

// 默认作者信息 (这些应该是您自己的信息)
const SITE_AUTHOR_NAME = "您的名字"; // 替换为您的名字
const SITE_AUTHOR_AVATAR = "/images/avatars/default-avatar.png"; // 您的默认头像，确保路径正确

// 示例旅行数据 (确保 image 路径有效)
const travelExperiences = [
    {
        id: "kyoto-2023",
        title: "古寺巡礼",
        location: "日本，京都",
        description: "沉浸在京都宁静的古寺与日式庭院之美中，感受千年古都的禅意与历史底蕴。",
        image: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Kyoto/kyoto_arashiyama_maple.jpg", // 替换为您的图片路径
        date: "2023年11月",
        link: "/blog/kyoto-travel-story",
    },
    {
        id: "tokyo-2025",
        title: "都市探险",
        location: "日本，东京",
        description: "漫步于东京繁华街头之间，感受现代都市的多元活力与无尽可能",
        image: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Tokyo/tokyo_station.jpg",
        date: "2025年3月",
    },
    {
        id: "hokkaido-2025",
        title: "雪国光影",
        location: "日本，北海道",
        description: "徜徉在北海道辽阔的雪原与静谧的温泉乡中，感受北国纯净自然的气息与四季分明的独特魅力。",
        image: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Hokkaido/hokkaido_zeribako_sea.jpg",
        date: "2025年5月",
    },
];


export default function TravelSection() {
    return (
        <section id="travel-stories" className="py-16 md:py-24 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        旅行记忆
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        每一次出发，都是对世界新的探索与发现。
                    </p>
                </div>

                {travelExperiences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch justify-items-center">
                        {travelExperiences.map((experience) => {
                            // 为每张卡片动态设置背景图片
                            const cardStyle = {
                                backgroundImage: `url(${experience.image})`,
                            };

                            // 这是直接嵌入的、基于您提供的 CardDemo 修改的 JSX 结构
                            const cardInternalContent = (
                                <div className="max-w-xs w-full group/card"> {/* CardDemo 的外层 group */}
                                    <div
                                        style={cardStyle}
                                        className={cn(
                                            "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl",
                                            "bg-cover bg-center",
                                            "flex flex-col justify-between p-4"
                                        )}
                                    >
                                        {/* 遮罩层 */}
                                        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60 z-0"></div>

                                        {/* 顶部作者信息 */}
                                        <div className="flex flex-row items-center space-x-3 z-10 relative">

                                            <div className="flex flex-col">

                                                {/* 显示地点和日期 */}
                                                <p className="text-sm text-gray-300 relative">
                                                    {experience.location} - {experience.date}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 底部内容 */}
                                        <div className="relative z-10">
                                            <h3 className="font-bold text-xl md:text-2xl text-gray-50 relative">
                                                {experience.title}
                                            </h3>
                                            {experience.description && (
                                                <p className="font-normal text-sm text-gray-50 relative my-4 max-h-20 overflow-hidden text-ellipsis">
                                                    {experience.description.substring(0,100) + (experience.description.length > 100 ? "..." : "")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );

                            // 如果有链接，则整个卡片可点击
                            return experience.link ? (
                                <Link
                                    href={experience.link.startsWith('/') ? experience.link : `/blog/${experience.link}`}
                                    key={experience.id}
                                    className="block h-full"
                                >
                                    {cardInternalContent}
                                </Link>
                            ) : (
                                <div key={experience.id} className="h-full flex justify-center">
                                    {cardInternalContent}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">暂无旅行故事分享。</p>
                )}
            </div>
        </section>
    );
}