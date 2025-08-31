/**
 * Cache monitoring utilities for development and debugging
 */

import serverCache from "./server-cache";

export class CacheMonitor {
  private static logInterval: NodeJS.Timeout | null = null;
  
  /**
   * Start logging cache statistics at regular intervals
   */
  static startLogging(intervalMs: number = 60000) { // Default: every minute
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
    
    this.logInterval = setInterval(() => {
      const stats = serverCache.getStats();
      console.log("📊 Cache Statistics:", {
        ...stats,
        efficiency: stats.totalEntries > 0 
          ? ((stats.validEntries / stats.totalEntries) * 100).toFixed(1) + '%'
          : '0%',
        timestamp: new Date().toISOString(),
      });
    }, intervalMs);
    
    console.log("🚀 Cache monitoring started");
  }
  
  /**
   * Stop logging cache statistics
   */
  static stopLogging() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
      console.log("⏹️ Cache monitoring stopped");
    }
  }
  
  /**
   * Log current cache statistics once
   */
  static logStats() {
    const stats = serverCache.getStats();
    console.log("📊 Current Cache Statistics:", {
      ...stats,
      efficiency: stats.totalEntries > 0 
        ? ((stats.validEntries / stats.totalEntries) * 100).toFixed(1) + '%'
        : '0%',
      timestamp: new Date().toISOString(),
    });
  }
}

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  CacheMonitor.startLogging(2 * 60 * 1000); // Log every 2 minutes in dev
}
