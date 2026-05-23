// src/components/features/Scrollytelling/PhaseIndicator.jsx
"use client";
import React from 'react';
import { cn } from '@/lib/utils';

export const PhaseIndicator = ({
    number,
    label,
    isActive,
    isCompleted,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex items-center gap-3 transition-all duration-300 min-w-fit pr-4",
                isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            )}
        >
            {/* Square Container (0px radius) */}
            <div className={cn(
                "relative flex items-center justify-center w-10 h-10 font-mono text-sm border transition-all duration-500",
                isActive
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-surface)] scale-100'
                    : 'border-[var(--theme-outline-variant)] text-[var(--theme-outline)] scale-90',
                isCompleted && 'border-solid border-[var(--theme-primary)]/50 text-[var(--theme-primary)] bg-[var(--theme-primary)]/5'
            )}>
                {number}

                {/* Active Ping Effect - Also Square */}
                {isActive && (
                    <span className="absolute -inset-1 border border-[var(--theme-primary)]/30 animate-pulse"></span>
                )}
            </div>

            {/* Label Text */}
            <div className="flex flex-col items-start">
                <span className={cn(
                    "text-sm font-medium tracking-wide",
                    isActive ? 'text-[var(--theme-primary)] font-bold' : 'text-[var(--theme-outline)]'
                )}>
                    {label}
                </span>
            </div>

            {/* Connector Line */}
            {isActive && (
                <div className="hidden sm:block h-px w-8 bg-[var(--theme-primary)]/20 ml-2"></div>
            )}
        </button>
    );
};
