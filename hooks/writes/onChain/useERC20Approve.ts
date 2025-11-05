import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import erc20ABI from "@/abi/erc20.json";

export function useERC20Approve(token: `0x${string}`) {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const approve = async (spender: `0x${string}`, amount: bigint) => {
    return await writeContractAsync({ address: token, abi: erc20ABI as any, functionName: "approve", args: [spender, amount] });
  };

  return { approve, isPending, isConfirming, isSuccess };
}



