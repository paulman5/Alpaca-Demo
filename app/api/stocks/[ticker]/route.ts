import { NextRequest } from "next/server";

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
    // Calculate start and end dates: last 90 days, ending yesterday
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // yesterday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 89);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    console.log("Date range:", {
      start: startStr,
      end: endStr,
      now: new Date().toISOString(),
    });

    let allAuctions: any[] = [];
    let nextPageToken: string | null = null;
    let seenTokens = new Set<string>();
    let pageCount = 0;
    const MAX_PAGES = 10;

    while (pageCount < MAX_PAGES) {
      let url = `${DATA_URL}/v2/stocks/${ticker}/auctions?start=${startStr}&end=${endStr}&limit=10000`;
      if (nextPageToken) {
        url += `&page_token=${nextPageToken}`;
      }

      console.log("Fetching auctions page:", {
        pageCount,
        url,
        nextPageToken,
      });

      const response = await fetch(url, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${await response.text()}`,
        );
      }

      const data = await response.json();

      // Check if we have valid auctions data
      if (
        !data.auctions ||
        !Array.isArray(data.auctions) ||
        data.auctions.length === 0
      ) {
        console.log("No more auctions available, stopping pagination");
        break;
      }

      allAuctions = allAuctions.concat(data.auctions);

      if (!data.next_page_token) {
        console.log("No next page token, finished fetching");
        break;
      }

      if (seenTokens.has(data.next_page_token)) {
        console.log("Duplicate page token detected, stopping pagination");
        break;
      }

      nextPageToken = data.next_page_token;
      if (nextPageToken) {
        seenTokens.add(nextPageToken);
      }
      pageCount++;
    }

    console.log("Finished fetching auctions:", {
      totalAuctions: allAuctions.length,
      totalPages: pageCount,
    });

    if (allAuctions.length === 0) {
      console.log("No auctions found for the specified date range");
      return [];
    }

    // Process auctions: for each day, use the 'p' value from the closing auction (auction.c)
    const dailyData = new Map();
    for (const auction of allAuctions) {
      const date = auction.d;
      if (!auction.c || !Array.isArray(auction.c) || auction.c.length === 0)
        continue;
      // Use the last closing auction's 'p' value for the day
      const lastClose = auction.c[auction.c.length - 1];
      if (!lastClose || typeof lastClose.p !== "number") continue;
      const price = lastClose.p;
      const volume = lastClose.s || 0;
      dailyData.set(date, {
        time: date,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
      });
    }

    // Convert to array and sort by date
    const result = Array.from(dailyData.values()).sort((a, b) =>
      a.time.localeCompare(b.time),
    );

    console.log("Processed daily data for chart:", {
      days: result.length,
      firstDay: result[0]?.time,
      lastDay: result[result.length - 1]?.time,
      sampleData: result[0],
    });

    return result;
  } catch (error: any) {
    console.error("Error fetching historical data for " + ticker + ":", error);

    if (retryCount < 3) {
      console.log("Waiting 2 seconds before retry...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
