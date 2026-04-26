# 首页 Scrollytelling 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 创建 ScrollytellingSection 组件，替换首页 AboutMeSection、FootprintsSection、ActiveDaysSection、RecentPosts，保留 HeroSection。

**架构:** 左右分栏布局，左侧叙事内容带 PhaseIndicator 导航，右侧视觉区域 sticky 显示。四个 section 对应四个频道（tech、create、life、finance），使用 IntersectionObserver 检测滚动位置。

**技术栈:** Next.js 15 App Router, Tailwind CSS v4, framer-motion

---

## 文件结构

```
src/components/features/Scrollytelling/
├── ScrollytellingSection.jsx    # 主组件，管理滚动和状态
├── PhaseIndicator.jsx           # 顶部阶段指示器
├── Visuals.jsx                 # 右侧视觉区域（占位）
└── constants.jsx               # 四个频道的配置数据

待修改:
src/app/page.js                # 移除 AboutMeSection 等，添加 ScrollytellingSection
```

---

## Task 1: 创建 constants.jsx

**Files:**
- Create: `src/components/features/Scrollytelling/constants.jsx`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p src/components/features/Scrollytelling
```

- [ ] **Step 2: 编写 constants.jsx**

```javascript
// src/components/features/Scrollytelling/constants.jsx
import { ReactNode } from 'react';

export const SECTIONS = [
    {
        id: 'tech',
        stepNumber: '01',
        title: '技术',
        subtitle: 'Tech',
        description: '代码即表达，技术为创造服务',
        subPoints: [
            { label: 'Golang', text: '系统设计' }
        ],
        status: '持续学习中',
        href: '/blog/tech'
    },
    {
        id: 'create',
        stepNumber: '02',
        title: '创造',
        subtitle: 'Create',
        description: '设计是一种解决问题的思维方式',
        subPoints: [
            { label: '设计美学', text: '像素与逻辑的交汇' },
            { label: '产品思维', text: '从概念到落地' },
            { label: '工具工作流', text: '效率即创造力' }
        ],
        status: '探索中',
        href: '/blog/create'
    },
    {
        id: 'life',
        stepNumber: '03',
        title: '生活',
        subtitle: 'Life',
        description: '体验即财富，过程即意义',
        subPoints: [
            { label: '日本行纪', text: '2023-2025 的在地生活' },
            { label: '年度回顾', text: '每一年都是成长' },
            { label: '杂记', text: '日常的碎片思考' }
        ],
        status: '认真记录中',
        href: '/blog/life'
    },
    {
        id: 'finance',
        stepNumber: '04',
        title: '金融',
        subtitle: 'Finance',
        description: '认知变现，耐心致胜',
        subPoints: [
            { label: '投资方法论', text: '穿越周期的体系' },
            { label: '市场观察', text: '数据驱动的判断' }
        ],
        status: '修炼中',
        href: '/blog/finance'
    }
];
```

- [ ] **Step 3: 提交**

```bash
git add src/components/features/Scrollytelling/constants.jsx
git commit -m "feat: add Scrollytelling constants with four channels config"
```

---

## Task 2: 创建 PhaseIndicator.jsx

**Files:**
- Create: `src/components/features/Scrollytelling/PhaseIndicator.jsx`

- [ ] **Step 1: 编写 PhaseIndicator.jsx**

```javascript
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
            {/* Circle Container */}
            <div className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm border transition-all duration-500",
                isActive
                    ? 'border-primary bg-primary text-white scale-100'
                    : 'border-gray-300 border-dashed text-gray-500 scale-90',
                isCompleted && 'border-solid border-primary/50 text-primary bg-primary/5'
            )}>
                {number}

                {/* Active Ping Effect */}
                {isActive && (
                    <span className="absolute -inset-1 rounded-full border border-primary/30 animate-pulse"></span>
                )}
            </div>

            {/* Label Text */}
            <div className="flex flex-col items-start">
                <span className={cn(
                    "text-sm font-medium tracking-wide",
                    isActive ? 'text-primary font-bold' : 'text-gray-500'
                )}>
                    {label}
                </span>
            </div>

            {/* Connector Line */}
            {isActive && (
                <div className="hidden sm:block h-px w-8 bg-primary/20 ml-2"></div>
            )}
        </button>
    );
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/features/Scrollytelling/PhaseIndicator.jsx
git commit -m "feat: add PhaseIndicator component for scrollytelling navigation"
```

---

## Task 3: 创建 Visuals.jsx（占位内容）

**Files:**
- Create: `src/components/features/Scrollytelling/Visuals.jsx`

- [ ] **Step 1: 编写 Visuals.jsx（占位内容）**

```javascript
// src/components/features/Scrollytelling/Visuals.jsx
import React from 'react';
import { Cpu, Layout, Database, ArrowUpRight } from 'lucide-react';

