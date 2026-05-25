import { describe, it, expect } from "vitest";
import {
  generateColumnStaticParams,
  validateChannelColumn,
} from "../route-utils";

describe("generateColumnStaticParams", () => {
  it("为 tech 频道生成专栏静态参数", () => {
    const params = generateColumnStaticParams("tech");
    expect(params.length).toBeGreaterThan(0);
    expect(params.every((p) => typeof p.columnSlug === "string")).toBe(true);
    expect(params.some((p) => p.columnSlug === "go")).toBe(true);
    expect(params.some((p) => p.columnSlug === "general")).toBe(true);
    expect(params.some((p) => p.columnSlug === "product")).toBe(true);
    expect(params.some((p) => p.columnSlug === "design")).toBe(true);
  });

  it("为 life 频道生成专栏静态参数", () => {
    const params = generateColumnStaticParams("life");
    expect(params.some((p) => p.columnSlug === "japan")).toBe(true);
    expect(params.some((p) => p.columnSlug === "thoughts")).toBe(true);
    expect(params.some((p) => p.columnSlug === "misc")).toBe(true);
  });

  it("不存在的频道返回空数组", () => {
    const params = generateColumnStaticParams("travel");
    expect(params).toEqual([]);
  });
});

describe("validateChannelColumn", () => {
  it("验证有效的频道和专栏", () => {
    const result = validateChannelColumn("tech", "go");
    expect(result).not.toBeNull();
    expect(result!.channelConfig.name).toBe("技术");
    expect(result!.columnConfig.name).toBe("Golang 精进之路");
  });

  it("无效频道返回 null", () => {
    const result = validateChannelColumn("travel", "go");
    expect(result).toBeNull();
  });

  it("无效专栏返回 null", () => {
    const result = validateChannelColumn("tech", "python");
    expect(result).toBeNull();
  });

  it("验证 finance 频道", () => {
    const result = validateChannelColumn("finance", "finance");
    expect(result).not.toBeNull();
    expect(result!.channelConfig.name).toBe("金融");
  });
});
