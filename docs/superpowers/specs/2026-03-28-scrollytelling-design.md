# 首页 Scrollytelling 设计规范

**日期**: 2026-03-28
**状态**: 已批准

## 概述

将 Google AI Studio 设计的 narrative-portfolio.zip 滑动叙事体验适配到个人网站首页，保留现有 HeroSection，替换 AboutMeSection、FootprintsSection、ActiveDaysSection、RecentPosts 等内容区域。

## 设计目标

- 用四个频道（tech、create、life、finance）替代原有的 Origins/Craft/Work/Vision 叙事
- 最终引导用户进入各频道页面
- 复用现有的 Tailwind CSS v4 和暗色模式支持

## 内容结构

### 四个频道配置

| ID | 名称 | 编号 | 哲学 | 子点 |
|----|------|------|------|------|
| tech | 技术 | 01 | 代码即表达，技术为创造服务 | Golang / 系统设计 |
| create | 创造 | 02 | 设计是一种解决问题的思维方式 | 设计美学 / 产品思维 / 工具工作流 |
| life | 生活 | 03 | 体验即财富，过程即意义 | 日本行纪 / 年度回顾 / 杂记 |
| finance | 金融 | 04 | 认知变现，耐心致胜 | 投资方法论 / 市场观察 |

### 状态说明

- tech: 持续学习中
- create: 探索中
- life: 认真记录中
- finance: 修炼中

## 组件架构

### 文件结构

```
src/components/features/Scrollytelling/
├── ScrollytellingSection.jsx    # 主组件
├── PhaseIndicator.jsx           # 阶段指示器
├── Visuals.jsx                  # 右侧视觉区域（占位）
└── constants.jsx                # 频道配置数据
```

### 数据流

```
SECTIONS (constants.jsx)
    ↓
ScrollytellingSection.jsx (useState: activeSection)
    ↓
┌─────────────────────────────────────────┐
│  左侧: PhaseIndicator + 各 Section 内容  │
│  右侧: Visuals (根据 activeSection 切换)  │
└─────────────────────────────────────────┘
```

## 布局设计

### 桌面端 (md+)

- 全宽布局
- 左侧 50%: 叙事内容 + PhaseIndicator
- 右侧 50%: 视觉区域（sticky）
- 每个 section 最小高度: 80vh
- 右侧视觉区域 sticky 高度: calc(100vh - 73px)

### 移动端

- 单列布局
- 视觉区域隐藏
- 每个 section 最小高度: 80vh
- PhaseIndicator 横向滚动

## 交互设计

### 滚动检测

- 使用 IntersectionObserver
- rootMargin: '-40% 0px -40% 0px'（触发区为屏幕中间 20%）
- threshold: 0
- 当 section 可见度 > 50% 时更新 activeSection

### PhaseIndicator

- 显示编号 (01-04) 和频道名称
- 当前 section: 实心圆角边框 + 填充色
- 非当前 section: 虚线边框 + 半透明
- 已完成 section: 实线边框 + 浅色填充
- 点击可跳转到对应 section

### 视觉切换动画

- 使用 framer-motion
- 动画: fadeInScale
- 时长: 0.6s
- 缓动: cubic-bezier(0.16, 1, 0.3, 1)

### CTA 按钮

- 位置: 最后一个 section（金融）底部
- 文字: "进入频道探索更多"
- 图标: 箭头
- 样式: 居中显示
- 点击: 跳转到 /blog

## 样式规范

### 颜色

- 使用现有 CSS 变量: primary, accent, muted, background 等
- 网格线: dashed-grid (现有 CSS 变量)
- 画布色: canvas (现有 CSS 变量)

### 字体

- 标题: font-bold, text-3xl md:text-4xl
- 副标题: font-mono, text-xs, uppercase, tracking-widest
- 正文: text-lg, text-gray-600, font-light
- 子点标签: text-xs, font-bold, uppercase
- 子点内容: text-sm, text-gray-500

### 间距

- 左侧内容区 padding: px-6 py-20 md:py-24 md:px-12 lg:px-20
- section 分隔线: border-dashed border-gray-200

## 技术实现要点

### 样式适配

- 使用 tailwindcss/typography 的 prose 样式
- 暗色模式: 使用 dark: 前缀
- 复用现有的 cn() 工具函数

### 动画

- framer-motion（已安装）
- 自定义 CSS keyframes: grow, fadeInScale

### 导航栏

- 保留现有 Navbar
- Scrollytelling 不包含独立 header
- sticky 定位从 top: 73px 开始（Navbar 高度）

### 占位视觉

- 右侧视觉区域暂时使用 narrative-portfolio 原有设计
- 后续可替换为各频道的动态内容（最新文章、封面图等）

## 页面集成

### 修改 src/app/page.js

```jsx
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

## 待后续迭代

- [ ] 右侧视觉区域替换为动态内容（最新文章卡片）
- [ ] 移动端视觉区域设计
- [ ] 各频道页的视觉一致性优化
