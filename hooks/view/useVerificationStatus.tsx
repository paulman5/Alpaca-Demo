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

export function useKycStatus({
  credentialPda,
  schemaPda,
  targetUser,
  pollInterval = 0,
}: {
  credentialPda: PublicKey;
  schemaPda: PublicKey;
  targetUser?: PublicKey | null;
  pollInterval?: number; // in ms, optional. Default: 0 (no polling)
}) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isKycVerified, setIsKycVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = targetUser ?? publicKey ?? null;

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsKycVerified(null);
    try {
      if (!user) throw new Error("No wallet connected");
      // Derive the attestation PDA
      const [pda] = deriveAttestationPda({
        credential: credentialPda,
        schema: schemaPda,
        user: user,
      });
      // Fetch the PDA account
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
  }, [connection, credentialPda, schemaPda, user]);

  // Polling effect
  useEffect(() => {
    if (!user || pollInterval <= 0) return;
    let isMounted = true;
    let intervalId: NodeJS.Timeout | undefined;
    const poll = async () => {
      if (!isMounted) return;
      await fetchKyc();
    };
    poll(); // initial fetch
    intervalId = setInterval(poll, pollInterval);
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchKyc, user, pollInterval]);

  return {
    isKycVerified,
    loading,
    error,
    refetch: fetchKyc,
  };
}

export default useKycStatus;