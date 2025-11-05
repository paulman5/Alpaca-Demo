import { useReadContract } from "wagmi";
import { useContractAddress } from "@/lib/addresses";
import tokenABI from "@/abi/token.json";
import identityRegistryABI from "@/abi/identityregistry.json";

export function useIdentityVerification(userAddress: string | undefined) {
  const rwaTokenAddress = useContractAddress("SpoutLQDtoken");

  const { data: identityRegistryAddress, isLoading: isLoadingRegistry, error: registryError } = useReadContract({
    address: rwaTokenAddress as `0x${string}`,
    abi: tokenABI.abi,
    functionName: "identityRegistry",
  });

  const { data: isVerified, isLoading: isLoadingVerification, error: verificationError, refetch: refetchVerification } =
    useReadContract({
      address: identityRegistryAddress as `0x${string}`,
      abi: identityRegistryABI.abi,
      functionName: "isVerified",
      args: userAddress ? [userAddress as `0x${string}`] : undefined,
      query: { enabled: !!identityRegistryAddress && !!userAddress },
    });

  return {
    isVerified: isVerified || false,
    isLoading: isLoadingRegistry || isLoadingVerification,
    error: registryError || verificationError,
    refetch: refetchVerification,
    identityRegistryAddress,
  };
}


