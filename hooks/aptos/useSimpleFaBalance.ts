"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAptosClient } from "./useAptosClient";

// Simple FA balance hook specialized for USDC in simpleToken module (6 decimals)
const MODULE_ADDRESS_V2 =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SPOUT_MODULE_ADDRESS_V2) ||
  "0x27220ac73da9851e597d9a016baa842b7c33b064f322da7ca24230ad5e606554";

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

export function useSimpleFaBalance(ownerAddress: string | undefined) {
  const client = useAptosClient();
  const [raw, setRaw] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // USDC fixed at 6 decimals
  const decimals = 6;

  const refetch = useCallback(async () => {
    if (!ownerAddress) return { data: undefined as any } as const;
    setIsLoading(true);
    setError(null);
    try {
      const functionName = `${MODULE_ADDRESS_V2}::simpleToken::balance`;
      const [result] = await client.view({
        function: functionName,
        type_arguments: [],
        arguments: [ownerAddress],
      });
      const value = BigInt(result ?? 0);
      setRaw(value);
      return { data: value } as const;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch USDC FA balance");
      return { data: undefined as any } as const;
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress, client]);

  useEffect(() => {
    if (ownerAddress) void refetch();
  }, [ownerAddress, refetch]);

  const formatted = useMemo(() => {
    if (raw === null) return null;
    return formatFromDecimals(raw, decimals);
  }, [raw]);

  return { raw, formatted, decimals, isLoading, error, refetch } as const;
}


