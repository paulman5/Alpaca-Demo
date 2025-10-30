import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

// SAS program id (kept for reference; sas-lib handles PDA derivation internally)
const SAS_PROGRAM_ID = new PublicKey("22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG");

export function useKycStatus() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isKycVerified, setIsKycVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded values for testing as requested
  const credential = "B4PtmaDJdFQBxpvwdLB3TDXuLd69wnqXexM2uBqqfMXL";
  const schema = "GvJbCuyqzTiACuYwFzqZt7cEPXSeD5Nq3GeWBobFfU8x";
  const nonce = "DoBKyQ8wJF5veKrNcxS5BeSCW4bpAwHqDQpbaSpRTdvc";

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsKycVerified(null);
    try {
      // Dynamically import sas-lib and gill to avoid bundling issues if unavailable
      const [{ createSolanaClient }, sas] = await Promise.all([
        import("gill"),
        import("sas-lib"),
      ]);
      const { deriveAttestationPda, fetchSchema, fetchAttestation, deserializeAttestationData } = sas as any;

      // Use provided Alchemy devnet RPC URL for speed
      const rpcUrl = "https://solana-devnet.g.alchemy.com/v2/fCmYqFoeAKRXmT4X43KhU";
      const client = createSolanaClient({ urlOrMoniker: rpcUrl });

      const [attPda] = await deriveAttestationPda({ credential, schema, nonce });

      // Fetch schema and attestation then deserialize to inspect KYC flag and expiry
      const sch: any = await fetchSchema(client.rpc, schema as any);
      const att: any = await fetchAttestation(client.rpc, attPda as any);
      const data: any = deserializeAttestationData(sch.data, att.data.data as Uint8Array);

      const now = BigInt(Math.floor(Date.now() / 1000));
      const isValid = now < att.data.expiry && data.kycCompleted === 1;
      setIsKycVerified(Boolean(isValid));
    } catch (err: any) {
      // If any step fails (including account not found), treat as not verified
      setIsKycVerified(false);
      setError(err?.message || "Failed to check KYC");
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