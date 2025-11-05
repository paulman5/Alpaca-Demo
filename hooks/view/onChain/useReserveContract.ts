"use client";

import { useReadContract, useWriteContract } from "wagmi";
import reserveABI from "@/app-interface-demo/abi/proof-of-reserve.json";

export function useReserveContract(reserveAddress: `0x${string}`) {
  const {
    writeContract: requestReserves,
    isPending: isRequestPending,
    error: requestError,
  } = useWriteContract();

  const { data: totalReserves, refetch: refetchReserves } = useReadContract({
    address: reserveAddress,
    abi: reserveABI as any,
    functionName: "getReserves",
  });

  const executeRequestReserves = (subscriptionId: number) => {
    requestReserves({
      address: reserveAddress,
      abi: reserveABI as any,
      functionName: "requestReserves",
      args: [subscriptionId],
    });
  };

  return {
    requestReserves: executeRequestReserves,
    isRequestPending,
    requestError,
    totalReserves,
    refetchReserves,
  };
}


