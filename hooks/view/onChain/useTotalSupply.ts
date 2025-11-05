import { useReadContract } from "wagmi";
import erc20ABI from "@/abi/erc20.json";

export function useTotalSupply(token: `0x${string}` | null) {
  const { data: totalSupply, isLoading, error } = useReadContract({
    address: token ?? undefined,
    abi: erc20ABI as any,
    functionName: "totalSupply",
    query: { enabled: Boolean(token) },
  });
  return { totalSupply: (totalSupply as bigint) ?? null, isLoading, error };
}


