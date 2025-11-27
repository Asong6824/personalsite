"use client";

import { useState, useEffect } from 'react';

/**
 * 目录组件 - 基于页面中的标题生成可点击的目录
 */
export function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // 获取页面中所有的标题元素
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingData = Array.from(headingElements).map((heading, index) => {
      // 清理标题文本，移除末尾的#符号
      let cleanText = heading.textContent.trim();
      if (cleanText.endsWith('#')) {
        cleanText = cleanText.slice(0, -1).trim();
      }

      return {
        id: heading.id || `heading-${index}`,
        text: cleanText,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading
      };
    });

    // 去重：基于text和level的组合去重，保留第一个出现的
    const uniqueHeadings = headingData.filter((heading, index, array) => {
      return array.findIndex(h => h.text === heading.text && h.level === heading.level) === index;
    });

    // 过滤掉空标题
    const filteredHeadings = uniqueHeadings.filter(heading => heading.text.length > 0);

    setHeadings(filteredHeadings);

    // 设置 Intersection Observer 来跟踪当前可见的标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    headingElements.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      headingElements.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, []);

  const handleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // 获取元素的位置
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      // 设置navbar高度偏移量（通常navbar高度约为64px，再加上一些间距）
      const navbarOffset = 80; // 64px navbar + 16px 间距
      // 计算目标滚动位置
      const targetPosition = elementPosition - navbarOffset;

      // 平滑滚动到目标位置
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="pl-4 border-l border-neutral-200 dark:border-neutral-800">
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          目录
        </h3>
        <ul className="space-y-2 text-xs"> {/* Changed to text-xs (12px) */}
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const paddingLeft = `${(heading.level - 2) * 0.5}rem`; // Reduced indentation

            return (
              <li key={`${heading.id}-${index}`}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`
                    block w-full text-left transition-colors duration-200 border-l-2 -ml-[17px] pl-[13px]
                    ${isActive
                      ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-medium'
                      : 'border-transparent text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }
                  `}
                  style={{ paddingLeft: `calc(${paddingLeft} + 13px)` }} // Adjust padding to account for the border alignment
                  title={heading.text}
                >
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{heading.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}