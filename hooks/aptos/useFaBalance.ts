"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAptosClient } from "./useAptosClient";

// Configure your deployed module address here
const MODULE_ADDRESS =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SPOUT_MODULE_ADDRESS) ||
  "0x59affcd91dd0fae47f7504f827c16482f3e7839974c8a370594de284ad043b4f";

// Decimal map per token symbol in SpoutTokenV2 (adjust if needed)
const TOKEN_DECIMALS: Record<string, number> = {
  USD: 6,
  USDC: 6,
  USDT: 6,
  LQD: 9,
  TSLA: 6,
  AAPL: 6,
  GOLD: 6,
};

function pow10BigInt(decimals: number): bigint {
  let result = BigInt("1");
  for (let i = 0; i < decimals; i += 1) result *= BigInt("10");
  return result;
}

function formatFromDecimals(raw: bigint, decimals: number): string {
  const base = pow10BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return fractionStr.length ? `${whole.toString()}.${fractionStr}` : whole.toString();
}

export function useFaBalance(ownerAddress: string | undefined, symbol: keyof typeof TOKEN_DECIMALS) {
  const client = useAptosClient();
  const [raw, setRaw] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decimals = TOKEN_DECIMALS[String(symbol)] ?? 6;

  const refetch = useCallback(async () => {
    if (!ownerAddress) return { data: undefined as any } as const;
    setIsLoading(true);
    setError(null);
    try {
      const functionName = `${MODULE_ADDRESS}::SpoutTokenV2::balance`;
      const typeArg = `${MODULE_ADDRESS}::SpoutTokenV2::${String(symbol)}`;
      const [result] = await client.view({
        function: functionName,
        type_arguments: [typeArg],
        arguments: [ownerAddress],
      });
      const value = BigInt(result ?? 0);
      setRaw(value);
      return { data: value } as const;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch FA balance");
      return { data: undefined as any } as const;
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress, client, symbol]);

  useEffect(() => {
    if (ownerAddress) void refetch();
  }, [ownerAddress, refetch]);

  const formatted = useMemo(() => {
    if (raw === null) return null;
    return formatFromDecimals(raw, decimals);
  }, [raw, decimals]);

  return { raw, formatted, decimals, isLoading, error, refetch } as const;
}