// 占位视觉 - 后续替换为各频道动态内容
export const TechVisual = () => (
    <div className="w-full h-full bg-[#F3F4F1] border border-dashed border-gray-300 p-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Cpu size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-2">技术</h3>
            <p className="text-gray-500 font-mono text-sm">Golang / 系统设计</p>
        </div>
    </div>
);

export const CreateVisual = () => (
    <div className="w-full h-full bg-white border border-gray-200 p-8 shadow-sm flex flex-col">
        <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <h4 className="font-mono text-xs uppercase text-gray-400">创造</h4>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-gray-50 p-4 rounded border border-gray-100 group hover:border-primary transition-colors">
                <Layout className="mb-3 text-gray-400 group-hover:text-primary" />
                <h5 className="font-bold text-sm mb-1">设计美学</h5>
                <p className="text-xs text-gray-500 font-mono">视觉与交互</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-100 group hover:border-primary transition-colors">
                <Database className="mb-3 text-gray-400 group-hover:text-primary" />
                <h5 className="font-bold text-sm mb-1">产品思维</h5>
                <p className="text-xs text-gray-500 font-mono">从概念到落地</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-100 group hover:border-primary transition-colors">
                <Cpu className="mb-3 text-gray-400 group-hover:text-primary" />
                <h5 className="font-bold text-sm mb-1">工具工作流</h5>
                <p className="text-xs text-gray-500 font-mono">效率即创造力</p>
            </div>
        </div>
    </div>
);

export const LifeVisual = () => (
    <div className="w-full h-full bg-[#1e1e1e] text-gray-300 p-6 rounded-lg font-mono text-sm shadow-2xl flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
            <span className="text-xs text-gray-500">life — journal — 80x24</span>
        </div>
        <div className="space-y-4 z-10">
            <div>
                <span className="text-green-500">➜</span> <span className="text-blue-400">~</span> cd blog/life
            </div>
            <div>
                <span className="text-green-500">➜</span> <span className="text-blue-400">life</span> ls -la
            </div>
            <div className="text-gray-500 pl-4">
                <p>drwxr-xr-x  japan/</p>
                <p>drwxr-xr-x  thoughts/</p>
                <p>drwxr-xr-x  misc/</p>
            </div>
            <div>
                <span className="text-green-500">➜</span> <span className="text-blue-400">life</span> cat 2025-summary.md
            </div>
            <div className="text-white pl-4">
                <p>年度回顾 | 2025</p>
                <p className="text-green-400">✓ 日本生活持续中</p>
            </div>
        </div>
    </div>
);

export const FinanceVisual = () => (
    <div className="w-full h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        <div className="bg-white p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(15,31,24,1)] border-2 border-primary relative z-10">
            <h3 className="text-3xl font-bold mb-6">金融</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between group border-b border-gray-100 pb-2">
                    <span className="font-mono text-sm text-gray-500">方法论</span>
                    <span className="font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
                        投资体系 <ArrowUpRight size={14} />
                    </span>
                </div>
                <div className="flex items-center justify-between group border-b border-gray-100 pb-2">
                    <span className="font-mono text-sm text-gray-500">市场</span>
                    <span className="font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
                        数据观察 <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>

            <div className="w-full mt-8 bg-primary text-white py-3 font-mono text-sm flex items-center justify-center gap-2">
                认知变现，耐心致胜
            </div>
        </div>
    </div>
);

