// 文章数据缓存机制

class MemoryCache {
  private cache = new Map<string, unknown>();
  private timestamps = new Map<string, number>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟默认过期时间
  private maxSize = 200;

  set(key: string, value: unknown, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey && oldestKey !== key) {
        this.delete(oldestKey);
      }
    }
  }

  get<T>(key: string): T | null {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key) as T | null;
  }

  delete(key: string) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

const postCache = new MemoryCache();

function generateCacheKey(type: string, ...params: string[]) {
  return `${type}:${params.join(":")}`;
}

export function withCache<T extends (...args: string[]) => unknown>(
  fn: T,
  cacheType: string,
  ttl = 5 * 60 * 1000
) {
  return function (...args: Parameters<T>): ReturnType<T> {
    const cacheKey = generateCacheKey(cacheType, ...args);
    const cached = postCache.get<ReturnType<T>>(cacheKey);
    if (cached !== null) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🎯 Cache hit: ${cacheKey}`);
      }
      return cached;
    }
    const result = fn.apply(undefined, args) as ReturnType<T>;
    const effectiveTTL =
      process.env.NODE_ENV === "development" ? Math.min(ttl, 120000) : ttl;
    postCache.set(cacheKey, result, effectiveTTL);
    if (process.env.NODE_ENV === "development") {
      console.log(`💾 Cache miss, stored: ${cacheKey}`);
    }
    return result;
  };
}

export function setCache(
  type: string,
  params: string[],
  value: unknown,
  ttl?: number
) {
  const cacheKey = generateCacheKey(type, ...params);
  postCache.set(cacheKey, value, ttl);
}

export function getCache<T>(type: string, params: string[]): T | null {
  const cacheKey = generateCacheKey(type, ...params);
  return postCache.get<T>(cacheKey);
}

export function clearCacheByType(type: string) {
  const keys = Array.from(postCache["cache"].keys());
  const keysToDelete = keys.filter((key) => key.startsWith(`${type}:`));
  keysToDelete.forEach((key) => postCache.delete(key));
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🗑️  Cleared ${keysToDelete.length} cache entries for type: ${type}`
    );
  }
}

export function clearAllCache() {
  postCache.clear();
  if (process.env.NODE_ENV === "development") {
    console.log("🗑️  Cleared all cache");
  }
}

export function getCacheStats() {
  return postCache.getStats();
}

export function cleanupCache() {
  postCache.cleanup();
}

if (process.env.NODE_ENV === "development") {
  setInterval(() => {
    cleanupCache();
  }, 60000);
}

export { postCache };
