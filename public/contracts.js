// Auto-generated from @aastar/shared-config v0.3.6
// DO NOT EDIT MANUALLY - Run 'npm run build:contracts' to regenerate
// Generated at: 2025-11-20T02:37:57.097Z

const CONTRACTS = {
  "GTOKEN": "0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc",
  "GTOKEN_STAKING": "0xbEbF9b4c6a4cDB92Ac184aF211AdB13a0b9BF6c0",
  "REGISTRY": "0x49245E1f3c2dD99b3884ffeD410d0605Cf4dC696",
  "SUPER_PAYMASTER_V2": "0xe8c579dc426eC22168c3286da1aBd5458a5904A3",
  "PAYMASTER_FACTORY": "0x65Cf6C4ab3d40f3C919b6F3CADC09Efb72817920",
  "MYSBT": "0xc364A68Abd38a6428513abE519dEEA410803BB5A",
  "XPNTS_FACTORY": "0x9dD72cB42427fC9F7Bf0c949DB7def51ef29D6Bd",
  "USDT": "0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc",
  "APNTS": "0xBD0710596010a157B88cd141d797E8Ad4bb2306b",
  "BPNTS": "0x70Da2c1B7Fcf471247Bc3B09f8927a4ab1751Ba3",
  "PAYMASTER_V4_1": "0x4D6A367aA183903968833Ec4AE361CFc8dDDBA38",
  "ENTRYPOINT": "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
};

// Contract metadata with version info and categories
const CONTRACT_METADATA = [
  {
    "name": "GToken",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc",
    "features": [
      "VERSION interface",
      "ERC20 governance token",
      "Mintable with cap",
      "Ownable"
    ],
    "category": "core"
  },
  {
    "name": "SuperPaymasterV2",
    "version": "2.3.2",
    "versionCode": 20302,
    "deployedAt": "2025-11-20",
    "address": "0xe8c579dc426eC22168c3286da1aBd5458a5904A3",
    "features": [
      "VERSION interface",
      "Unified architecture",
      "xPNTs gas token support",
      "Reputation-based pricing",
      "Multi-operator support",
      "registerOperatorWithAutoStake (1-step registration)",
      "CEI pattern fix - state changes before external calls",
      "nonReentrant protection added",
      "Price cache auto-update fix (was broken in v2.3.1)",
      "Storage packing optimization (~800 gas saved)",
      "Batch state updates (~200-400 gas saved)",
      "Total gas optimization: ~5.5-11.2k gas vs v2.3.1"
    ],
    "category": "core"
  },
  {
    "name": "Registry",
    "version": "2.2.1",
    "versionCode": 20201,
    "deployedAt": "2025-11-09",
    "address": "0x49245E1f3c2dD99b3884ffeD410d0605Cf4dC696",
    "features": [
      "VERSION interface",
      "allowPermissionlessMint defaults to true",
      "transferCommunityOwnership",
      "Community registration",
      "GToken staking requirement",
      "Slash mechanism",
      "Uses new GTokenStaking with GToken v2.0.0",
      "isRegistered mapping (duplicate prevention)"
    ],
    "category": "core"
  },
  {
    "name": "GTokenStaking",
    "version": "2.0.1",
    "versionCode": 20001,
    "deployedAt": "2025-11-05",
    "address": "0xbEbF9b4c6a4cDB92Ac184aF211AdB13a0b9BF6c0",
    "features": [
      "VERSION interface",
      "User-level slash tracking",
      "1:1 shares model",
      "Lock mechanism",
      "Percentage-based exit fee",
      "Multiple locker support",
      "Uses new GToken v2.0.0",
      "stakeFor() function - stake on behalf of users"
    ],
    "category": "core"
  },
  {
    "name": "PaymasterFactory",
    "version": "1.0.0",
    "versionCode": 10000,
    "deployedAt": "2025-11-01",
    "address": "0x65Cf6C4ab3d40f3C919b6F3CADC09Efb72817920",
    "features": [
      "EIP-1167 Minimal Proxy",
      "Version management",
      "Permissionless Paymaster deployment",
      "Operator tracking",
      "Gas-efficient (~100k gas per deployment)"
    ],
    "category": "core"
  },
  {
    "name": "xPNTsFactory",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x9dD72cB42427fC9F7Bf0c949DB7def51ef29D6Bd",
    "features": [
      "VERSION interface",
      "Unified architecture",
      "Gas token creation",
      "Community-specific tokens",
      "Auto-approved spenders"
    ],
    "category": "tokens"
  },
  {
    "name": "MySBT",
    "version": "2.4.4",
    "versionCode": 20404,
    "deployedAt": "2025-11-19",
    "address": "0xc364A68Abd38a6428513abE519dEEA410803BB5A",
    "features": [
      "IVersioned interface: version() returns 2004004, versionString() returns \"v2.4.4\"",
      "VERSION constants: VERSION=\"2.4.4\", VERSION_CODE=20404",
      "NFT architecture refactor",
      "Soulbound token (SBT)",
      "Time-based reputation",
      "Membership management",
      "GToken mint fee (burn)",
      "safeMint() - DAO-only faucet minting",
      "mintWithAutoStake() - FIXED: correct token transfer order for stake + burn",
      "airdropMint() - NEW: Operator-paid batch minting (no user approval needed)",
      "Operator pays all costs: 0.4 GT per user (0.1 burn + 0.3 stake)",
      "True airdrop: Uses stakeFor() to stake on behalf of users",
      "Idempotent: Safe to call multiple times (adds membership if SBT exists)",
      "IR optimized: 18KB bytecode (under 24KB limit)",
      "Fully tested: 14/14 tests passed including IVersioned interface"
    ],
    "category": "tokens"
  },
  {
    "name": "aPNTs",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0xBD0710596010a157B88cd141d797E8Ad4bb2306b",
    "features": [
      "VERSION interface",
      "AAStar community gas token",
      "Test token for development",
      "Auto-approved spenders"
    ],
    "category": "testTokens"
  },
  {
    "name": "bPNTs",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-03",
    "address": "0x70Da2c1B7Fcf471247Bc3B09f8927a4ab1751Ba3",
    "features": [
      "VERSION interface",
      "BreadCommunity gas token",
      "Test token for development",
      "Auto-approved spenders"
    ],
    "category": "testTokens"
  },
  {
    "name": "DVTValidator",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x937CdD172fb0674Db688149093356F6dA95498FD",
    "features": [
      "VERSION interface",
      "Distributed validator technology",
      "Validator set management",
      "Threshold validation"
    ],
    "category": "other"
  },
  {
    "name": "BLSAggregator",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x3Cf0587912c692aa0f5FEEEDC52959ABEEEFaEc6",
    "features": [
      "VERSION interface",
      "BLS signature aggregation",
      "Multi-signature support",
      "Gas optimization"
    ],
    "category": "other"
  }
];

// Version string for display in UI
const SHARED_CONFIG_VERSION = '0.3.6';

// Export for use in browser
if (typeof window !== 'undefined') {
  window.CONTRACTS = CONTRACTS;
  window.CONTRACT_METADATA = CONTRACT_METADATA;
  window.SHARED_CONFIG_VERSION = SHARED_CONFIG_VERSION;
}

// Export for CommonJS/ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTRACTS, CONTRACT_METADATA };
}
