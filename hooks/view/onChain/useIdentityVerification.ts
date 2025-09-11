import { useReadContract } from "wagmi";
import { useContractAddress } from "@/lib/addresses";
import tokenABI from "@/abi/token.json";
import identityRegistryABI from "@/abi/identityregistry.json";

export function useIdentityVerification(userAddress: string | undefined) {
  // Get the RWA token address to access its identity registry
  const rwaTokenAddress = useContractAddress("SpoutLQDtoken");

  // First get the identity registry address from the RWA token
  const {
    data: identityRegistryAddress,
    isLoading: isLoadingRegistry,
    error: registryError,
  } = useReadContract({
    address: rwaTokenAddress as `0x${string}`,
    abi: tokenABI.abi,
    functionName: "identityRegistry",
  });

  // Then check if the user is verified in the identity registry
  const {
    data: isVerified,
    isLoading: isLoadingVerification,
    error: verificationError,
    refetch: refetchVerification,
  } = useReadContract({
    address: identityRegistryAddress as `0x${string}`,
    abi: identityRegistryABI.abi,
    functionName: "isVerified",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!identityRegistryAddress && !!userAddress,
    },
  });

  return {
    isVerified: isVerified || false,
    isLoading: isLoadingRegistry || isLoadingVerification,
    error: registryError || verificationError,
    refetch: refetchVerification,
    identityRegistryAddress,
  };
}
