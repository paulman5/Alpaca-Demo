"use client";

import { useMemo } from "react";
import { APTOS_NODE_URL } from "@/lib/aptos";

export function useAptosClient() {
  const client = useMemo(() => {
    return {
      async view(payload: any) {
        const res = await fetch(`${APTOS_NODE_URL}/view`, {
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
  }, []);

  return client;
}



