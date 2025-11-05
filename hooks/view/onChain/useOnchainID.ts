"use client";

import { useReadContract, useChainId } from "wagmi";
import idFactoryABI from "@/abi/idfactory.json";
import onchainidABI from "@/abi/onchainid.json";
import { AbiCoder, keccak256 } from "ethers";
import { contractaddresses } from "@/lib/addresses";
import { pharos } from "@/lib/chainconfigs/pharos";
import identityRegistryABI from "@/abi/identityregistry.json";
import tokenABI from "@/abi/token.json";
import { useState, useEffect } from "react";

export function useOnchainID({
  userAddress,
  idFactoryAddress,
  issuer,
  topic = 1,
}: {
  userAddress: string | undefined | null;
  idFactoryAddress: string;
  issuer: string;
  topic?: number;
}) {
  const chainId = useChainId();
  const isPharos = chainId === pharos.id;

  const [cachedIdentityAddress, setCachedIdentityAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined" && userAddress) {
      return localStorage.getItem(`identityAddress_${userAddress}_${chainId}`);
    }
    return null;
  });

  const canReadIdentity = !!userAddress && !!idFactoryAddress && isPharos && !cachedIdentityAddress;
  const { data: actualOnchainID, isLoading: isLoadingActualID, error: actualIDError, refetch: refetchActualID } =
    useReadContract({
      address: canReadIdentity ? (idFactoryAddress as `0x${string}`) : undefined,
      abi: idFactoryABI,
      functionName: "getIdentity",
      args: canReadIdentity ? [userAddress as `0x${string}`] : undefined,
      query: { enabled: canReadIdentity },
    });

  const rwaTokenAddress = contractaddresses.SpoutLQDtoken[chainId as 84532 | 688688] as `0x${string}`;
  const { data: identityRegistryAddress, isLoading: isLoadingRegistry, error: registryError } = useReadContract({
    address: rwaTokenAddress as `0x${string}`,
    abi: tokenABI.abi,
    functionName: "identityRegistry",
  });

  const canReadVerification = !!userAddress && !!identityRegistryAddress && isPharos;
  const { data: isVerified, isLoading: isVerificationLoading, error: verificationError, refetch: refetchVerification } =
    useReadContract({
      address: identityRegistryAddress as `0x${string}`,
      abi: identityRegistryABI.abi,
      functionName: "isVerified",
      args: canReadVerification ? [userAddress as `0x${string}`] : undefined,
      query: { enabled: canReadVerification },
    });

  const onchainID = cachedIdentityAddress || actualOnchainID;
  const isLoading = !cachedIdentityAddress && (isLoadingActualID || isLoadingRegistry || isVerificationLoading);
  const error = actualIDError || registryError || verificationError;

  const refetchIdentity = async () => {
    setCachedIdentityAddress(null);
    if (typeof window !== "undefined" && userAddress) {
      localStorage.removeItem(`identityAddress_${userAddress}_${chainId}`);
    }
    await refetchActualID();
    await refetchVerification();
  };

  const hasOnchainID = Boolean(
    onchainID && typeof onchainID === "string" && onchainID !== "0x0000000000000000000000000000000000000000",
  );

  const [hasEverHadOnchainID, setHasEverHadOnchainID] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && userAddress) {
      const storedHasEverHad = localStorage.getItem(`hasEverHadOnchainID_${userAddress}_${chainId}`);
      const initialHasEverHad = storedHasEverHad === "true";
      setHasEverHadOnchainID(initialHasEverHad);
      if (!cachedIdentityAddress) {
        const storedIdentityAddress = localStorage.getItem(`identityAddress_${userAddress}_${chainId}`);
        setCachedIdentityAddress(storedIdentityAddress);
      }
    }
  }, [userAddress, cachedIdentityAddress, chainId]);

  useEffect(() => {
    if (actualOnchainID && typeof actualOnchainID === "string") {
      setCachedIdentityAddress(actualOnchainID);
      if (typeof window !== "undefined" && userAddress) {
        localStorage.setItem(`identityAddress_${userAddress}_${chainId}`, actualOnchainID);
      }
    }
  }, [actualOnchainID, userAddress, chainId]);

  useEffect(() => {
    setCachedIdentityAddress(null);
  }, [userAddress]);

  useEffect(() => {
    if (hasOnchainID === true && !isLoading && userAddress) {
      setHasEverHadOnchainID(true);
      localStorage.setItem(`hasEverHadOnchainID_${userAddress}_${chainId}`, "true");
    }
  }, [hasOnchainID, isLoading, userAddress, chainId]);

  const onchainIDAddress =
    onchainID && typeof onchainID === "string" && onchainID !== "0x0000000000000000000000000000000000000000"
      ? onchainID
      : null;

  let claimId: `0x${string}` | undefined = undefined;
  if (issuer && topic !== undefined) {
    const abiCoder = AbiCoder.defaultAbiCoder();
    claimId = keccak256(abiCoder.encode(["address", "uint256"], [issuer as `0x${string}`, topic])) as `0x${string}`;
  }

  const canReadClaim = !!onchainID && !!claimId;
  const { data: kycClaim, isLoading: kycLoading, error: kycError, refetch: refetchClaim } = useReadContract({
    address: canReadClaim ? (onchainID as `0x${string}`) : undefined,
    abi: onchainidABI,
    functionName: "getClaim",
    args: canReadClaim ? [claimId] : [],
    query: { enabled: canReadClaim },
  });

  let hasKYCClaim = false;
  if (kycClaim && issuer && topic !== undefined && Array.isArray(kycClaim)) {
    const claimIssuer = kycClaim[2];
    const claimTopic = kycClaim[0];
    const isIssuerMatch = claimIssuer && claimIssuer.toLowerCase() === issuer.toLowerCase();
    const isTopicMatch = claimTopic !== undefined && Number(claimTopic) === topic;
    const isNotZeroAddress = claimIssuer !== "0x0000000000000000000000000000000000000000";
    hasKYCClaim = isIssuerMatch && isTopicMatch && isNotZeroAddress;
  }

  const refetch = async () => {
    await refetchIdentity();
    if (canReadClaim) await refetchClaim();
  };

  return {
    hasOnchainID,
    hasEverHadOnchainID,
    onchainIDAddress,
    loading: isLoading,
    error,
    hasKYCClaim,
    kycClaim,
    kycLoading,
    kycError,
    refetch,
    isVerified: isVerified || false,
  };
}