export const VISUALS = {
    tech: TechVisual,
    create: CreateVisual,
    life: LifeVisual,
    finance: FinanceVisual
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/features/Scrollytelling/Visuals.jsx
git commit -m "feat: add placeholder Visuals components for scrollytelling"
```

---

## Task 4: 创建 ScrollytellingSection.jsx

**Files:**
- Create: `src/components/features/Scrollytelling/ScrollytellingSection.jsx`

- [ ] **Step 1: 编写 ScrollytellingSection.jsx**

```javascript
// src/components/features/Scrollytelling/ScrollytellingSection.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS } from './constants';
import { PhaseIndicator } from './PhaseIndicator';
import { VISUALS } from './Visuals';

const ScrollytellingSection = () => {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const sectionRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                root: null,
                rootMargin: '-40% 0px -40% 0px',
                threshold: 0
            }
        );

        SECTIONS.forEach((section) => {
            const el = sectionRefs.current[section.id];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id) => {
        const el = sectionRefs.current[id];
        if (el) {
            const offset = 160;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const activeSectionData = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
    const VisualComponent = VISUALS[activeSection];

    return (
        <section className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row">

                {/* Left Column: Narrative Content */}
                <div className="w-full md:w-1/2 relative border-r border-dashed border-gray-200">

                    {/* Phase Indicators - Sticky */}
                    <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur-sm border-b border-dashed border-gray-200 py-4 px-6 md:px-12 transition-all">
                        <div className="flex items-center justify-start gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                            {SECTIONS.map((section, index) => {
                                const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                                const isCompleted = index < currentIndex;

                                return (
                                    <PhaseIndicator
                                        key={section.id}
                                        number={section.stepNumber}
                                        label={section.title}
                                        isActive={section.id === activeSection}
                                        isCompleted={isCompleted}
                                        onClick={() => scrollToSection(section.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrollable Text Sections */}
                    {SECTIONS.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            ref={el => sectionRefs.current[section.id] = el}
                            className="min-h-[80vh] flex flex-col justify-center px-6 py-20 md:py-24 md:px-12 lg:px-20 border-b border-dashed border-gray-200 last:border-0 relative"
                        >
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-px w-8 bg-primary/40"></div>
                                    <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">{section.subtitle}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                                    {section.title}
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed font-light">
                                    {section.description}
                                </p>
                                <p className="text-sm text-gray-400 mt-2 font-mono">
                                    {section.status}
                                </p>
                            </div>

                            {/* Sub-points */}
                            <div className="space-y-6 mt-8">
                                {section.subPoints.map((point, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex items-baseline gap-4 mb-2">
                                            <span className="text-xs font-mono text-gray-400 group-hover:text-primary transition-colors">
                                                {section.stepNumber}.{idx + 1}
                                            </span>
                                            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-800">{point.label}</h4>
                                        </div>
                                        <p className="text-gray-500 text-sm pl-8 md:pl-10 border-l border-gray-200 group-hover:border-primary/30 transition-colors">
                                            {point.text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA for last section */}
                            {section.id === 'finance' && (
                                <div className="mt-12 text-center">
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-mono text-sm hover:bg-primary/90 transition-colors"
                                    >
                                        进入频道探索更多 <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* Right Column: Visual Context (Sticky) - Hidden on mobile */}
                <div className="hidden md:block w-1/2 relative">
                    <div className="sticky top-[73px] h-[calc(100vh-73px)] w-full p-8 lg:p-12 overflow-hidden flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full max-h-[600px]"
                            >
                                {VisualComponent && <VisualComponent />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ScrollytellingSection;
```

- [ ] **Step 2: 提交**

```bash
git add src/components/features/Scrollytelling/ScrollytellingSection.jsx
git commit -m "feat: add ScrollytellingSection component with four channels"
```

---

## Task 5: 修改 src/app/page.js

**Files:**
- Modify: `src/app/page.js`

- [ ] **Step 1: 查看当前 page.js**

当前内容:
```javascript
import HeroSection from '@/components/features/HeroSection';
import AboutMeSection from '@/components/features/AboutMeSection';
import RecentPosts from "@/components/features/RecentPosts";
import FootprintsSection from "@/components/features/FootprintsSection";
import { getSortedPostsData } from "@/lib/post";
import ActiveDaysSection from "@/components/features/ActiveDaysSection";

export default function HomePage() {
    const allPosts = getSortedPostsData();
    const recentPostsData = allPosts.slice(0, 3);
    return (
        <>
            <section id="hero">
                <HeroSection />
            </section>
            <AboutMeSection />
            <FootprintsSection />
            <ActiveDaysSection />
            <RecentPosts posts={recentPostsData} />
        </>
    );
}
```

- [ ] **Step 2: 修改为新内容**

```javascript
import HeroSection from '@/components/features/HeroSection';
import ScrollytellingSection from '@/components/features/Scrollytelling/ScrollytellingSection';

export default function HomePage() {
    return (
        <>
            <section id="hero">
                <HeroSection />
            </section>
            <ScrollytellingSection />
        </>
    );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/page.js
git commit -m "feat: replace about/footprints/activeDays/RecentPosts with ScrollytellingSection"
```

---

## Task 6: 验证实现

**Files:**
- None (testing)

- [ ] **Step 1: 运行 lint 检查**

```bash
npm run lint
```

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 3: 验证内容**
- 打开 http://localhost:3000
- 确认 HeroSection 显示正常
- 向下滚动确认 ScrollytellingSection 显示四个频道
- 点击 PhaseIndicator 确认可以跳转
- 确认最后一个频道底部有 CTA 按钮
- 确认暗色模式正常

---

## 实施检查清单

- [ ] constants.jsx 已创建
- [ ] PhaseIndicator.jsx 已创建
- [ ] Visuals.jsx 已创建（占位内容）
- [ ] ScrollytellingSection.jsx 已创建
- [ ] page.js 已修改
- [ ] lint 检查通过
- [ ] 开发服务器运行正常
- [ ] 四个频道内容正确显示
- [ ] PhaseIndicator 导航正常工作
- [ ] CTA 按钮正常显示
