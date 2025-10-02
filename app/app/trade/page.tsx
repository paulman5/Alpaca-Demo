"use client";
import React, { useEffect, useState } from "react";
import { clientCacheHelpers } from "@/lib/cache/client-cache";
import TradeTokenSelector from "@/components/features/trade/tradetokenselector";
import TradeChart from "@/components/features/trade/tradechart";
import TradeForm from "@/components/features/trade/tradeform";
import TransactionModal from "@/components/ui/transaction-modal";
import { useAptosWallet } from "@/hooks/aptos/useAptosWallet";
import { useAptosOrders } from "@/hooks/aptos/useAptosOrders";
import { useTokenBalance } from "@/hooks/view/onChain/useAptosToken";

const TOKENS = [{ label: "LQD", value: "LQD" }];

const TradePage = () => {
  const [selectedToken, setSelectedToken] = useState("LQD");
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buyUsdc, setBuyUsdc] = useState("");
  const [sellToken, setSellToken] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [chartDataSource, setChartDataSource] = useState<"real" | "mock">(
    "real",
  );
  const [etfData, setEtfData] = useState<any>(null);

  // Transaction modal state
  const [transactionModal, setTransactionModal] = useState({
    isOpen: false,
    status: "waiting" as "waiting" | "completed" | "failed",
    transactionType: "buy" as "buy" | "sell",
    amount: "",
    receivedAmount: "",
    error: "",
  });

  const { address: userAddress } = useAptosWallet();
  const {
    balance: tokenBalance,
    isLoading: balanceLoading,
    isError: _balanceError,
    refetch: refetchTokenBalance,
  } = useTokenBalance(userAddress ?? undefined);
  const { buyAsset, sellAsset, isPending: isOrderPending, error: orderError } =
    useAptosOrders();
  const usdcBalance = 0;
  const usdcLoading = false;
  const usdcError = undefined as unknown as boolean;
  const refetchUSDCBalance = () => Promise.resolve({ data: undefined as any });

  // Monitor order transaction state
  useEffect(() => {
    if (transactionModal.isOpen && transactionModal.status === "waiting") {
      if (false) {
        // Transaction completed successfully
        setTransactionModal((prev) => ({
          ...prev,
          status: "completed",
        }));

        // Refetch balances to show updated amounts
        refetchTokenBalance();
        refetchUSDCBalance();

        // Auto-close modal after 3 seconds
        setTimeout(() => {
          setTransactionModal((prev) => ({ ...prev, isOpen: false }));
        }, 3000);
      } else if (orderError) {
        // Transaction failed - show simple error message
        setTransactionModal((prev) => ({
          ...prev,
          status: "failed",
          error: "Transaction timed out. Please try again.",
        }));
      }
    }
  }, [
    orderError,
    transactionModal.isOpen,
    transactionModal.status,
    refetchTokenBalance,
    refetchUSDCBalance,
  ]);

  useEffect(() => {
    async function fetchETFData() {
      try {
        const data = await clientCacheHelpers.fetchStockData(selectedToken);
        setEtfData(data);
      } catch (error) {}
    }
    fetchETFData();
  }, [selectedToken]);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const json = await clientCacheHelpers.fetchStockData(selectedToken);
        if (json.error) {
          // Don't use mock data, just keep the loading state
          console.log("📊 Chart data error:", json.error);
          setTokenData([]);
          setChartDataSource("real");
        } else {
          setTokenData(json.data || []);
          setChartDataSource(json.dataSource);
        }
      } catch (e) {
        // Don't use mock data, just keep the loading state
        console.log("📊 Chart data fetch error:", e);
        setTokenData([]);
        setChartDataSource("real");
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, [selectedToken]);

  useEffect(() => {
    let isMounted = true;
    let lastKnownPrice: number | null = null;

    async function fetchPriceData() {
      try {
        setPriceLoading(true);
        const json = await clientCacheHelpers.fetchMarketData(selectedToken);
        if (!isMounted) return;

        if (json.price && json.price > 0) {
          // Only update if price has actually changed
          if (lastKnownPrice !== json.price) {
            setCurrentPrice(json.price);
            lastKnownPrice = json.price;
          }
        } else {
          setCurrentPrice(null); // No valid price data
        }
      } catch (e) {
        if (isMounted) {
          setCurrentPrice(null); // Error fetching price
        }
      } finally {
        if (isMounted) {
          setPriceLoading(false);
        }
      }
    }

    // Initial fetch
    fetchPriceData();

    // Refetch every 5 minutes to reduce Vercel compute usage
    const interval = setInterval(fetchPriceData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedToken]);

  // Use chart data as primary source for price calculations
  const chartLatestPrice =
    tokenData.length > 0 ? tokenData[tokenData.length - 1].close : null;
  const chartPrevPrice =
    tokenData.length > 1 ? tokenData[tokenData.length - 2].close : null;

  // Use currentPrice (from market data API) as fallback only if chart data is not available
  const latestPrice = chartLatestPrice || currentPrice;
  const prevPrice =
    chartPrevPrice ||
    (tokenData.length > 0
      ? tokenData[tokenData.length - 1].close
      : latestPrice);

  const priceChange = latestPrice && prevPrice ? latestPrice - prevPrice : 0;
  const priceChangePercent =
    prevPrice > 0 && latestPrice
      ? ((latestPrice - prevPrice) / prevPrice) * 100
      : 0;

  const tradingFee = 0.0025;
  const estimatedTokens =
    buyUsdc && latestPrice
      ? (parseFloat(buyUsdc) / latestPrice).toFixed(4)
      : "";
  const estimatedUsdc =
    sellToken && latestPrice
      ? (parseFloat(sellToken) * latestPrice).toFixed(2)
      : "";
  const buyFeeUsdc = buyUsdc
    ? (parseFloat(buyUsdc) * tradingFee).toFixed(2)
    : "";
  const sellFeeUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * tradingFee).toFixed(2)
    : "";
  const netReceiveTokens = estimatedTokens
    ? (parseFloat(estimatedTokens) * (1 - tradingFee)).toFixed(4)
    : "";
  const netReceiveUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * (1 - tradingFee)).toFixed(2)
    : "";

  const handleBuy = async () => {
    if (!userAddress || !buyUsdc || !latestPrice) return;
    const usdcAmountNum = parseFloat(buyUsdc);
    const amount = BigInt(Math.floor(usdcAmountNum * 1e6));

    const estimatedTokenAmount =
      latestPrice > 0 ? usdcAmountNum / latestPrice : 0;

    // Show transaction modal
    setTransactionModal({
      isOpen: true,
      status: "waiting",
      transactionType: "buy",
      amount: `${buyUsdc} USDC`,
      receivedAmount: netReceiveTokens,
      error: "",
    });

    try {
      // Execute buy order via Aptos module
      console.log("📤 Sending buy order:", amount.toString());
      await buyAsset(selectedToken, amount.toString());
      setBuyUsdc("");

      // Keep modal open for buy transaction to complete
      // The modal will stay in "waiting" state until the buy transaction is processed
      console.log("⏳ Buy transaction submitted, keeping modal open...");
    } catch (error) {
      console.error("❌ Error in buy transaction:", error);
      setTransactionModal((prev) => ({
        ...prev,
        status: "failed",
        error: "Transaction failed. Please try again.",
      }));
    }
  };

  const handleSell = async () => {
    if (!userAddress || !sellToken || !latestPrice) return;

    // Validate balance before proceeding
    const sellTokenAmount = parseFloat(sellToken);
    if (sellTokenAmount > tokenBalance) {
      console.log("❌ Sell amount exceeds balance:", {
        sellAmount: sellTokenAmount,
        availableBalance: tokenBalance,
      });

      // Show processing status first
      setTransactionModal({
        isOpen: true,
        status: "waiting",
        transactionType: "sell",
        amount: `${sellToken} ${selectedToken}`,
        receivedAmount: "",
        error: "",
      });

      // Wait 3 seconds then show the error
      setTimeout(() => {
        setTransactionModal((prev) => ({
          ...prev,
          status: "failed",
          error:
            "Transaction reverted: Order exceeds balance. You don't have enough SLQD tokens.",
        }));
      }, 3000);

      return;
    }

    // Multiply by 18 decimals for token amount (u128)
    const tokenAmount = BigInt(Math.floor(sellTokenAmount * 1e18));

    const estimatedUsdcAmount =
      latestPrice > 0 ? sellTokenAmount * latestPrice : 0;

    // Show transaction modal
    setTransactionModal({
      isOpen: true,
      status: "waiting",
      transactionType: "sell",
      amount: `${sellToken} ${selectedToken}`,
      receivedAmount: netReceiveUsdc,
      error: "",
    });

    try {
      // Execute sell order via Aptos module
      await sellAsset(selectedToken, tokenAmount.toString());
      setSellToken("");

      console.log("⏳ Sell transaction submitted, keeping modal open...");
    } catch (error) {
      console.error("❌ Error in sell transaction:", error);
      setTransactionModal((prev) => ({
        ...prev,
        status: "failed",
        error: "Transaction failed. Please try again.",
      }));
    }
  };

  const closeTransactionModal = () => {
    setTransactionModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 md:px-0">
      {/* Page banner */}
      <div className="bg-gradient-to-r from-[#004040] via-[#035a5a] to-[#004040] rounded-none p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">Trade</h1>
          <p className="text-sm md:text-base text-[#cfe7e7] mt-1">Swap tokens and execute trades instantly with low fees.</p>
        </div>
      </div>

      <TradeTokenSelector
        tokens={TOKENS}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
      <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
        <TradeChart
          loading={loading}
          tokenData={tokenData}
          selectedToken={selectedToken}
        />
      </div>
      <div className="rounded-none shadow-sm">
        <TradeForm
        tradeType={tradeType}
        setTradeType={setTradeType}
        selectedToken={selectedToken}
        buyUsdc={buyUsdc}
        setBuyUsdc={setBuyUsdc}
        sellToken={sellToken}
        setSellToken={setSellToken}
        latestPrice={latestPrice}
        priceLoading={priceLoading}
        usdcBalance={usdcBalance}
        tokenBalance={tokenBalance}
        usdcLoading={usdcLoading}
        usdcError={usdcError}
        balanceLoading={balanceLoading}
        isOrderPending={isOrderPending}
        handleBuy={handleBuy}
        handleSell={handleSell}
        buyFeeUsdc={buyFeeUsdc}
        netReceiveTokens={netReceiveTokens}
        sellFeeUsdc={sellFeeUsdc}
        netReceiveUsdc={netReceiveUsdc}
        priceChangePercent={priceChangePercent}
        priceChange={priceChange}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={closeTransactionModal}
        status={transactionModal.status}
        transactionType={transactionModal.transactionType}
        tokenSymbol={selectedToken}
        amount={transactionModal.amount}
        receivedAmount={transactionModal.receivedAmount}
        error={transactionModal.error}
      />
    </div>
  );
};

export default TradePage;
