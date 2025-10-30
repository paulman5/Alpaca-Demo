import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

// Example SAS program pubkey (replace with your value)
const SAS_PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWxTWqyb9q5Q8b5RDcEcHMvGxT37");

// Example deriveAttestationPda (replace seed logic with your actual derivation)
export function deriveAttestationPda({
  credential,
  schema,
  user
}: {
  credential: PublicKey;
  schema: PublicKey;
  user: PublicKey;
}): [PublicKey, number] {
  // See your Rust helper for proper seeds & bump calculation
  return PublicKey.findProgramAddressSync(
    [
      credential.toBuffer(),
      schema.toBuffer(),
      user.toBuffer(), // modify based on your program's implementation!
    ],
    SAS_PROGRAM_ID
  );
}

export function useKycStatus() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isKycVerified, setIsKycVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcode the actual addresses for debug/testing
  const credentialPda = new PublicKey("B4PtmaDJdFQBxpvwdLB3TDXuLd69wnqXexM2uBqqfMXL");
  const schemaPda = new PublicKey("GvJbCuyqzTiACuYwFzqZt7cEPXSeD5Nq3GeWBobFfU8x");
  const user = new PublicKey("DoBKyQ8wJF5veKrNcxS5BeSCW4bpAwHqDQpbaSpRTdvc");

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsKycVerified(null);
    try {
      // Derive attestation PDA (ensure PROGRAM_ID is correct for your deployment)
      const SAS_PROGRAM_ID = new PublicKey("22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG");
      const [pda] = PublicKey.findProgramAddressSync(
        [credentialPda.toBuffer(), schemaPda.toBuffer(), user.toBuffer()],
        SAS_PROGRAM_ID
      );
      const pdaInfo = await connection.getAccountInfo(pda, "confirmed");
      if (!pdaInfo) {
        setIsKycVerified(false);
        return;
      }
      if (!pdaInfo.owner.equals(SAS_PROGRAM_ID)) {
        setIsKycVerified(false);
        setError("Attestation exists but is not owned by SAS program");
        return;
      }
      setIsKycVerified(true);
    } catch (err: any) {
      setError(err?.message || "Failed to check KYC");
      setIsKycVerified(null);
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  return {
    isKycVerified,
    loading,
    error,
    refetch: fetchKyc,
  };
}

export default useKycStatus;