import { useReadContract } from "wagmi";
import erc3643ABI from "@/abi/erc3643.json";
import { useContractAddress } from "@/lib/addresses";

export function useTokenBalance(address: string | undefined) {
  const tokenAddress = useContractAddress("SpoutLQDtoken");

  // Get decimals
  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
    functionName: "decimals",
  });

  // Get balance
  const {
    data: balance,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
    functionName: "balanceOf",
    args: [address],
  });

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
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
