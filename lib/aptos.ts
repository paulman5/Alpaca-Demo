// Aptos config and addresses

// Hardcode Aptos Testnet fullnode URL
export const APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";

// Example: "0x1234..." without module suffix
// Keep existing defaults for publisher/modules
const ENV = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;

export const APTOS_PUBLISHER_ADDRESS =
  ENV.MODULE_PUBLISHER_ACCOUNT_ADDRESS ||
  "0x55816489757de1d92999dad0629734b877a22455a7fe05e1de36645389646ceb";

// Fully qualified module name, e.g., "0xabc::SpoutToken"
export const APTOS_MODULE =
  ENV.NEXT_PUBLIC_APTOS_MODULE || `${APTOS_PUBLISHER_ADDRESS}::SpoutToken`;

// Additional modules
export const APTOS_KYC_MODULE =
  ENV.NEXT_PUBLIC_APTOS_KYC_MODULE || `${APTOS_PUBLISHER_ADDRESS}::kyc_registry`;

export const APTOS_ORDERS_MODULE =
  ENV.NEXT_PUBLIC_APTOS_ORDERS_MODULE || `${APTOS_PUBLISHER_ADDRESS}::orders`;


