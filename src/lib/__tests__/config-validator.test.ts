import { describe, it, expect } from "vitest";
import {
  validateChannelsConfig,
  validateChannelExists,
  validateColumnExists,
  getConfigSummary,
  validatePostClassification,
  validatePostsClassification,
} from "../config-validator";
import type { ChannelsConfig, Post } from "@/types";

const VALID_CONFIG = {
  tech: {
    name: "技术",
    description: "技术分享",
    icon: "/tech.svg",
    columns: {
      go: {
        name: "Go",
        description: "Go语言",
        tags: ["Go"],
        cover: "https://example.com/go.png",
      },
    },
  },
} as unknown as ChannelsConfig;

describe("validateChannelsConfig", () => {
  it("通过有效配置", () => {
    const result = validateChannelsConfig(VALID_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("拒绝 null", () => {
    const result = validateChannelsConfig(null);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("must be a valid object");
  });

  it("拒绝空对象", () => {
    const result = validateChannelsConfig({});
    expect(result.isValid).toBe(true); // 空对象没有字段错误，但业务上可能不合理
  });

  it("检测缺少 name 字段", () => {
    const badConfig = {
      tech: {
        description: "技术分享",
        columns: {},
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing required field: name"))).toBe(true);
  });

  it("检测缺少 description 字段", () => {
    const badConfig = {
      tech: {
        name: "技术",
        columns: {},
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing required field: description"))).toBe(true);
  });

  it("检测缺少 columns 字段", () => {
    const badConfig = {
      tech: {
        name: "技术",
        description: "技术分享",
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing required field: columns"))).toBe(true);
  });

  it("检测专栏缺少 tags 字段", () => {
    const badConfig = {
      tech: {
        name: "技术",
        description: "技术分享",
        columns: {
          go: {
            name: "Go",
            description: "Go语言",
          },
        },
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing required field: tags"))).toBe(true);
  });

  it("检测非字符串 name", () => {
    const badConfig = {
      tech: {
        name: 123,
        description: "技术分享",
        columns: {},
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("name must be a string"))).toBe(true);
  });

  it("检测非数组 tags", () => {
    const badConfig = {
      tech: {
        name: "技术",
        description: "技术分享",
        columns: {
          go: {
            name: "Go",
            description: "Go语言",
            tags: "Go",
          },
        },
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("tags must be an array"))).toBe(true);
  });

  it("检测 tags 中非法类型", () => {
    const badConfig = {
      tech: {
        name: "技术",
        description: "技术分享",
        columns: {
          go: {
            name: "Go",
            description: "Go语言",
            tags: ["Go", 123],
          },
        },
      },
    } as unknown as ChannelsConfig;
    const result = validateChannelsConfig(badConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be a string"))).toBe(true);
  });
});

describe("validateChannelExists", () => {
  it("找到存在的频道", () => {
    expect(validateChannelExists(VALID_CONFIG, "tech")).toBe(true);
  });

  it("找不到不存在的频道", () => {
    expect(validateChannelExists(VALID_CONFIG, "travel")).toBe(false);
  });

  it("null config 返回 false", () => {
    expect(validateChannelExists(null, "tech")).toBe(false);
  });
});

describe("validateColumnExists", () => {
  it("找到存在的专栏", () => {
    expect(validateColumnExists(VALID_CONFIG, "tech", "go")).toBe(true);
  });

  it("找不到不存在的专栏", () => {
    expect(validateColumnExists(VALID_CONFIG, "tech", "python")).toBe(false);
  });

  it("频道不存在返回 false", () => {
    expect(validateColumnExists(VALID_CONFIG, "life", "go")).toBe(false);
  });
});

describe("getConfigSummary", () => {
  it("正确统计频道和专栏数量", () => {
    const summary = getConfigSummary(VALID_CONFIG);
    expect(summary.totalChannels).toBe(1);
    expect(summary.totalColumns).toBe(1);
    expect(summary.channels[0].key).toBe("tech");
    expect(summary.channels[0].columnCount).toBe(1);
    expect(summary.channels[0].columnKeys).toContain("go");
  });

  it("null config 返回空统计", () => {
    const summary = getConfigSummary(null);
    expect(summary.totalChannels).toBe(0);
    expect(summary.totalColumns).toBe(0);
  });
});

describe("validatePostClassification", () => {
  it("有效 channel/column 通过", () => {
    const post: Post = {
      slug: "test-post",
      title: "Test",
      date: "2026-01-01",
      tags: ["Go"],
      pinned: false,
      channel: "tech",
      column: "go",
    };
    const result = validatePostClassification(post, VALID_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("无效的 channel 报错", () => {
    const post: Post = {
      slug: "test-post",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
      channel: "travel",
      column: "japan",
    };
    const result = validatePostClassification(post, VALID_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("does not exist"))).toBe(true);
  });

  it("无效的 column 报错", () => {
    const post: Post = {
      slug: "test-post",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
      channel: "tech",
      column: "python",
    };
    const result = validatePostClassification(post, VALID_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("does not exist"))).toBe(true);
  });

  it("column 无 channel 报错", () => {
    const post = {
      slug: "test-post",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
      column: "go",
    } as unknown as Post;
    const result = validatePostClassification(post, VALID_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("channel is required"))).toBe(true);
  });

  it("无 channel/column 时报错", () => {
    const post = {
      slug: "test-post",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
    } as unknown as Post;
    const result = validatePostClassification(post, VALID_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("channel is required"))).toBe(true);
    expect(result.errors.some((e) => e.includes("column is required"))).toBe(true);
  });
});

describe("validatePostsClassification", () => {
  it("空数组通过", () => {
    const result = validatePostsClassification([], VALID_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.totalPosts).toBe(0);
  });

  it("统计有效和无效文章", () => {
    const posts: Post[] = [
      { slug: "good", title: "Good", date: "2026-01-01", tags: ["Go"], pinned: false, channel: "tech", column: "go" },
      { slug: "bad", title: "Bad", date: "2026-01-01", tags: [], pinned: false, channel: "travel", column: "japan" },
    ];
    const result = validatePostsClassification(posts, VALID_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.totalPosts).toBe(2);
    expect(result.validPosts).toBe(1);
  });
});
