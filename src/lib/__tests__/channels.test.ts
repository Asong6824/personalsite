import { describe, it, expect } from "vitest";
import { CHANNELS_CONFIG, getAllChannels } from "../channels";
import type { ColumnConfig } from "@/types";

describe("CHANNELS_CONFIG 结构", () => {
  it("包含 4 个频道", () => {
    const keys = Object.keys(CHANNELS_CONFIG);
    expect(keys).toContain("tech");
    expect(keys).toContain("life");
    expect(keys).toContain("finance");
    expect(keys).toContain("creative");
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
      for (const [colKey, colConfig] of Object.entries(chConfig.columns) as [string, ColumnConfig][]) {
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

describe("getAllChannels", () => {
  it("返回所有频道数组", () => {
    const channels = getAllChannels();
    expect(channels).toHaveLength(4);
    expect(channels.some((c) => c.key === "tech")).toBe(true);
  });
});
