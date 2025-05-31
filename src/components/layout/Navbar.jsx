// src/components/layout/Navbar.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
// import { useRouter } from 'next/navigation'; // 可选，用于更复杂的导航后操作

// 1. 更新 navLinks 数组，添加 type 并修正 href
const navLinks = [
    { label: '首页', href: '#hero', type: 'scroll' }, // 假设 #hero 在主页
    { label: '关于我', href: '#about', type: 'scroll' },
    { label: '技术栈', href: '#programmer-details', type: 'scroll' },
    { label: '足迹', href: '#footprints', type: 'scroll' }, // 修正 href, 假设 #footprints 在主页
    { label: '博客', href: '/blog', type: 'page' },     // 明确为页面链接到 /blog
    // { label: '联系我', href: '#contact', type: 'scroll' }, // 如果需要可以加回来
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // const router = useRouter(); // 如果需要用 router.push

    // 平滑滚动到指定区域的函数
    const scrollToSection = (sectionIdWithHash) => {
        const sectionId = sectionIdWithHash.startsWith('#') ? sectionIdWithHash : `#${sectionIdWithHash}`;
        const sectionElement = document.querySelector(sectionId);

        if (sectionElement) {
            const navbarHeight = document.querySelector('nav')?.offsetHeight || 80;
            const sectionTop = sectionElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        } else {
            console.warn(`Scroll target section with ID "${sectionId}" not found on current page.`);
        }
    };

    // 2. 更新 Logo 点击事件处理
    const handleLogoClick = (e) => {
        setIsMobileMenuOpen(false);
        // Logo 的 href 通常是 '/' 或直接 '#hero'（如果网站主要是单页）
        // 这里假设 href="/" 指向主页的顶部/Hero区域
        if (window.location.pathname === '/') { // 如果当前就在主页
            e.preventDefault(); // 阻止 Link 的默认导航（如果它会做全页刷新）
            scrollToSection('#hero'); // 平滑滚动到 #hero
        }
        // 如果不在主页，Link href="/" 会自动导航到主页，浏览器会处理URL（如果后面有#hash则定位）
        // 此时 e.preventDefault() 不应被调用，让 Link 组件工作
    };

    // 3. 更新导航链接点击事件处理
    const handleNavLinkClick = (e, href, type) => {
        setIsMobileMenuOpen(false);

        if (type === 'scroll') {
            const targetId = href.startsWith('/#') ? href.substring(1) : href; // 获取 #sectionId

            // 如果当前就在主页 (pathname === '/')，则平滑滚动
            if (window.location.pathname === '/') {
                e.preventDefault();
                scrollToSection(targetId);
            } else {
                // 如果不在主页，但链接是 /#hash 形式，我们希望 Link 组件导航到主页
                // 然后浏览器会自动尝试滚动到该哈希位置。
                // Next.js 的 <Link href="/#someId"> 会处理这个导航。
                // 这里不需要 e.preventDefault()。
                // 注意：从其他页面跳转回主页的哈希链接的“平滑”滚动，
                // 可能需要目标页面（主页）的 useEffect 监听哈希变化来实现，
                // 或者接受浏览器默认的“跳转到锚点”行为。
                // 为简化，此处不阻止默认行为，让 Link 和浏览器处理。
                if (!href.startsWith('/#')) {
                    // 如果是纯 #hash (e.g. href="#about") 且不在主页，这个滚动可能不会按预期工作
                    // 因为它会在当前页面 (e.g. /blog) 寻找 #about。
                    // 因此，对于要从任何页面都能链接到的主页区域，href 应为 /#sectionId
                    console.warn(`Trying to scroll to "${targetId}" from "${window.location.pathname}". Ensure target exists on this page or link href is "/${targetId}".`);
                    // 为了安全，如果不是 /# 开头且不在主页，也阻止默认行为并尝试滚动（可能失败）
                    // 或者这里应该让 Link 直接导航到 href (如果 href 是 /#sectionId)
                    e.preventDefault();
                    scrollToSection(targetId); // 这行在非主页上对纯 #hash 效果不佳
                }
                // 如果 href 是 /#sectionId，则 Link 会导航，不需要 e.preventDefault()
            }
        }
        // 对于 type === 'page' (例如 href="/blog")，不执行 e.preventDefault()
        // Link 组件会处理页面跳转
    };


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // 4. 应用全局样式 (使用 CSS 变量对应的 Tailwind 类)
    const navBackgroundClass = isScrolled || isMobileMenuOpen
        ? "bg-card/80 dark:bg-card/90 backdrop-blur-md shadow-lg" // 使用卡片背景，增加暗色模式透明度
        : "bg-transparent";

    const textClassBase = "transition-colors duration-200 cursor-pointer";
    const textScrolledClass = isScrolled || isMobileMenuOpen
        ? "text-foreground hover:text-primary"
        : "text-foreground hover:text-primary"; // 在透明背景时，前景文字也应清晰

    const navLinkHoverBgClass = isScrolled || isMobileMenuOpen ? "hover:bg-muted/50" : "hover:bg-accent/10 dark:hover:bg-accent/20";

    const mobileMenuBgClass = "bg-card/95 dark:bg-card/95 backdrop-blur-md"; // 移动菜单背景

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${navBackgroundClass}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link
                            href="/" // Logo 指向主页根路径
                            onClick={handleLogoClick}
                            className={`text-2xl font-bold ${textClassBase} ${textScrolledClass.replace('hover:text-primary', 'hover:text-primary/80')}`} // Logo 悬停效果可以略微不同
                        >
                            阿松
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1"> {/* 减少间距，让padding生效 */}
                            {navLinks.map((linkItem) => (
                                <Link
                                    key={linkItem.label}
                                    href={linkItem.href}
                                    onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                    className={`px-3 py-2 rounded-md text-lg font-medium ${textClassBase} ${textScrolledClass} ${navLinkHoverBgClass}`}
                                >
                                    {linkItem.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className={`p-2 rounded-md inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring ${textClassBase} ${textScrolledClass.replace('hover:text-primary', '')} ${navLinkHoverBgClass}`}
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <Cross1Icon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HamburgerMenuIcon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className={`md:hidden ${mobileMenuBgClass}`} id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((linkItem) => (
                            <Link
                                key={linkItem.label}
                                href={linkItem.href}
                                onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${textClassBase} text-foreground hover:text-primary hover:bg-muted/50`}
                            >
                                {linkItem.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;