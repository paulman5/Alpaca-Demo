"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function KYCFlow() {
  const { publicKey, connected } = useWallet();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Function to check KYC status using external API
  const checkKycStatus = async (userAddress: string): Promise<boolean> => {
    const response = await fetch(
      `https://92a7be451ddb4f83627f81b188f8137bba80a65d-3000.dstack-prod5.phala.network/kyc/status/${userAddress}`
    );
    
    console.log("kyc status: ", response);
    if (!response.ok) {
      throw new Error(`KYC status check failed: ${response.status}`);
    }
    
    const data = await response.json();

    console.log("kyc status data: ", data);
    return data.isVerified === true;
  };

  // Function to refetch KYC status
  const refetch = async () => {
    const address = publicKey?.toBase58();
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const verified = await checkKycStatus(address);
      setIsVerified(verified);
      return { data: verified };
    } catch (e: any) {
      setError(e?.message || "Failed to check KYC status");
      return { data: null };
    } finally {
      setIsLoading(false);
    }
  };

  // Load KYC status on component mount and when address changes
  useEffect(() => {
    const addr = publicKey?.toBase58();
    if (addr) {
      refetch();
    } else {
      setIsVerified(null);
      setError(null);
    }
  }, [publicKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("KYC status refreshed");
    } catch (e) {
      toast.error("Failed to refresh KYC status");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVerify = async () => {
    const address = publicKey?.toBase58();
    if (!address) return;
    setIsPending(true);
    try {
      // Call external KYC verification API first
      const resp = await fetch(
        "https://92a7be451ddb4f83627f81b188f8137bba80a65d-3000.dstack-prod5.phala.network/kyc/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAddress: address }),
        },
      );
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(`KYC API failed: ${resp.status} ${msg}`);
      }
      
      // Poll external API KYC status every 2s up to 30s, then resolve
      const pollingToastId = toast.loading("Verification submitted. Checking status...");
      const startedAt = Date.now();
      const POLL_INTERVAL_MS = 2000;
      const TIMEOUT_MS = 30000;
      const poll = setInterval(async () => {
        try {
          const verified = await checkKycStatus(address);
          if (verified) {
            clearInterval(poll);
            toast.dismiss(pollingToastId);
            toast.success("KYC verified successfully!");
            setIsVerified(true);
            setIsPending(false);
          } else if (Date.now() - startedAt > TIMEOUT_MS) {
            clearInterval(poll);
            toast.dismiss(pollingToastId);
            toast("Verification still processing. Please check again shortly.");
            setIsPending(false);
          }
        } catch (e: any) {
          clearInterval(poll);
          toast.dismiss(pollingToastId);
          toast.error(e?.message || "Failed to check KYC status");
          setIsPending(false);
        }
      }, POLL_INTERVAL_MS);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit KYC verification");
      setIsPending(false);
    }
  };


  if (!connected) {
    return (
      <Card className="border border-[#004040]/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#004040]">
            <Shield className="h-5 w-5" />
            KYC Verification
          </CardTitle>
          <CardDescription>
            Connect your wallet to check and manage your KYC status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please connect your Solana wallet to access KYC verification features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#004040]/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#004040]">
            <Shield className="h-5 w-5" />
            KYC Verification Status
          </CardTitle>
          <CardDescription>
            Your current KYC verification status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#004040]" />
              ) : isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {isLoading ? "Checking status..." : isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <Badge 
              variant={isVerified ? "default" : "secondary"}
              className={isVerified ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
            >
              {isVerified ? "KYC Verified" : "Not KYC Verified"}
            </Badge>
          </div>

          {publicKey && (
            <div className="text-sm text-gray-600">
              <strong>Address:</strong> {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              isDisabled={isRefreshing}
              variant="outline"
              className="border-[#004040]/20 text-[#004040] hover:bg-[#004040]/5"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Status
            </Button>

            {!isVerified && (
              <Button
                onClick={handleVerify}
                isDisabled={isPending}
                className="bg-[#004040] hover:bg-[#004040]/90 text-white"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Verify KYC
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#004040]/15">
        <CardHeader>
          <CardTitle className="text-[#004040]">How KYC Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>{`KYC (Know Your Customer)`}</strong> verification is required for certain trading activities.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{`Click "Verify KYC" to submit a verification request`}</li>
            <li>Your verification status is managed through our secure API</li>
            <li>Verified users can access enhanced trading features</li>
            <li>Once verified, your KYC status is permanent</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Note: This is a simplified demo implementation. In production, KYC would involve 
            proper identity verification through a trusted third-party service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}