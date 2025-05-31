// src/components/features/identity/ProgrammerDetails.jsx
"use client"; // Aceternity UI 组件通常包含客户端动画或交互

import React from 'react';
// 确保路径与您项目中 Aceternity UI 组件的实际位置匹配
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
// 引入图标库, 例如 react-icons。确保已安装: npm install react-icons
import {
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiNodedotjs,


    SiMysql,

    SiDocker,
    SiGit,
    SiTailwindcss,
    SiFigma, // 举例，如果也想展示设计工具
} from 'react-icons/si';

import {
    FaGolang,
} from 'react-icons/fa6';

import {
    TbBrandCpp,
} from 'react-icons/tb';

import {
    DiRedis,
} from 'react-icons/di';

import { IoLogoJavascript } from "react-icons/io";


import { VscCode } from "react-icons/vsc"; // 一个通用的代码图标

const TechHeader = ({ Visual, bgColor = "bg-neutral-700/80" }) => (
    <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl ${bgColor} items-center justify-center`}>
        {React.isValidElement(Visual) ? Visual : <Visual className="h-20 w-20 text-white opacity-80" />}
    </div>
);

// 定义Bento Grid中每个技术块的数据
const techItems = [
    {
        id: "frontend-main",
        title: "前端：React & Next.js",
        description: "构建高性能、可交互的用户界面和全栈Web应用",
        header: <TechHeader Visual={SiReact} bgColor="bg-sky-500/80" />, // 视觉头部
        icon: <SiNextdotjs className="h-5 w-5 text-neutral-400" />, // 小图标
        className: "md:col-span-2", // 占据两列
    },
    {
        id: "javascript",
        title: "JavaScript",
        description: "前端开发的核心",
        header: <TechHeader Visual={IoLogoJavascript} bgColor="bg-yellow-500/80" />,
        icon: <VscCode className="h-5 w-5 text-neutral-400" />,
        className: "md:col-span-1",
    },
    {
        id: "backend-nodejs",
        title: "后端：Golang",
        description: "专为构建高性能、可扩展的系统和服务而设计",
        header: <TechHeader Visual={FaGolang} bgColor="bg-blue-500/80" />,
        icon: <VscCode className="h-5 w-5 text-neutral-400" />,
        className: "md:col-span-1",
    },
    {
        id: "backend-python",
        title: "后端：C++",
        description: "广泛应用于系统开发、游戏引擎和高要求性能场景",
        header: <TechHeader Visual={TbBrandCpp} bgColor="bg-purple-500/80" />,
        icon: <VscCode className="h-5 w-5 text-neutral-400" />,
        className: "md:col-span-2",
    },
    {
        id: "devops-tools",
        title: "DevOps & 工具",
        description: "Docker容器化、AWS云服务、Git版本控制等。",
        header: (
            <div className="flex h-full w-full items-center justify-center gap-4 bg-orange-500/80 rounded-lg">
                <SiDocker className="h-12 w-12 text-white opacity-70" />
                <SiGit className="h-12 w-12 text-white opacity-70" />
            </div>
        ),
        icon: <VscCode className="h-5 w-5 text-neutral-400" />,
        className: "md:col-span-2", // 占据三列
    },
    {
        id: "databases",
        title: "数据库技术",
        description: "熟悉关系型 (MySQL) 和 NoSQL (Redis) 数据库。",
        header: ( // 组合图标示例
            (<div className="flex h-full w-full items-center justify-center gap-4 bg-red-500/80 rounded-lg">
                <SiMysql className="h-16 w-16 text-white opacity-70" />
                <DiRedis className="h-16 w-16 text-white opacity-70" />
            </div>)
        ),
        icon: <VscCode className="h-5 w-5 text-neutral-400" />,
        className: "md:col-span-1", // 调整为1，如果上方Python占2
    },
];



const ProgrammerDetails = () => {
    return (
        <section id="programmer-details">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        技术世界
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
                        以下是我常用和喜爱的技术与工具。
                    </p>
                </div>

                <BentoGrid className="max-w-none md:auto-rows-[20rem]"> {/* 可调整 auto-rows 高度 */}
                    {techItems.map((item) => (
                        <BentoGridItem
                            key={item.id}
                            title={item.title}
                            description={item.description}
                            header={item.header} // 传递 header 组件
                            icon={item.icon}     // 传递 icon 组件
                            className={item.className} // 传递 className 来控制布局
                            // 如果BentoGridItem支持onClick或者你想在内部添加可点击元素，可以在这里处理
                            // onClick={() => console.log(`${item.title} clicked`)}
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
};

export default ProgrammerDetails;