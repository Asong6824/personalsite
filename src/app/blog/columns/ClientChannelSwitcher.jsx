"use client";
import React, { useState } from 'react';
import { CHANNELS_CONFIG } from '@/lib/channels';
import ColumnLayout from '@/components/features/ColumnLayout';

function getDefaultChannelKey() {
    return Object.keys(CHANNELS_CONFIG)[0];
}

export default function ClientChannelSwitcher({ serverPosts }) {
    const [activeChannel, setActiveChannel] = useState(getDefaultChannelKey());
    const channelConfig = CHANNELS_CONFIG[activeChannel];
    const columns = Object.entries(channelConfig.columns);

    return (
        <div className={`min-h-screen transition-colors duration-500`} style={{ background: channelConfig.bgColor || undefined }}>
            <div className="flex gap-4 justify-center pt-12 pb-8">
                {Object.entries(CHANNELS_CONFIG).map(([key, config]) => (
                    <button
                        key={key}
                        className={`px-6 py-2 rounded-full font-semibold border transition-colors duration-300 ${activeChannel === key ? 'bg-primary text-white' : 'bg-white text-gray-800 border-gray-300'}`}
                        style={activeChannel === key && config.bgColor ? { background: config.bgColor, color: '#fff' } : {}}
                        onClick={() => setActiveChannel(key)}
                    >
                        {config.name}
                    </button>
                ))}
            </div>
            <div className="container mx-auto px-4 pb-16">
                {columns.map(([columnKey, columnConfig]) => {
                    const posts = serverPosts[activeChannel]?.[columnKey] || [];
                    return (
                        <div key={columnKey} className="mb-12">
                            <ColumnLayout
                                channelKey={activeChannel}
                                channelConfig={channelConfig}
                                columnKey={columnKey}
                                columnConfig={columnConfig}
                                posts={posts}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}