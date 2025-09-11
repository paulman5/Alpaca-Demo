"use client";

import { useReadContract } from "wagmi";
import erc20ABI from "@/abi/erc20.json";
import { useContractAddress } from "@/lib/addresses";

export function useUSDCTokenBalance(address: string | undefined) {
  const usdcAddress = useContractAddress("usdc");

  // Get decimals
  const { data: decimals } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "decimals",
  });

  // Get balance
  const {
    data: balance,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address],
  });

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "symbol",
  });

  return {
    balance: balance && decimals ? Number(balance) / 10 ** Number(decimals) : 0,
    symbol: symbol as string | undefined,
    isError,
    isLoading,
    refetch,
  };
}
