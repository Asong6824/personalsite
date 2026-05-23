"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlassCard({
    children,
    className,
    hover = true,
    glow = false,
    as: Component = 'div',
    ...props
}: {
    children?: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
    as?: any;
    [key: string]: any;
}) {
    const Tag = Component as any;
    return (
        <Tag
            className={cn(
                "relative overflow-hidden rounded-3xl",
                "bg-white/[0.03] dark:bg-white/[0.03]",
                "backdrop-blur-xl saturate-[140%]",
                "border border-white/[0.08]",
                "shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
                hover && "transition-all duration-500 ease-out",
                hover && "hover:bg-white/[0.06] hover:border-white/[0.15]",
                hover && "hover:shadow-[0_12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]",
                glow && "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/[0.1] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
                className
            )}
            {...props}
        >
            {/* Edge highlight */}
            <span
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                    padding: '1.5px',
                    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
                }}
            />
            <div className="relative z-10">{children}</div>
        </Tag>
    );
}

export function GlassCardMotion({
    children,
    className,
    index = 0,
    ...props
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
        >
            <GlassCard className={className} {...props}>
                {children}
            </GlassCard>
        </motion.div>
    );
}
