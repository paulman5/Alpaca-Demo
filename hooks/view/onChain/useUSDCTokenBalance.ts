import { useContractAddress } from "@/lib/addresses";
import { useTokenBalance } from "./useTokenBalance";
import { useAccount } from "wagmi";

export function useUSDCTokenBalance() {
  const usdc = useContractAddress("usdc") as `0x${string}`;
  const { address } = useAccount();
  return useTokenBalance(usdc, (address ?? null) as any);
}


