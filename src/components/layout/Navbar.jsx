// src/components/layout/Navbar.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
// import { useRouter } from 'next/navigation'; // 可选，用于更复杂的导航后操作

// 1. 更新 navLinks 数组，添加 type 并修正 href
const navLinks = [
    { label: '首页', href: '/#hero', type: 'scroll' }, // 使用 /#hero 格式确保从任何页面都能跳转
    { label: '关于我', href: '/#about', type: 'scroll' },
    { label: '技术栈', href: '/#programmer-details', type: 'scroll' },
    { label: '足迹', href: '/#footprints', type: 'scroll' },
    { label: '博客', href: '/blog', type: 'page' },     // 明确为页面链接到 /blog
    // { label: '联系我', href: '#contact', type: 'scroll' }, // 如果需要可以加回来
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
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
            // 如果当前就在主页 (pathname === '/')，则平滑滚动
            if (window.location.pathname === '/') {
                e.preventDefault();
                const targetId = href.startsWith('/#') ? href.substring(1) : href; // 获取 #sectionId
                scrollToSection(targetId);
            }
            // 如果不在主页，让 Next.js Link 组件处理导航到 /#sectionId
            // Link 会自动导航到主页并定位到对应的锚点
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
    // 检查是否在技术详情页或生活频道页
    const isTechPage = pathname?.startsWith('/blog/tech') || pathname?.startsWith('/blog/technology');
    const isLifePage = pathname?.startsWith('/blog/life');
    
    const navBackgroundClass = isScrolled || isMobileMenuOpen
        ? (isTechPage ? "backdrop-blur-md shadow-lg" : "bg-card/80 dark:bg-card/90 backdrop-blur-md shadow-lg") // 技术页面使用特殊背景
        : (isTechPage ? "" : "bg-transparent");

    const textClassBase = "transition-colors duration-200 cursor-pointer";
    const textScrolledClass = isScrolled || isMobileMenuOpen
        ? (isTechPage ? "text-foreground" : isLifePage ? "text-white hover:text-white/80" : "text-foreground hover:text-primary")
        : (isTechPage ? "text-foreground" : isLifePage ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"); // 生活页面使用白色文字

    const navLinkHoverBgClass = isScrolled || isMobileMenuOpen 
        ? (isTechPage ? "" : isLifePage ? "hover:bg-white/10" : "hover:bg-muted/50") 
        : (isTechPage ? "" : isLifePage ? "hover:bg-white/10" : "hover:bg-accent/10 dark:hover:bg-accent/20");

    const mobileMenuBgClass = "bg-card/95 dark:bg-card/95 backdrop-blur-md"; // 移动菜单背景

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${navBackgroundClass}`}
            style={isTechPage ? { backgroundColor: '#f8f1ee' } : {}}
        >
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
                                className={`block px-3 py-2 rounded-md text-base font-medium ${textClassBase} ${isLifePage ? 'text-white hover:text-white/80 hover:bg-white/10' : 'text-foreground'} ${isTechPage ? '' : isLifePage ? '' : 'hover:text-primary hover:bg-muted/50'}`}
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