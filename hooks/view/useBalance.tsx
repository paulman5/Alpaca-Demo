import { useCallback, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export type UseTokenBalanceResult = {
  amountRaw: string | null;
  decimals: number | null;
  amountUi: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTokenBalance(mint: PublicKey | null, owner: PublicKey | null): UseTokenBalanceResult {
  const { connection } = useConnection();

  // DEBUG: hardcoded mint and owner to verify inputs
  const effectiveMint = useMemo(() => new PublicKey("GnYQJqqkiN5CTJhCT8Ko3Qd1JQYNj5n91gLJinamt5Xg"), []);
  const effectiveOwner = useMemo(() => new PublicKey("Dd454fdtKRF5NEAbwCCVJnj8P4FroAD8Ei4dHRWUC4LW"), []);

  const [amountRaw, setAmountRaw] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [amountUi, setAmountUi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ataPromise = useMemo(() => {
    if (!effectiveMint || !effectiveOwner) return null;
    return getAssociatedTokenAddress(effectiveMint, effectiveOwner);
  }, [effectiveMint, effectiveOwner]);

  const fetchBalance = useCallback(async () => {
    if (!ataPromise) {
      setAmountRaw(null); setAmountUi(null); setDecimals(null);
      return;
    }
    setIsLoading(true); setError(null);
    try {
      const ata = await ataPromise;
      const { value } = await connection.getTokenAccountBalance(ata, "confirmed");
      setAmountRaw(value.amount);
      setDecimals(value.decimals);
      setAmountUi(value.uiAmountString ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch token balance");
      setAmountRaw(null); setAmountUi(null); setDecimals(null);
    } finally {
      setIsLoading(false);
    }
  }, [connection, ataPromise]);

  // NOTE: No automatic fetch here; call refetch() manually from the consumer.

  return { amountRaw, decimals, amountUi, isLoading, error, refetch: fetchBalance };
}