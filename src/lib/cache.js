// src/lib/cache.js
// 文章数据缓存机制

/**
 * 简单的内存缓存实现
 */
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5分钟默认过期时间
    }
    
    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} ttl - 过期时间（毫秒），默认5分钟
     */
    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, value);
        this.timestamps.set(key, Date.now() + ttl);
    }
    
    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {any|null} 缓存值，过期或不存在返回null
     */
    get(key) {
        const timestamp = this.timestamps.get(key);
        
        // 检查是否过期
        if (!timestamp || Date.now() > timestamp) {
            this.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }
    
    /**
     * 删除缓存
     * @param {string} key - 缓存键
     */
    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }
    
    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }
    
    /**
     * 清理过期缓存
     */
    cleanup() {
        const now = Date.now();
        for (const [key, timestamp] of this.timestamps.entries()) {
            if (now > timestamp) {
                this.delete(key);
            }
        }
    }
    
    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 创建全局缓存实例
const postCache = new MemoryCache();

/**
 * 生成缓存键
 * @param {string} type - 缓存类型
 * @param {...string} params - 参数
 * @returns {string} 缓存键
 */
function generateCacheKey(type, ...params) {
    return `${type}:${params.join(':')}`;
}

/**
 * 缓存装饰器函数
 * @param {Function} fn - 要缓存的函数
 * @param {string} cacheType - 缓存类型
 * @param {number} ttl - 过期时间
 * @returns {Function} 包装后的函数
 */
export function withCache(fn, cacheType, ttl = 5 * 60 * 1000) {
    return function(...args) {
        const cacheKey = generateCacheKey(cacheType, ...args);
        
        // 尝试从缓存获取
        const cached = postCache.get(cacheKey);
        if (cached !== null) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🎯 Cache hit: ${cacheKey}`);
            }
            return cached;
        }
        
        // 执行原函数
        const result = fn.apply(this, args);
        
        // 存入缓存
        postCache.set(cacheKey, result, ttl);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`💾 Cache miss, stored: ${cacheKey}`);
        }
        
        return result;
    };
}

/**
 * 手动设置缓存
 * @param {string} type - 缓存类型
 * @param {Array} params - 参数数组
 * @param {any} value - 缓存值
 * @param {number} ttl - 过期时间
 */
export function setCache(type, params, value, ttl) {
    const cacheKey = generateCacheKey(type, ...params);
    postCache.set(cacheKey, value, ttl);
}

/**
 * 手动获取缓存
 * @param {string} type - 缓存类型
 * @param {Array} params - 参数数组
 * @returns {any|null} 缓存值
 */
export function getCache(type, params) {
    const cacheKey = generateCacheKey(type, ...params);
    return postCache.get(cacheKey);
}

/**
 * 清除特定类型的缓存
 * @param {string} type - 缓存类型
 */
export function clearCacheByType(type) {
    const keys = Array.from(postCache.cache.keys());
    const keysToDelete = keys.filter(key => key.startsWith(`${type}:`));
    
    keysToDelete.forEach(key => {
        postCache.delete(key);
    });
    
    if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️  Cleared ${keysToDelete.length} cache entries for type: ${type}`);
    }
}

/**
 * 清空所有缓存
 */
export function clearAllCache() {
    postCache.clear();
    if (process.env.NODE_ENV === 'development') {
        console.log('🗑️  Cleared all cache');
    }
}

/**
 * 获取缓存统计信息
 * @returns {Object} 缓存统计
 */
export function getCacheStats() {
    return postCache.getStats();
}

/**
 * 清理过期缓存
 */
export function cleanupCache() {
    postCache.cleanup();
}

// 在开发环境中定期清理过期缓存
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        cleanupCache();
    }, 60000); // 每分钟清理一次
}

// 导出缓存实例（用于测试）
export { postCache };