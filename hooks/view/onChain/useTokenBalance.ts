import { useReadContract } from "wagmi";
import erc20ABI from "@/abi/erc20.json";

export function useTokenBalance(token: `0x${string}` | null, owner: `0x${string}` | null) {
  const canRead = Boolean(token && owner);
  const { data: balance, isLoading: balLoading, error: balError, refetch } = useReadContract({
    address: canRead ? (token as `0x${string}`) : undefined,
    abi: erc20ABI as any,
    functionName: "balanceOf",
    args: canRead ? [owner as `0x${string}`] : undefined,
    query: { enabled: canRead },
  });
  const { data: decimals } = useReadContract({
    address: canRead ? (token as `0x${string}`) : undefined,
    abi: erc20ABI as any,
    functionName: "decimals",
    query: { enabled: canRead },
  });

  const amountRaw = balance ? (balance as bigint).toString() : null;
  const dec = typeof decimals === "number" ? decimals : Number(decimals ?? 0);
  const amountUi = balance != null && dec >= 0 ? ((Number(balance) / 10 ** dec).toString()) : null;

  return { amountRaw, decimals: dec, amountUi, isLoading: balLoading, error: balError ? String(balError) : null, refetch };
}


