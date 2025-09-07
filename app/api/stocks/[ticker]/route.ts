import { NextRequest } from "next/server";
import { fetchWithTimeout } from "@/lib/utils/fetchWithTimeout";

// Check for required environment variables
if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
  console.error("Missing required Alpaca API environment variables");
}

const ALPACA_API_KEY = process.env.APCA_API_KEY_ID ?? "";
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY ?? "";
const DATA_URL = "https://data.alpaca.markets";

// Log environment variable status on startup
console.log("API Configuration Status:", {
  hasApiKey: !!ALPACA_API_KEY,
  hasApiSecret: !!ALPACA_API_SECRET,
  dataUrl: DATA_URL,
});

interface AlpacaQuote {
  ap: number; // ask price
  as: number; // ask size
  bp: number; // bid price
  bs: number; // bid size
  t: string; // timestamp
}

interface AlpacaResponse {
  [symbol: string]: AlpacaQuote[];
}



async function fetchHistoricalData(
  ticker: string,
  retryCount = 0,
): Promise<any[]> {
  try {
    // Use daily bars endpoint instead of paginated auctions to minimize requests
    const url = `${DATA_URL}/v2/stocks/bars?symbols=${ticker}&timeframe=1Day&limit=90`;
    const response = await fetchWithTimeout(url, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
      },
      timeoutMs: 7000,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${await response.text()}`,
      );
    }

    const data = await response.json();
    const bars = data?.bars?.[ticker] ?? [];
    if (!Array.isArray(bars) || bars.length === 0) {
      return [];
    }

    // Normalize to chart-compatible structure
    const result = bars
      .map((bar: any) => ({
        time: bar.t,
        open: bar.o ?? bar.c,
        high: bar.h ?? bar.c,
        low: bar.l ?? bar.c,
        close: bar.c,
        volume: bar.v ?? 0,
      }))
      .sort((a: any, b: any) => a.time.localeCompare(b.time));

    return result;
  } catch (error: any) {
    console.error("Error fetching historical data for " + ticker + ":", error);

    if (retryCount < 3) {
      // Short backoff to avoid long serverless durations
      await new Promise((resolve) => setTimeout(resolve, 200));
      return fetchHistoricalData(ticker, retryCount + 1);
    }

    throw new Error(`Error fetching historical data: ${error.message}`);
  }
}

interface StockResponse {
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  data: any[];
  dataSource: string;
}

async function fetchStockDataFromAPI(ticker: string): Promise<StockResponse> {
  console.log("API Configuration Status:", {
    hasApiKey: !!ALPACA_API_KEY,
    hasApiSecret: !!ALPACA_API_SECRET,
    dataUrl: DATA_URL,
  });

  const historicalData = await fetchHistoricalData(ticker);

  if (!historicalData || historicalData.length === 0) {
    throw new Error("No historical data available");
  }

  // Get the latest and previous quotes
  const latestQuote = historicalData[historicalData.length - 1];
  const prevQuote = historicalData[historicalData.length - 2] || latestQuote;

  // Calculate price changes
  const currentPrice = latestQuote.c;
  const priceChange = currentPrice - prevQuote.c;
  const priceChangePercent = (priceChange / prevQuote.c) * 100;

  return {
    symbol: ticker,
    currentPrice,
    priceChange,
    priceChangePercent,
    data: historicalData,
    dataSource: "real",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    // Get the ticker from the URL params
    const { ticker } = await params;

    // Validate ticker
    if (!ticker || typeof ticker !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid ticker symbol",
        }),
        { status: 400 },
      );
    }

    console.log("🔍 Requested stock data for:", ticker);

    const stockData = await fetchStockDataFromAPI(ticker);
    console.log("🎯 Final stock response for", ticker);
    return new Response(JSON.stringify(stockData));
  } catch (error) {
    console.error("❌ Error fetching stock data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch stock data",
      }),
      { status: 500 },
    );
  }
}
