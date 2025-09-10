import { useAccount, useSwitchChain } from "wagmi";
import { pharos } from "@/lib/chainconfigs/pharos";
export const useNetworkSwitch = () => {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const checkAndSwitchNetwork = async () => {
    if (!chainId) {
      throw new Error("No chain detected. Please connect your wallet.");
    }

    if (chainId !== pharos.id) {
      try {
        await switchChainAsync({ chainId: pharos.id });
      } catch (err) {
        console.error("Error switching network:", err);
        throw new Error("Failed to switch to Pharos Testnet network");
      }
    }
  };

  return {
    checkAndSwitchNetwork,
    isPharos: chainId === pharos.id,
    currentChain: chainId,
  };
};
