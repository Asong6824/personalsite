// src/components/layout/Navbar.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import { NAV_LINKS } from './navLinks';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();

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
        }
    };

    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, type: string) => {
        setIsMobileMenuOpen(false);

        if (type === 'scroll') {
            if (window.location.pathname === '/') {
                e.preventDefault();
                const targetId = href.startsWith('/#') ? href.substring(1) : href;
                scrollToSection(targetId);
            }
        }
    };

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{ y: hidden ? "-100%" : "0%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-transparent"
        >
            <div className="w-full px-8 sm:px-10 lg:px-16 xl:px-24">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            onClick={handleLogoClick}
                            className="text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors duration-200 cursor-pointer"
                        >
                            大盈若冲
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1">
                            {NAV_LINKS.map((linkItem) => (
                                <Link
                                    key={linkItem.label}
                                    href={linkItem.href}
                                    onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                    className="px-3 py-2 rounded-md text-lg font-medium text-foreground hover:text-primary hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors duration-200 cursor-pointer"
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
                            className="p-2 rounded-md inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring text-foreground hover:text-primary hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors duration-200"
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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
                    id="mobile-menu"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {NAV_LINKS.map((linkItem) => (
                            <Link
                                key={linkItem.label}
                                href={linkItem.href}
                                onClick={(e) => handleNavLinkClick(e, linkItem.href, linkItem.type)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors duration-200"
                            >
                                {linkItem.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
