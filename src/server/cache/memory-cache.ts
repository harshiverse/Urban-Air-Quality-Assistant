interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached item if it exists and has not expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached item with TTL in milliseconds.
   */
  public set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete item by key.
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired items.
   */
  public prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global singleton cache instance for server runtime
export const globalCache = new MemoryCache();
