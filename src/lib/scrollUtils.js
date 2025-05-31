// src/lib/scrollUtils.js
export const scrollToSection = (sectionId, navbarHeight = 80) => { // 默认 Navbar 高度为 80px
    if (typeof window !== "undefined") {
        const elementId = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
        const section = document.querySelector(elementId);
        if (section) {
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth',
            });
        } else {
            console.warn(`Scroll target section with ID "${elementId}" not found.`);
        }
    }
};