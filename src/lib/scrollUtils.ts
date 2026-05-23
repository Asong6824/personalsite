export const scrollToSection = (sectionId: string, navbarHeight = 80) => {
  if (typeof window !== "undefined") {
    const elementId = sectionId.startsWith("#") ? sectionId : `#${sectionId}`;
    const section = document.querySelector(elementId);
    if (section) {
      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    } else {
      console.warn(`Scroll target section with ID "${elementId}" not found.`);
    }
  }
};
