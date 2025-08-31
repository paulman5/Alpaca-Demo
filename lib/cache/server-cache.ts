/**
 * Server-side in-memory cache manager with TTL support
 * Designed for high-frequency API endpoints to reduce external API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ServerCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Get a value from cache if it's still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is still valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry, key) => {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): string {
    // Convert Map to array for JSON serialization
    const cacheArray: Array<[string, CacheEntry<any>]> = [];
    this.cache.forEach((value, key) => {
      cacheArray.push([key, value]);
    });
    
    const jsonString = JSON.stringify(cacheArray);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Destroy the cache and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Create a singleton instance
const serverCache = new ServerCache();

// TTL constants (in milliseconds)
export const CACHE_TTL = {
  MARKET_DATA: 5 * 60 * 1000,      // 5 minutes for market data
  YIELD_DATA: 60 * 60 * 1000,      // 1 hour for yield data (changes less frequently)
  STOCK_DATA: 5 * 60 * 1000,       // 5 minutes for individual stock data
  QUOTE_DATA: 2 * 60 * 1000,       // 2 minutes for quote data
  HISTORICAL_DATA: 15 * 60 * 1000,  // 15 minutes for historical data
} as const;

// Helper functions for common cache operations
export const cacheHelpers = {
  /**
   * Get or set market data with automatic caching
   */
  async getOrSetMarketData<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = CACHE_TTL.MARKET_DATA
  ): Promise<T> {
    // Try to get from cache first
    const cached = serverCache.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Cache HIT for key: ${key}`);
      return cached;
    }

    console.log(`🌐 Cache MISS for key: ${key} - fetching fresh data`);
    
    // Fetch fresh data
    const freshData = await fetcher();
    
    // Store in cache
    serverCache.set(key, freshData, ttl);
    
    return freshData;
  },

  /**
   * Generate cache key for market data
   */
  marketDataKey: (symbol: string) => `market:${symbol.toLowerCase()}`,
  
  /**
   * Generate cache key for yield data
   */
  yieldDataKey: (symbol: string) => `yield:${symbol.toLowerCase()}`,
  
  /**
   * Generate cache key for stock data
   */
  stockDataKey: (ticker: string) => `stock:${ticker.toLowerCase()}`,
  
  /**
   * Generate cache key for historical data
   */
  historicalDataKey: (ticker: string, days: number) => `historical:${ticker.toLowerCase()}:${days}d`,
};

export default serverCache;
