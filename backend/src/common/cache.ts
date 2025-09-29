interface CacheEntry {
  data: any;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

export function getCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache(key: string, data: any, ttlMs: number = 60000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

export function clearByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function getCacheSize(): number {
  return cache.size;
}

export function clearAllCache(): void {
  cache.clear();
}