"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CHANNELS_CONFIG } from '@/lib/channels';
import { ColumnTimeline } from '@/components/ui/ColumnTimeline';

export default function ColumnsPageClient({ allColumnsData }) {
    const [selectedChannel, setSelectedChannel] = useState('all');
    
    // 频道主题配置
    const channelThemes = {
        all: {
            background: 'bg-site-canvas',
            title: 'text-site-neutral-900 dark:text-site-stone-50',
            filterBg: 'bg-site-stone-200/80 dark:bg-site-slate-800/80',
            activeButton: 'bg-site-ink text-site-canvas',
            timelineBg: 'bg-site-canvas',
            cardBg: 'bg-site-stone-200 dark:bg-site-slate-900'
        },
        tech: {
            background: 'bg-site-canvas',
            title: 'text-site-ink',
            filterBg: 'bg-site-stone-200/80',
            activeButton: 'bg-site-ink text-site-canvas',
            timelineBg: 'bg-site-canvas',
            cardBg: 'bg-site-stone-200'
        },
        life: {
            background: 'bg-site-canvas',
            title: 'text-site-ink',
            filterBg: 'bg-site-stone-200/80',
            activeButton: 'bg-site-blue-700 text-site-stone-50',
            timelineBg: 'bg-site-canvas',
            cardBg: 'bg-site-stone-200'
        },
        finance: {
            background: 'bg-site-canvas',
            title: 'text-site-neutral-900',
            filterBg: 'bg-site-stone-200/80 dark:bg-site-slate-800/80',
            activeButton: 'bg-site-lime-700 text-site-stone-50',
            timelineBg: 'bg-site-canvas',
            cardBg: 'bg-site-lime-50 dark:bg-site-slate-800'
        },
        create: {
            background: 'bg-site-canvas',
            title: 'text-site-ink',
            filterBg: 'bg-site-stone-200/80',
            activeButton: 'bg-site-violet-700 text-site-stone-50',
            timelineBg: 'bg-site-canvas',
            cardBg: 'bg-site-stone-200'
        }
    };
    
    const currentTheme = channelThemes[selectedChannel] || channelThemes.all;
    
    // 获取所有频道信息
    const allChannels = [
        {
            key: 'all',
            name: '全部频道',
            description: '查看所有频道的专栏',
            columns: allColumnsData.length
        },
        ...Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
            key,
            name: config.name,
            description: config.description,
            columns: allColumnsData.filter(col => col.channelKey === key).length
        }))
    ];
    
    // 根据选中的频道筛选数据
    const filteredColumns = selectedChannel === 'all' 
        ? allColumnsData 
        : allColumnsData.filter(col => col.channelKey === selectedChannel);
    
    // 按文章数量分组
    const groupedData = {};
    filteredColumns.forEach(column => {
        const count = column.articleCount;
        if (!groupedData[count]) {
            groupedData[count] = [];
        }
        groupedData[count].push(column);
    });
    
    // 转换为时间轴数据格式
    const timelineData = Object.keys(groupedData)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .map(count => ({
            articleCount: parseInt(count),
            columns: groupedData[count]
        }));
    

    
    return (
        <div className={`min-h-screen ${currentTheme.background}`}>
            <div className="container mx-auto px-4 py-12 pt-28">
                {/* 页面标题和频道筛选器 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-2"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold ${currentTheme.title} mb-4`}>
                        全部专栏
                    </h1>
                    <p className="text-lg text-site-stone-600 dark:text-site-slate-300 mb-8">
                        按文章数量展示的专栏时间轴
                    </p>
                    
                    {/* 频道筛选器 - 按钮组 */}
                    <div className="flex justify-center">
                        <div className={`flex flex-wrap gap-3 p-2 ${currentTheme.filterBg} backdrop-blur-sm border border-site-stone-300 dark:border-site-slate-700 rounded-xl shadow-lg`}>
                            {allChannels.map((channel) => (
                                <button
                                    key={channel.key}
                                    onClick={() => setSelectedChannel(channel.key)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        channel.key === selectedChannel
                                            ? `${currentTheme.activeButton} shadow-md`
                                            : 'text-site-stone-700 dark:text-site-slate-300 hover:bg-site-stone-100 dark:hover:bg-site-slate-700'
                                    }`}
                                >
                                    {channel.name}
                                    <span className="ml-2 text-xs opacity-75">
                                        ({channel.columns})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
                
                {/* 专栏时间轴 */}
                <ColumnTimeline data={timelineData} theme={currentTheme} />
            </div>
        </div>
    );
}
