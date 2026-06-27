// src/components/features/Scrollytelling/constants.jsx
import { ReactNode } from 'react';

export const SECTIONS = [
    {
        id: 'tech',
        stepNumber: '01',
        title: '技术',
        subtitle: 'Tech',
        description: '代码即表达，技术为创造服务',
        subPoints: [
            { label: 'Golang', text: '系统设计' }
        ],
        status: '持续学习中',
        href: '/blog/tech'
    },
    {
        id: 'creative',
        stepNumber: '02',
        title: '创意',
        subtitle: 'Creative',
        description: '设计是一种解决问题的思维方式',
        subPoints: [
            { label: '设计美学', text: '像素与逻辑的交汇' },
            { label: '产品思维', text: '从概念到落地' },
            { label: '工具工作流', text: '效率即创造力' }
        ],
        status: '探索中',
        href: '/blog/creative'
    },
    {
        id: 'life',
        stepNumber: '03',
        title: '生活',
        subtitle: 'Life',
        description: '体验即财富，过程即意义',
        subPoints: [
            { label: '日本行纪', text: '2023-2025 的在地生活' },
            { label: '年度回顾', text: '每一年都是成长' },
            { label: '杂记', text: '日常的碎片思考' }
        ],
        status: '认真记录中',
        href: '/blog/life'
    },
    {
        id: 'finance',
        stepNumber: '04',
        title: '金融',
        subtitle: 'Finance',
        description: '认知变现，耐心致胜',
        subPoints: [
            { label: '投资方法论', text: '穿越周期的体系' },
            { label: '市场观察', text: '数据驱动的判断' }
        ],
        status: '修炼中',
        href: '/blog/finance'
    }
];
