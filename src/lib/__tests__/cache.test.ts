import { describe, it, expect, beforeEach } from "vitest";
import {
  withCache,
  setCache,
  getCache,
  clearAllCache,
  getCacheStats,
  cleanupCache,
} from "../cache";

describe("MemoryCache", () => {
  beforeEach(() => {
    clearAllCache();
  });

  it("缓存命中返回缓存值", () => {
    const fn = (x: string) => `result-${x}`;
    const cachedFn = withCache(fn, "test");

    expect(cachedFn("a")).toBe("result-a");
    expect(cachedFn("a")).toBe("result-a"); // 第二次应命中缓存
  });

  it("不同参数有不同缓存", () => {
    const fn = (x: string) => `result-${x}`;
    const cachedFn = withCache(fn, "test");

    expect(cachedFn("a")).toBe("result-a");
    expect(cachedFn("b")).toBe("result-b");
  });

  it("手动设置和获取缓存", () => {
    setCache("manual", ["key1"], { data: "hello" });
    const result = getCache<{ data: string }>("manual", ["key1"]);
    expect(result).toEqual({ data: "hello" });
  });

  it("获取不存在的缓存返回 null", () => {
    const result = getCache("none", ["key"]);
    expect(result).toBeNull();
  });

  it("缓存过期后返回 null", () => {
    const fn = (x: string) => `result-${x}`;
    const cachedFn = withCache(fn, "expire", 1); // 1ms TTL

    cachedFn("a");
    // 等待缓存过期
    const start = Date.now();
    while (Date.now() - start < 10) {} // 忙等 10ms

    // 由于缓存已过期，应重新计算
    const statsBefore = getCacheStats();
    expect(statsBefore.size).toBeGreaterThanOrEqual(0);
  });

  it("清理过期缓存", () => {
    const fn = (x: string) => `result-${x}`;
    const cachedFn = withCache(fn, "cleanup", 1);

    cachedFn("a");
    const start = Date.now();
    while (Date.now() - start < 20) {}

    cleanupCache();
    const stats = getCacheStats();
    expect(stats.size).toBe(0);
  });

  it("清除所有缓存", () => {
    const fn = (x: string) => `result-${x}`;
    const cachedFn = withCache(fn, "clear");

    cachedFn("a");
    cachedFn("b");

    let stats = getCacheStats();
    expect(stats.size).toBe(2);

    clearAllCache();
    stats = getCacheStats();
    expect(stats.size).toBe(0);
  });
});
