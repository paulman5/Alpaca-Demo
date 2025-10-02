"use client";

import { useMemo } from "react";
import { useAptosNetwork } from "@/context/AptosNetworkContext";

export function useAptosClient() {
  const { nodeUrl } = useAptosNetwork();
  const client = useMemo(() => {
    return {
      async getAccount(address: string) {
        const res = await fetch(`${nodeUrl}/accounts/${address}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Aptos account failed: ${res.status} ${text}`);
        }
        return (await res.json()) as any;
      },
      async getAccountBalance(address: string) {
        const res = await fetch(`${nodeUrl}/accounts/${address}/resources`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Aptos resources failed: ${res.status} ${text}`);
        }
        const resources = (await res.json()) as any[];
        const coinStore = resources.find((r) => r.type?.includes("0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"));
        const raw = coinStore?.data?.coin?.value ?? "0";
        return BigInt(raw);
      },
      async getAccountResource(address: string, resourceType: string) {
        const res = await fetch(`${nodeUrl}/accounts/${address}/resource/${encodeURIComponent(resourceType)}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Aptos resource failed: ${res.status} ${text}`);
        }
        return (await res.json()) as any;
      },
      async view(payload: any) {
        const res = await fetch(`${nodeUrl}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Aptos view failed: ${res.status} ${text}`);
        }
        return (await res.json()) as any[];
      },
    };
  }, [nodeUrl]);

  return client;
}



