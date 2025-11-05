export const contractaddresses = {
  gateway: {
    84532: "0xf04430Ffe6da40FE233c50909A9ebEA43dc8FDaB",
    688688: "0x126F0c11F3e5EafE37AB143D4AA688429ef7DCB3",
  },
  idfactory: {
    84532: "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536",
    688688: "0x18cB5F2774a80121d1067007933285B32516226a",
  },
  issuer: {
    84532: "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F",
    688688: "0xA5C77b623BEB3bC0071fA568de99e15Ccc06C7cb",
  },
  orders: {
    84532: "0x1EE5DdF4c8Ac5C3359f360098AE85289D4874993",
    688688: "0xcDA0C7Dd4C8920223A947557cC4A54B45015e3eD",
  },
  usdc: {
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    688688: "0x72df0bcd7276f2dFbAc900D1CE63c272C4BCcCED",
  },
  rwatoken: {
    84532: "0x3777f8d72E820632bbf82661AC75D82127349c48",
    688688: "0x3777f8d72E820632bbf82661AC75D82127349c48",
  },
  SpoutLQDtoken: {
    84532: "0x3777f8d72E820632bbf82661AC75D82127349c48",
    688688: "0x3777f8d72E820632bbf82661AC75D82127349c48",
  },
  proofOfReserve: {
    84532: "0x0000000000000000000000000000000000000000",
    688688: "0x72F88509C53b939a0613c679a0F4768c0444d247",
  },
};

export const USDC_DECIMALS = 6;

import { useChainId } from "wagmi";

export function useContractAddress(contract: keyof typeof contractaddresses) {
  const chainId = useChainId();
  console.log("current chainID:", chainId);
  const mapping = contractaddresses[contract] as Record<number, string> | undefined;
  if (!mapping) {
    console.error(`Unknown contract mapping for key: ${String(contract)}`);
    return undefined as any;
  }
  const value = mapping[chainId];
  if (!value) {
    console.error(`No address for chainId ${chainId} in mapping ${String(contract)}`);
  }
  return value as any;
}


