// src/components/features/Scrollytelling/Visuals.jsx
import React from 'react';
import { Cpu, Layout, Database, ArrowUpRight } from 'lucide-react';

// 占位视觉 - 后续替换为各频道动态内容
export const TechVisual = () => (
    <div className="w-full h-full bg-[var(--theme-surface-low)] border border-[var(--theme-outline-variant)] p-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(var(--theme-outline-variant)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-[var(--theme-primary)] text-[var(--theme-surface)] flex items-center justify-center mx-auto mb-6 shadow-none border border-[var(--theme-outline-variant)]">
                <Cpu size={48} />
            </div>
            <h3 className="serifFont text-3xl font-bold mb-2 text-[var(--theme-ink)]">技术</h3>
            <p className="text-[var(--theme-outline)] font-mono text-sm tracking-wide">Golang / 系统设计</p>
        </div>
    </div>
);

export const CreativeVisual = () => (
    <div className="w-full h-full bg-[var(--theme-surface)] border border-[var(--theme-outline-variant)] p-8 flex flex-col">
        <div className="border-b border-[var(--theme-outline-variant)] pb-4 mb-6 flex justify-between items-center">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--theme-outline)]">创意</h4>
            <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#84816a] opacity-40"></div>
                <div className="w-2 h-2 bg-[#84816a] opacity-40"></div>
                <div className="w-2 h-2 bg-[#84816a] opacity-40"></div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-[var(--theme-surface-low)] p-4 border border-[var(--theme-outline-variant)] group hover:border-[var(--theme-primary)] transition-colors">
                <Layout className="mb-3 text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)]" />
                <h5 className="font-bold text-sm mb-1 text-[var(--theme-ink)]">设计美学</h5>
                <p className="text-xs text-[var(--theme-outline)] font-mono">视觉与交互</p>
            </div>
            <div className="bg-[var(--theme-surface-low)] p-4 border border-[var(--theme-outline-variant)] group hover:border-[var(--theme-primary)] transition-colors">
                <Database className="mb-3 text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)]" />
                <h5 className="font-bold text-sm mb-1 text-[var(--theme-ink)]">产品思维</h5>
                <p className="text-xs text-[var(--theme-outline)] font-mono">从概念到落地</p>
            </div>
            <div className="bg-[var(--theme-surface-low)] p-4 border border-[var(--theme-outline-variant)] group hover:border-[var(--theme-primary)] transition-colors">
                <Cpu className="mb-3 text-[var(--theme-outline)] group-hover:text-[var(--theme-primary)]" />
                <h5 className="font-bold text-sm mb-1 text-[var(--theme-ink)]">工具工作流</h5>
                <p className="text-xs text-[var(--theme-outline)] font-mono">效率即创造力</p>
            </div>
        </div>
    </div>
);

export const LifeVisual = () => (
    <div className="w-full h-full bg-[#0f0e08] text-[#a09d92] p-6 font-mono text-sm flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 border-b border-[#a09d92]/30 pb-2">
            <span className="text-xs">life — journal — 80x24</span>
        </div>
        <div className="space-y-4 z-10">
            <div>
                <span className="text-[#a09d92]">➜</span> <span>~</span> cd blog/life
            </div>
            <div>
                <span className="text-[#a09d92]">➜</span> <span>life</span> ls -la
            </div>
            <div className="pl-4">
                <p>drwxr-xr-x  japan/</p>
                <p>drwxr-xr-x  thoughts/</p>
                <p>drwxr-xr-x  misc/</p>
            </div>
            <div>
                <span className="text-[#a09d92]">➜</span> <span>life</span> cat 2025-summary.md
            </div>
            <div className="text-[#fef9e9] pl-4">
                <p>年度回顾 | 2025</p>
                <p>✓ 日本生活持续中</p>
            </div>
        </div>
    </div>
);

export const FinanceVisual = () => (
    <div className="w-full h-full flex items-center justify-center relative bg-[var(--theme-surface-low)]">
        <div className="absolute inset-0 bg-[radial-gradient(var(--theme-outline-variant)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        <div className="bg-[var(--theme-surface-highest)] p-8 max-w-sm w-full border border-[var(--theme-outline)] relative z-10">
            <h3 className="serifFont text-3xl font-bold mb-6 text-[var(--theme-ink)]">金融</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between group border-b border-[var(--theme-outline-variant)] pb-2">
                    <span className="font-mono text-sm tracking-wide text-[var(--theme-outline)]">方法论</span>
                    <span className="font-medium flex items-center gap-2 group-hover:text-[var(--theme-primary)] transition-colors text-[var(--theme-ink)]">
                        投资体系 <ArrowUpRight size={14} className="opacity-50" />
                    </span>
                </div>
                <div className="flex items-center justify-between group border-b border-[var(--theme-outline-variant)] pb-2">
                    <span className="font-mono text-sm tracking-wide text-[var(--theme-outline)]">市场</span>
                    <span className="font-medium flex items-center gap-2 group-hover:text-[var(--theme-primary)] transition-colors text-[var(--theme-ink)]">
                        数据观察 <ArrowUpRight size={14} className="opacity-50" />
                    </span>
                </div>
            </div>

            <div className="w-full mt-8 bg-[var(--theme-primary)] text-[var(--theme-surface)] py-3 font-mono text-sm flex items-center justify-center gap-2">
                认知变现，耐心致胜
            </div>
        </div>
    </div>
);

export const VISUALS = {
    tech: TechVisual,
    creative: CreativeVisual,
    life: LifeVisual,
    finance: FinanceVisual
};
