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
                <div className="bg-site-stone-200 dark:bg-site-stone-800 border border-site-stone-300 dark:border-site-stone-700 rounded-t-lg px-4 py-2 text-sm font-bold text-site-stone-600 dark:text-site-stone-400 flex items-center justify-between">
                    <span>{beforeLabel}</span>

                </div>
                <div className="flex-1 bg-site-stone-50/50 dark:bg-site-neutral-900/50 border-x border-b border-site-stone-300 dark:border-site-stone-700 rounded-b-lg p-6 overflow-hidden relative group">
                    {before}
                </div>
            </div>

            {/* After Section - High Contrast Accent */}
            <div className="flex flex-col shadow-lg shadow-site-stone-500/10 transform hover:-translate-y-1 transition-all duration-300">
                <div className="bg-site-stone-500 border border-site-stone-500 rounded-t-lg px-4 py-2 text-sm font-bold text-site-neutral-50 flex items-center justify-between">
                    <span>{afterLabel}</span>

                </div>
                <div className="flex-1 bg-site-neutral-50 dark:bg-site-neutral-900 border-x border-b border-site-stone-500 rounded-b-lg p-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-site-stone-500/5 pointer-events-none"></div>
                    {after}
                </div>
            </div>
        </div>
    );
};
