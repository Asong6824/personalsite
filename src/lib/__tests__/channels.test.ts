import { describe, it, expect } from "vitest";
import { CHANNELS_CONFIG, getChannelByTags, getColumnByTags, getAllChannels } from "../channels";
import type { Post } from "@/types";

describe("CHANNELS_CONFIG 结构", () => {
  it("包含 4 个频道", () => {
    const keys = Object.keys(CHANNELS_CONFIG);
    expect(keys).toContain("tech");
    expect(keys).toContain("life");
    expect(keys).toContain("finance");
    expect(keys).toContain("create");
    expect(keys).toHaveLength(4);
  });

  it("每个频道都有必填字段", () => {
    for (const [key, config] of Object.entries(CHANNELS_CONFIG)) {
      expect(config.name, `${key} 缺少 name`).toBeDefined();
      expect(config.description, `${key} 缺少 description`).toBeDefined();
      expect(config.columns, `${key} 缺少 columns`).toBeDefined();
      expect(typeof config.columns, `${key} columns 类型错误`).toBe("object");
    }
  });

  it("每个专栏都有必填字段", () => {
    for (const [chKey, chConfig] of Object.entries(CHANNELS_CONFIG)) {
      for (const [colKey, colConfig] of Object.entries(chConfig.columns)) {
        expect(colConfig.name, `${chKey}.${colKey} 缺少 name`).toBeDefined();
        expect(colConfig.description, `${chKey}.${colKey} 缺少 description`).toBeDefined();
        expect(Array.isArray(colConfig.tags), `${chKey}.${colKey} tags 不是数组`).toBe(true);
        expect(colConfig.tags.length, `${chKey}.${colKey} tags 为空`).toBeGreaterThan(0);
      }
    }
  });

  it("频道名称不重复", () => {
    const names = Object.values(CHANNELS_CONFIG).map((c) => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe("getChannelByTags", () => {
  it("通过 tags 匹配到 tech 频道", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: ["Go", "golang"],
      pinned: false,
    };
    expect(getChannelByTags(post)).toBe("tech");
  });

  it("通过显式 channel 字段返回频道", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
      channel: "life",
    };
    expect(getChannelByTags(post)).toBe("life");
  });

  it("无匹配返回 null", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: ["不存在的标签"],
      pinned: false,
    };
    expect(getChannelByTags(post)).toBeNull();
  });

  it("直接传 tags 数组匹配", () => {
    expect(getChannelByTags(["日本", "japan"])).toBe("life");
  });
});

describe("getColumnByTags", () => {
  it("通过 tags 匹配到 tech/go", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: ["Go"],
      pinned: false,
    };
    const result = getColumnByTags(post);
    expect(result).not.toBeNull();
    expect(result!.channelKey).toBe("tech");
    expect(result!.columnKey).toBe("go");
  });

  it("通过显式 channel/column 返回", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: [],
      pinned: false,
      channel: "life",
      column: "japan",
    };
    const result = getColumnByTags(post);
    expect(result).not.toBeNull();
    expect(result!.channelKey).toBe("life");
    expect(result!.columnKey).toBe("japan");
  });

  it("无匹配返回 null", () => {
    const post: Post = {
      slug: "test",
      title: "Test",
      date: "2026-01-01",
      tags: ["不存在的标签"],
      pinned: false,
    };
    expect(getColumnByTags(post)).toBeNull();
  });
});

describe("getAllChannels", () => {
  it("返回所有频道数组", () => {
    const channels = getAllChannels();
    expect(channels).toHaveLength(4);
    expect(channels.some((c) => c.key === "tech")).toBe(true);
  });
});
