"use client";

import { useState } from "react";
import { useAptosWallet } from "@/hooks/aptos/useAptosWallet";
import { useIsKycVerified, useKycRegistry } from "@/hooks/aptos/useKycRegistry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function KYCFlow() {
  const { address, isConnected } = useAptosWallet();
  const { isVerified, isLoading, error, refetch } = useIsKycVerified(address || undefined);
  const { setVerified, isPending, error: txError, txHash } = useKycRegistry();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (!address) return;
    try {
      await setVerified(address, true);
      toast.success("KYC verification submitted successfully!");
      // Refresh status after a short delay
      setTimeout(() => refetch(), 2000);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit KYC verification");
    }
  };

  const handleUnverify = async () => {
    if (!address) return;
    try {
      await setVerified(address, false);
      toast.success("KYC verification removed");
      // Refresh status after a short delay
      setTimeout(() => refetch(), 2000);
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove KYC verification");
    }
  };

  if (!isConnected) {
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
            Please connect your Aptos wallet to access KYC verification features.
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
            Your current KYC verification status on the Aptos network.
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

          {address && (
            <div className="text-sm text-gray-600">
              <strong>Address:</strong> {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {txError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <strong>Transaction Error:</strong> {txError}
            </div>
          )}

          {txHash && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <strong>Transaction Hash:</strong> {txHash}
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

            {isVerified ? (
              <Button
                onClick={handleUnverify}
                isDisabled={isPending}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Remove Verification
              </Button>
            ) : (
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
            <strong>KYC (Know Your Customer)</strong> verification is required for certain trading activities.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Click "Verify KYC" to submit a verification request</li>
            <li>Your verification status is stored on the Aptos blockchain</li>
            <li>Verified users can access enhanced trading features</li>
            <li>You can remove verification at any time</li>
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