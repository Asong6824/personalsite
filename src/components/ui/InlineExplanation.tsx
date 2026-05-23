"use client";

import { useState, useId } from "react";

/**
 * 一个内联组件，用于高亮显示一个关键词（其子元素）。
 * 当点击该关键词时，会在下方以块级形式显示详细的解释说明。
 * @param {object} props
 * @param {React.ReactNode} props.children - 需要高亮并可点击的内联文本/关键词。
 * @param {React.ReactNode} props.explanation - 点击后显示的详细说明内容。
 */
export function InlineExplanation({ children, explanation }) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const contentId = `explanation-${id}`;

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <span
        onClick={toggleOpen}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleOpen()}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="text-blue-600 dark:text-blue-400 underline decoration-dotted cursor-pointer hover:text-blue-800 dark:hover:text-blue-300
    font-semibold"
      >
        {children}
      </span>
      {isOpen && (
        <span id={contentId} className="block my-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-blue-500 rounded-r-lg">
          {explanation}
        </span>
      )}
    </>
  );
}