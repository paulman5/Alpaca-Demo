import { NextResponse } from "next/server";
import serverCache from "@/lib/cache/server-cache";

export async function GET() {
  try {
    const stats = serverCache.getStats();
    
    return NextResponse.json({
      ...stats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      cacheEfficiency: stats.totalEntries > 0 
        ? ((stats.validEntries / stats.totalEntries) * 100).toFixed(2) + '%'
        : '0%',
      message: stats.validEntries > 0 
        ? `Cache is working! ${stats.validEntries} valid entries serving requests.`
        : 'Cache is empty - first requests will populate it.',
    });
  } catch (error) {
    console.error("Error getting cache status:", error);
    return NextResponse.json(
      { error: "Failed to get cache status" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    serverCache.clear();
    return NextResponse.json({
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
