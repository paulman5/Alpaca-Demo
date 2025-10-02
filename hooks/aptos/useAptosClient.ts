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
      async getAptBalanceViaView(address: string) {
        const payload = {
          function: "0x1::coin::balance",
          type_arguments: ["0x1::aptos_coin::AptosCoin"],
          arguments: [address],
        };
        const res = await fetch(`${nodeUrl}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Aptos view failed: ${res.status} ${text}`);
        }
        const out = (await res.json()) as any[];
        const raw = (out?.[0] ?? "0").toString();
        return BigInt(raw);
      },
      async getAccountBalance(address: string) {
        const resourcePath = `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`;
        // Prefer view function (works even when CoinStore not yet published for account)
        try {
          const viaView = await (this as any).getAptBalanceViaView(address);
          return viaView;
        } catch {}

        // Attempt precise resource endpoint
        try {
          const res = await fetch(`${nodeUrl}/accounts/${address}/resource/${encodeURIComponent(resourcePath)}`);
          if (res.status === 404) return BigInt("0");
          if (res.ok) {
            const json = (await res.json()) as any;
            const raw = json?.data?.coin?.value ?? "0";
            return BigInt(raw);
          }
        } catch {}

        // Fallback: list all resources and find CoinStore
        const resAll = await fetch(`${nodeUrl}/accounts/${address}/resources`);
        if (!resAll.ok) {
          const text = await resAll.text();
          throw new Error(`Aptos resources failed: ${resAll.status} ${text}`);
        }
        const resources = (await resAll.json()) as any[];
        const coinStore = resources.find((r) => typeof r?.type === "string" && r.type.includes(resourcePath));
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



