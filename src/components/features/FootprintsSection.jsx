// src/components/features/FootprintsSection.jsx
"use client";

import React from 'react';
// 确保这个路径是您项目中 WorldMap 组件的正确路径
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion"; // 您代码中使用的是 "motion/react"，通常 "framer-motion" 是更常见的包

// 1. 定义您的 "家" 或中心点坐标 (示例：中国上海)
const homeBase = { lat: 30.1236, lng: 122.99, name: "上海 (Home)" };

// 2. 定义您去过的地方 (名称和坐标)
const visitedPlaces = [
    { name: "东京", coordinates: { lat: 21.6895, lng: 139.6917 } },
    { name: "京阪神", coordinates: { lat: 20.6937, lng: 135.5023 } },
    { name: "北海道·东北", coordinates: { lat: 30.6937, lng: 140.5023 } },
    // ... 添加更多您去过的地方
];

// 3. 将 "去过的地方" 数据转换为 WorldMap 组件期望的 `dots` 格式 (从家出发到各地)
const mapDotsData = visitedPlaces.map(place => ({
    start: { lat: homeBase.lat, lng: homeBase.lng },
    end: { lat: place.coordinates.lat, lng: place.coordinates.lng },
    name: `${homeBase.name} → ${place.name}`, // 可选，用于调试或未来可能的标签
    // 您可以根据 WorldMap 组件支持的属性为每条弧线添加颜色、动画等
    // color: "rgba(255,255,255,0.3)", // 示例颜色
}));

// 如果您只想标记点，并且 WorldMap 组件有类似 pinsData 的 prop，那会更简单：
// const pinLocations = visitedPlaces.map(place => ({
//   lat: place.coordinates.lat,
//   lng: place.coordinates.lng,
//   label: place.name,
//   color: 'white',
//   size: 0.05, // 示例大小
// }));


export default function FootprintsSection() { // 将 WorldMapDemo 重命名为 FootprintsSection
    return (
        // id 用于 Navbar 滚动定位
        <section id="footprints" className="py-16 md:py-24 bg-background w-full">
            <div className="max-w-7xl mx-auto text-center px-4">
                <h2 className="font-bold text-xl md:text-4xl dark:text-white text-black mb-4">
                    足迹{" "}
                    <span className="text-neutral-400">
            {"探索过的世界".split("").map((char, idx) => ( // 修改了文字和变量名
                <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }} // 调整了 delay
                >
                    {char === " " ? "\u00A0" : char} {/* 处理空格 */}
                </motion.span>
            ))}
          </span>
                </h2>
                <p className="text-sm md:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto py-4">
                    那些我去过、感受过、留下回忆的城市和角落。
                </p>
            </div>

            {/* 调整地图容器的高度和样式。
        WorldMap 组件通常需要一个有明确尺寸的父容器来正确渲染。
      */}
            <div className="relative mx-auto mt-8 h-[350px] w-[90%] max-w-4xl md:h-[500px] overflow-hidden rounded-lg border bg-background md:mt-12">
                <WorldMap
                    dots={mapDotsData} // 使用我们生成的从家到各地的弧线数据
                    // 您可能需要根据 WorldMap 组件的实际 props 调整以下配置
                    // 例如：globeConfig, dotColor, arcColor, arcWidth 等
                    // backgroundColor="transparent" // 或您主题的背景色
                    // dotColor="white"
                    // dotOpacity={0.5}
                    // arcColor="white"
                    // arcOpacity={0.3}
                    // arcWidth={1}
                    // travelSpeed={0.5}
                />
            </div>

            {/* 可选：在地图下方列出一些去过的城市名称 */}
            <div className="max-w-3xl mx-auto mt-12 text-center px-4">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">已探索的区域：</p>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-3">
                    {visitedPlaces.map(place => (
                        <span key={place.name} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-xs shadow-sm">
              {place.name}
            </span>
                    ))}
                </div>
            </div>
        </section>
    );
}