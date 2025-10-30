import { useCallback, useMemo, useState, useEffect } from "react";
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
  console.log('useTokenBalance rendered', { mint, owner });
  const { connection } = useConnection();

  // Use provided mint and owner directly (no hardcoding)
  const effectiveMint = mint;
  const effectiveOwner = owner;

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
    console.log('fetchBalance CALLED in useTokenBalance');
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

  useEffect(() => {
    if (mint && owner) {
      fetchBalance();
    }
  }, [mint, owner, fetchBalance]);

  return { amountRaw, decimals, amountUi, isLoading, error, refetch: fetchBalance };
}