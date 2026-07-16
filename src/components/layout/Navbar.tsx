// src/components/layout/Navbar.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import { NAV_LINKS } from './navLinks';

const NAVBAR_LINKS = NAV_LINKS.filter((linkItem) => linkItem.href !== '/');

function NavPendingIndicator({ active }: { active: boolean }) {
    const { pending } = useLinkStatus();

    return (
        <span
            aria-hidden="true"
            className="site-nav-pending-dot"
            data-pending={pending || active}
        />
    );
}

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const pathname = usePathname();
    const shouldReduceMotion = useReducedMotion();
    const { scrollY } = useScroll();

    const activeHref = useMemo(() => {
        const matchingLinks = NAVBAR_LINKS
            .filter((linkItem) => pathname === linkItem.href || pathname.startsWith(`${linkItem.href}/`))
            .sort((a, b) => b.href.length - a.href.length);

        return matchingLinks[0]?.href ?? null;
    }, [pathname]);

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    useEffect(() => {
        if (!pendingHref) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setPendingHref(null);
        }, 5000);

        return () => window.clearTimeout(timeout);
    }, [pendingHref]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 80) {
            setHidden(true);
            setIsMobileMenuOpen(false);
        } else {
            setHidden(false);
        }
    });

    const scrollToSection = (sectionIdWithHash: string) => {
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

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setIsMobileMenuOpen(false);
        if (window.location.pathname === '/') {
            e.preventDefault();
            scrollToSection('#hero');
            setPendingHref(null);
            return;
        }

        setPendingHref('/');
    };

    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, type: string) => {
        setIsMobileMenuOpen(false);

        if (type === 'scroll') {
            if (window.location.pathname === '/') {
                e.preventDefault();
                const targetId = href.startsWith('/#') ? href.substring(1) : href;
                scrollToSection(targetId);
                setPendingHref(null);
                return;
            }
        }

        if (href !== pathname) {
            setPendingHref(href);
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: hidden ? "-100%" : "0%" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="site-navbar fixed top-0 left-0 right-0 z-50 bg-transparent"
            >
                <div className="w-full px-8 sm:px-10 lg:px-16 xl:px-24">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0">
                            <Link
                                href="/"
                                onClick={handleLogoClick}
                                className="text-2xl font-bold text-[var(--site-nav-ink)] transition-colors duration-200 hover:text-[var(--site-nav-muted)] cursor-pointer"
                            >
                                大盈若冲
                            </Link>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-1">
                                {NAVBAR_LINKS.map((linkItem) => {
                                    const isActive = activeHref === linkItem.href;
                                    const isPending = pendingHref === linkItem.href;

                                    return (
                                        <Link
                                            key={linkItem.label}
                                            href={linkItem.href}
                                            onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                            className="site-nav-link px-3 py-2 rounded-md text-lg font-medium cursor-pointer"
                                            data-active={isActive}
                                            data-pending={isPending}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <span>{linkItem.label}</span>
                                            <NavPendingIndicator active={isPending} />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="site-nav-link p-2 rounded-md inline-flex items-center justify-center"
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

                <AnimatePresence initial={false}>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                            className="md:hidden bg-[#F0EEE7]/95 backdrop-blur-md border-b border-[var(--site-nav-border)]"
                            id="mobile-menu"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                {NAVBAR_LINKS.map((linkItem) => {
                                    const isActive = activeHref === linkItem.href;
                                    const isPending = pendingHref === linkItem.href;

                                    return (
                                        <Link
                                            key={linkItem.label}
                                            href={linkItem.href}
                                            onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                            className="site-nav-link w-full px-3 py-2 rounded-md text-base font-medium"
                                            data-active={isActive}
                                            data-pending={isPending}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <span>{linkItem.label}</span>
                                            <NavPendingIndicator active={isPending} />
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
};

export default Navbar;
