"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const ColumnTimeline = ({
  data,
  theme
}) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end end"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  
  // 根据主题获取时间轴渐变色
  const getTimelineGradient = () => {
    if (theme?.activeButton?.includes('#141413')) {
      return 'bg-gradient-to-t from-[#141413] via-[#68645d] to-transparent';
    }
    if (theme?.activeButton?.includes('#81d8d0')) {
      return 'bg-gradient-to-t from-teal-500 via-teal-400 to-transparent';
    }
    if (theme?.activeButton?.includes('yellow')) {
      return 'bg-gradient-to-t from-yellow-500 via-amber-500 to-transparent';
    }
    if (theme?.activeButton?.includes('#506354')) {
      return 'bg-gradient-to-t from-[#506354] via-[#747878] to-transparent';
    }
    return 'bg-gradient-to-t from-purple-500 via-blue-500 to-transparent';
  };

  return (
    <div
      className={`w-full ${theme?.timelineBg || 'bg-white dark:bg-neutral-950'} font-sans md:px-10`}
      ref={containerRef}>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-8">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            <div
              className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div
                className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div
                  className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3
                className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 font-mono tabular-nums">
                {item.articleCount}篇
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3
                className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500 font-mono tabular-nums">
                {item.articleCount}篇文章
              </h3>
              <div className="space-y-6">
                {item.columns && item.columns.map((column, colIndex) => (
                  <Link key={colIndex} href={column.href} className="group block">
                    <div className={`${theme?.cardBg || 'bg-white dark:bg-neutral-900'} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${column.cover ? 'md:flex block' : 'block'}`}>
                      {/* 有封面时的布局 */}
                      {column.cover ? (
                        <>
                          {/* 专栏封面图片区域 - 桌面端左侧16:9，移动端顶部 */}
                          <div className="md:w-1/2 w-full aspect-video relative">
                            <Image
                              src={column.cover}
                              alt={column.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          {/* 专栏信息区域 - 桌面端右侧16:9，移动端底部 */}
                          <div className="md:w-1/2 w-full md:aspect-video p-4 md:p-6 flex flex-col justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 line-clamp-2">
                                {column.name}
                              </h4>
                              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 line-clamp-3 md:line-clamp-4 leading-relaxed">
                                {column.description}
                              </p>
                            </div>
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">{column.articleCount || 0} 篇文章</span>
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                                  ['技术', '生活', '创造'].includes(column.channel)
                                    ? 'bg-[#F0EEE7] text-[#141413]'
                                    : column.channel === '金融'
                                      ? 'bg-[#E2DBCE] text-[#506354]'
                                      : 'bg-[#E2DBCE] text-[#141413]'
                                }`}>
                                  {column.channel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* 无封面时的布局 - 只显示文本，保持相同高度 */
                        <div className="aspect-video p-6 md:p-8 flex flex-col justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 line-clamp-2">
                              {column.name}
                            </h4>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 line-clamp-4 md:line-clamp-6 leading-relaxed">
                              {column.description}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium">{column.articleCount || 0} 篇文章</span>
                              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                                ['技术', '生活', '创造'].includes(column.channel)
                                  ? 'bg-[#F0EEE7] text-[#141413]'
                                  : column.channel === '金融'
                                    ? 'bg-[#E2DBCE] text-[#506354]'
                                    : 'bg-[#E2DBCE] text-[#141413]'
                              }`}>
                                {column.channel}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] ">
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className={`absolute inset-x-0 top-0 w-[2px] ${getTimelineGradient()} from-[0%] via-[10%] rounded-full`} />
        </div>
      </div>
    </div>
  );
};
