import { validateConfigInDevelopment } from "./config-validator";
import type { ChannelConfig, ChannelsConfig } from "@/types";

export const CHANNELS_CONFIG: ChannelsConfig = {
  tech: {
    name: "技术",
    description: "技术分享与学习笔记",
    icon: "/images/channels/tech-cover.svg",
    columns: {
      go: {
        name: "Golang 精进之路",
        description: "Go 语言相关技术文章",
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/tech/go/golang_cover.png",
      },
      general: {
        name: "通用技术",
        description: "通用技术分享",
        cover: "",
      },
      "ai-engineering": {
        name: "AI 工程",
        description: "AI 工程化、智能体、工作流与落地实践",
        cover: "",
      },
      "knowledge-management": {
        name: "知识管理",
        description: "知识组织、个人知识库与学习方法",
        cover: "",
      },
    },
  },
  life: {
    name: "生活",
    description: "生活感悟与旅行记录",
    icon: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/izu/xiuqiu_cover_1-1.jpg",
    columns: {
      japan: {
        name: "日本行纪",
        description: "以此记录 2023-2025 的日本生活",
        cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        featured: true,
      },
      thoughts: {
        name: "年度总结",
        description: "年度总结与回顾",
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Hokkaido/hakodate_hachimanzaka_cover.jpg",
      },
      misc: {
        name: "杂记",
        description: "杂记与随想",
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/matsuri/kumogawa_beer_cover.jpeg",
      },
    },
  },
  finance: {
    name: "金融",
    description: "投资交易与金融市场分析",
    icon: "/images/placeholders/default.svg",
    columns: {
      finance: {
        name: "财经投资",
        description: "财经分析与投资心得",
        cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
      },
      "investment-methodology": {
        name: "投资方法论",
        description: "投资哲学、价值投资与长期决策框架",
        cover: "",
      },
    },
  },
  creative: {
    name: "创意",
    description: "逻辑与感性的液态交汇",
    icon: "/images/placeholders/default.svg",
    columns: {
      design: {
        name: "设计美学",
        description: "像素、逻辑与美学的交汇",
        cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
        featured: true,
      },
      product: {
        name: "产品设计",
        description: "产品设计与用户体验",
        cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop",
      },
      notes: {
        name: "创意手记",
        description: "记录个人网站、视觉表达、交互想法与创作方法中的灵感和实验",
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Tokyo/tokyo_map_points_20250324_cover.png",
      },
    },
  },
};

export function getAllChannels() {
  return Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
    key,
    ...config,
  }));
}

validateConfigInDevelopment(CHANNELS_CONFIG);
