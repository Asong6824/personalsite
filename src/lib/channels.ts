import { validateConfigInDevelopment } from "./config-validator";
import type { ChannelConfig, ChannelsConfig, ColumnConfig, Post } from "@/types";

export const CHANNELS_CONFIG: ChannelsConfig = {
  tech: {
    name: "技术",
    description: "技术分享与学习笔记",
    icon: "/tech_cover.svg",
    columns: {
      go: {
        name: "Golang 精进之路",
        description: "Go 语言相关技术文章",
        tags: ["Go", "golang"],
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/tech/go/golang_cover.png",
      },
      general: {
        name: "通用技术",
        description: "通用技术分享",
        tags: ["技术", "programming", "tech"],
        cover: "",
      },
      devtools: {
        name: "开发工具",
        description: "工程工具、版本控制与开发效率实践",
        tags: ["Git", "版本控制", "工具", "devtools"],
        cover: "",
      },
      nlp: {
        name: "自然语言处理",
        description: "自然语言处理、AI 与大模型相关技术",
        tags: ["NLP", "AI", "自然语言处理", "大模型"],
        cover: "",
        featured: true,
      },
      photography: {
        name: "计算摄影",
        description: "摄影技术、移动影像与后期工作流",
        tags: ["摄影", "photography", "影像"],
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/tech/proraw-lightroom/cover.jpg",
      },
      product: {
        name: "产品设计",
        description: "产品设计与用户体验",
        tags: ["产品", "product", "设计", "UX", "UI"],
        cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop",
      },
      design: {
        name: "设计美学",
        description: "像素、逻辑与美学的交汇",
        tags: ["设计", "design", "视觉", "美学", "交互"],
        cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
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
        tags: ["日本", "japan", "日本旅行", "日本文化"],
        cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        featured: true,
      },
      thoughts: {
        name: "年度总结",
        description: "年度总结与回顾",
        tags: ["年度总结", "thoughts", "总结", "回顾"],
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/travel/Hokkaido/hakodate_hachimanzaka_cover.jpg",
      },
      misc: {
        name: "杂记",
        description: "杂记与随想",
        tags: ["杂记", "随想", "记录"],
        cover: "https://blog-assets-asong.tos-cn-beijing.volces.com/life/matsuri/kumogawa_beer_cover.jpeg",
      },
    },
  },
  finance: {
    name: "金融",
    description: "投资交易与金融市场分析",
    icon: "/placeholder-image.svg",
    columns: {
      finance: {
        name: "财经投资",
        description: "财经分析与投资心得",
        tags: ["财经", "finance", "投资", "investment"],
        cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
      },
      "investment-methodology": {
        name: "投资方法论",
        description: "投资哲学、价值投资与长期决策框架",
        tags: ["价值投资", "第一性原理", "方法论"],
        cover: "",
      },
    },
  },
  create: {
    name: "创造",
    description: "逻辑与感性的液态交汇",
    icon: "/placeholder-image.svg",
    columns: {
      design: {
        name: "设计美学",
        description: "像素、逻辑与美学的交汇",
        tags: ["设计", "design", "视觉", "美学", "交互"],
        cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
        featured: true,
      },
      product: {
        name: "产品设计",
        description: "产品设计与用户体验",
        tags: ["产品", "product", "设计", "UX", "UI"],
        cover: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop",
      },
    },
  },
};

export function getChannelByTags(
  postOrTags: Post | string[] | unknown
): string | null {
  if (
    postOrTags &&
    typeof postOrTags === "object" &&
    !Array.isArray(postOrTags)
  ) {
    const post = postOrTags as Post;
    if (post.channel && post.channel in CHANNELS_CONFIG) {
      return post.channel;
    }
    const tags = post.tags;
    if (!tags || !Array.isArray(tags)) return null;

    for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
      for (const column of Object.values(channel.columns) as ColumnConfig[]) {
        if (tags.some((tag) => column.tags.includes(tag))) {
          return channelKey;
        }
      }
    }
    return null;
  }

  const tags = Array.isArray(postOrTags) ? postOrTags : null;
  if (!tags) return null;

  for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
    for (const column of Object.values(channel.columns) as ColumnConfig[]) {
      if (tags.some((tag) => column.tags.includes(tag))) {
        return channelKey;
      }
    }
  }
  return null;
}

export function getColumnByTags(
  postOrTags: Post | string[] | unknown
): { channelKey: string; columnKey: string } | null {
  if (
    postOrTags &&
    typeof postOrTags === "object" &&
    !Array.isArray(postOrTags)
  ) {
    const post = postOrTags as Post;
    if (post.channel && post.column) {
      const channelConfig = CHANNELS_CONFIG[post.channel as keyof ChannelsConfig] as ChannelConfig | undefined;
      if (channelConfig && channelConfig.columns[post.column]) {
        return { channelKey: post.channel, columnKey: post.column };
      }
    }

    const tags = post.tags;
    if (!tags || !Array.isArray(tags)) return null;

    for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
      for (const [columnKey, column] of Object.entries(channel.columns) as [string, ColumnConfig][]) {
        if (tags.some((tag) => column.tags.includes(tag))) {
          return { channelKey, columnKey };
        }
      }
    }
    return null;
  }

  const tags = Array.isArray(postOrTags) ? postOrTags : null;
  if (!tags) return null;

  for (const [channelKey, channel] of Object.entries(CHANNELS_CONFIG)) {
    for (const [columnKey, column] of Object.entries(channel.columns) as [string, ColumnConfig][]) {
      if (tags.some((tag) => column.tags.includes(tag))) {
        return { channelKey, columnKey };
      }
    }
  }
  return null;
}

export function getAllChannels() {
  return Object.entries(CHANNELS_CONFIG).map(([key, config]) => ({
    key,
    ...config,
  }));
}

validateConfigInDevelopment(CHANNELS_CONFIG);
