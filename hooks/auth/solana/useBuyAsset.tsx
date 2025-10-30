import { useCallback, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN, AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
// 1) Program ID + IDL (adjust import path to your build setup)
import idl from "@/idl/spoutsolana.json";

// 2) Hardcoded PDAs and constants (devnet)
const PROGRAM_ID = new PublicKey("EkU7xRmBhVyHdwtRZ4SJ9D3Nz6SeAvymft7nz3CL2XXB");
const ORDER_EVENTS_PDA = new PublicKey("8Xk151dxP3vs9tiR64hPRqNzjrGojvVqWz2vye2tMsrM");

// USDC (mock)
const USDC_MINT = new PublicKey("Bd8tBm8WNPhmW5FjvAkisw4C9G3NEE7NowEW6VUuMHjW");

// SAS constants (devnet)
const SAS_PROGRAM_ID = new PublicKey("22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG");
const CREDENTIAL_PDA = new PublicKey("B4PtmaDJdFQBxpvwdLB3TDXuLd69wnqXexM2uBqqfMXL");
const SCHEMA_PDA = new PublicKey("GvJbCuyqzTiACuYwFzqZt7cEPXSeD5Nq3GeWBobFfU8x");

// If you know the attestation PDA for the user, hardcode here for testing.
// Otherwise derive it via sas-lib in your app and pass in as override.
const DEFAULT_ATTESTATION_PDA = new PublicKey("CCk57tftGZpe6ZPRzqGVmPehTtDDqNwzgwx92qBhQTSh");

// This is any account with data for manual flow; not used by buy_asset_manual logic.
// You can reuse order events PDA or a random sysvar; it’s Unchecked on-chain in manual path.
const DUMMY_PRICE_FEED = ORDER_EVENTS_PDA;

type UseBuyManualResult = {
  buyManual: (args?: {
    ticker?: string;
    usdcAmount?: number;     // 6 decimals (e.g. 1 USDC => 1_000_000)
    manualPrice?: number;    // 6 decimals price (e.g. 1 USDC => 1_000_000)
    attestationPdaOverride?: PublicKey;
    ordersUsdcAccountOverride?: PublicKey; // treasury USDC account (ATA of some authority)
  }) => Promise<string>;
  isSubmitting: boolean;
  error: string | null;
};

export function useBuyAssetManual(): UseBuyManualResult {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anchor provider and program
  const provider = useMemo(() => {
    if (!publicKey || !signTransaction) return null;
    const wallet = {
      publicKey,
      signTransaction: async (tx: Transaction) => {
        const signed = await signTransaction(tx);
        return signed;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        const signed = await Promise.all(txs.map(signTransaction));
        return signed;
      },
    };
    return new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  }, [connection, publicKey, signTransaction]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl as any, PROGRAM_ID, provider);
  }, [provider]);

  const buyManual = useCallback(async (args?: {
    ticker?: string;
    usdcAmount?: number;
    manualPrice?: number;
    attestationPdaOverride?: PublicKey;
    ordersUsdcAccountOverride?: PublicKey;
  }): Promise<string> => {
    if (!program || !provider || !publicKey) throw new Error("Wallet not connected");

    setIsSubmitting(true);
    setError(null);

    try {
      // Defaults for a quick smoke test
      const ticker = args?.ticker ?? "LQD";
      const usdcAmount = args?.usdcAmount ?? 1_000_000;  // 1.0 USDC
      const manualPrice = args?.manualPrice ?? 1_000_000; // $1.0 price in 6 decimals

      // User USDC ATA (source)
      const userUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);

      // Destination USDC for the orders "treasury" (for demo we reuse wallet’s ATA; you can point to your treasury ATA)
      const ordersUsdcAccount =
        args?.ordersUsdcAccountOverride ?? getAssociatedTokenAddressSync(USDC_MINT, publicKey);

      // Attestation PDA (hardcoded default for testing)
      const attestationAccount = args?.attestationPdaOverride ?? DEFAULT_ATTESTATION_PDA;

      // PDA for orders authority: seeds [b"orders_authority"]
      const [ordersAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("orders_authority")],
        PROGRAM_ID
      );

      // Build RPC
      const sig = await program.methods
        .buyAssetManual(ticker, new BN(usdcAmount), new BN(manualPrice))
        .accounts({
          user: publicKey,
          userUsdcAccount: userUsdcAta,
          orderEvents: ORDER_EVENTS_PDA,
          ordersUsdcAccount,
          ordersAuthority,
          usdcMint: USDC_MINT,
          attestationAccount,
          schemaAccount: SCHEMA_PDA,
          credentialAccount: CREDENTIAL_PDA,
          sasProgram: SAS_PROGRAM_ID,
          priceFeed: DUMMY_PRICE_FEED,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return sig;
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit buy_asset_manual");
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [program, provider, publicKey]);

  return { buyManual, isSubmitting, error };
}

export default useBuyAssetManual;