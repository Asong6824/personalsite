import React from 'react';
import { cn } from "@/lib/utils";

export const BeforeAfter = ({
    before,
    after,
    beforeLabel = "Before",
    afterLabel = "After",
    className
}) => {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 my-8", className)}>
            {/* Before Section - Muted/Gray */}
            <div className="flex flex-col opacity-90 hover:opacity-100 transition-opacity">
                <div className="bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-t-lg px-4 py-2 text-sm font-bold text-stone-600 dark:text-stone-400 flex items-center justify-between">
                    <span>{beforeLabel}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-300">Original</span>
                </div>
                <div className="flex-1 bg-stone-50/50 dark:bg-neutral-900/50 border-x border-b border-stone-300 dark:border-stone-700 rounded-b-lg p-6 overflow-hidden relative group">
                    {before}
                </div>
            </div>

            {/* After Section - High Contrast Accent */}
            <div className="flex flex-col shadow-lg shadow-[#a18072]/10 transform hover:-translate-y-1 transition-all duration-300">
                <div className="bg-[#a18072] border border-[#a18072] rounded-t-lg px-4 py-2 text-sm font-bold text-white flex items-center justify-between">
                    <span>{afterLabel}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">Improved</span>
                </div>
                <div className="flex-1 bg-white dark:bg-neutral-900 border-x border-b border-[#a18072] rounded-b-lg p-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[#a18072]/5 pointer-events-none"></div>
                    {after}
                </div>
            </div>
        </div>
    );
};
