// In-Memory High-Performance TTL Cache Service
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttlSeconds = 900) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
