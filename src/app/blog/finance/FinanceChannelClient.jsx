"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CHANNELS_CONFIG } from '@/lib/channels';

// 动态导入Globe组件，禁用SSR
const World = dynamic(() => import('@/components/ui/globe').then(mod => ({ default: mod.World })), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#002FA7]/10 via-[#002FA7]/10 to-[#002FA7]/10 rounded-3xl">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 animate-pulse">
                    <span className="text-2xl font-bold text-[#002FA7]">Globe</span>
                </div>
                <p className="text-gray-600 text-sm">加载地球仪...</p>
            </div>
        </div>
    )
});

const globeConfig = {
    pointSize: 6,
    globeColor: "#002FA7",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#002FA7",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.9)",
    ambientLight: "#002FA7",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
};

const sampleArcs = [
    {
        order: 1,
        startLat: -19.885592,
        startLng: -43.951191,
        endLat: -22.9068,
        endLng: -43.1729,
        arcAlt: 0.1,
        color: "#FFD700",
    },
    {
        order: 1,
        startLat: 28.6139,
        startLng: 77.2090,
        endLat: 3.139,
        endLng: 101.6869,
        arcAlt: 0.2,
        color: "#FFD700",
    },
    {
        order: 1,
        startLat: -19.885592,
        startLng: -43.951191,
        endLat: -1.303396,
        endLng: 36.852443,
        arcAlt: 0.5,
        color: "#FFD700",
    },
    {
        order: 2,
        startLat: 1.3521,
        startLng: 103.8198,
        endLat: 35.6762,
        endLng: 139.6503,
        arcAlt: 0.2,
        color: "#FFD700",
    },
    {
        order: 2,
        startLat: 51.5072,
        startLng: -0.1276,
        endLat: 3.139,
        endLng: 101.6869,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 2,
        startLat: -15.785493,
        startLng: -47.909029,
        endLat: 36.162809,
        endLng: -115.119411,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 3,
        startLat: -33.8688,
        startLng: 151.2093,
        endLat: 22.3193,
        endLng: 114.1694,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 3,
        startLat: 21.3099,
        startLng: -157.8581,
        endLat: 40.7128,
        endLng: -74.0060,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 3,
        startLat: -6.2088,
        startLng: 106.8456,
        endLat: 51.5072,
        endLng: -0.1276,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 4,
        startLat: 11.986597,
        startLng: 8.571831,
        endLat: -15.595412,
        endLng: -56.05918,
        arcAlt: 0.5,
        color: "#FFD700",
    },
    {
        order: 4,
        startLat: -34.6037,
        startLng: -58.3816,
        endLat: 22.3193,
        endLng: 114.1694,
        arcAlt: 0.7,
        color: "#FFD700",
    },
    {
        order: 4,
        startLat: 51.5072,
        startLng: -0.1276,
        endLat: 48.8566,
        endLng: 2.3522,
        arcAlt: 0.1,
        color: "#FFD700",
    },
    {
        order: 5,
        startLat: 14.5995,
        startLng: 120.9842,
        endLat: 51.5072,
        endLng: -0.1276,
        arcAlt: 0.3,
        color: "#FFD700",
    },
    {
        order: 5,
        startLat: 1.3521,
        startLng: 103.8198,
        endLat: -33.8688,
        endLng: 151.2093,
        arcAlt: 0.2,
        color: "#FFD700",
    },
    {
        order: 5,
        startLat: 34.0522,
        startLng: -118.2437,
        endLat: 48.8566,
        endLng: 2.3522,
        arcAlt: 0.2,
        color: "#FFD700",
    },
];

export default function FinanceChannelClient() {
    const channelConfig = CHANNELS_CONFIG['finance'];

    return (
        <>
            {/* Hero Section - 上方左右布局 */}
            <section className="relative min-h-[100vh] flex items-center justify-center py-20 md:py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
                        {/* 左侧：金融频道描述 */}
                        <div className="flex flex-col justify-center text-center lg:text-left space-y-6 lg:space-y-8 lg:pl-16">
                            <div className="space-y-4 lg:space-y-6">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-800 leading-tight">
                                    <span className="bg-gradient-to-r from-[#002FA7] to-[#002FA7] bg-clip-text text-transparent">
                                        {channelConfig.name}
                                    </span>
                                    <span className="block text-gray-700 mt-2">频道</span>
                                </h1>
                                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-600 leading-relaxed font-medium">
                                    智慧投资，理性决策
                                </p>
                            </div>
                            <p className="text-lg md:text-xl lg:text-2xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                {channelConfig.description}
                            </p>
                            
                        </div>

                        {/* 右侧：地球仪 */}
                        <div className="flex justify-center items-center">
                            <div className="w-full max-w-2xl aspect-square">
                                <Suspense fallback={
                                    <div className="w-full h-full bg-gradient-to-br from-[#002FA7]/10 to-[#002FA7]/5 rounded-2xl flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002FA7] mx-auto mb-4"></div>
                                            <p className="text-gray-600">加载地球仪中...</p>
                                        </div>
                                    </div>
                                }>
                                    <World data={sampleArcs} globeConfig={globeConfig} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 精选专栏 */}
            <section className="py-12 md:py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            精选专栏
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            深入探索金融投资领域，分享实战经验与市场洞察
                        </p>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        {Object.entries(channelConfig.columns).map(([columnKey, columnConfig], index) => (
                            <div
                                key={columnKey}
                                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                style={{ backgroundColor: '#e6f3ff' }}
                            >
                                <div className="flex flex-col md:flex-row h-auto md:h-64">
                                    {/* 左侧图片 */}
                                    <div className="w-full md:w-1/2 h-48 sm:h-56 md:h-full relative overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-[#002FA7]/20 to-[#002FA7]/10 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-3 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40">
                                                    <span className="text-2xl font-bold text-[#002FA7]">
                                                        专栏
                                                    </span>
                                                </div>
                                                <span className="text-gray-700 text-sm font-medium">
                                                    专栏封面占位
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 右侧内容 */}
                                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                                            {columnConfig.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            {columnConfig.description}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span>共 {columnConfig.posts?.length || 0} 篇文章</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 精选文章 */}
            <section className="py-12 md:py-16 lg:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                            精选文章
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            精心挑选的优质内容，为您提供有价值的金融见解
                        </p>
                    </div>

                    {/* 文章列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* 暂无文章提示 */}
                        <div className="col-span-full text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-gray-400 font-bold">文章</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无精选文章</h3>
                            <p className="text-gray-500">我们正在精心准备优质内容，敬请期待</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}