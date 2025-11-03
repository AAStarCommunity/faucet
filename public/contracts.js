// Auto-generated from @aastar/shared-config v0.2.14
// DO NOT EDIT MANUALLY - Run 'npm run build:contracts' to regenerate
// Generated at: 2025-11-03T05:12:56.098Z

const CONTRACTS = {
  "GTOKEN": "0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc",
  "GTOKEN_STAKING": "0x60Bd54645b0fDabA1114B701Df6f33C4ecE87fEa",
  "REGISTRY": "0xf384c592D5258c91805128291c5D4c069DD30CA6",
  "SUPER_PAYMASTER_V2": "0x95B20d8FdF173a1190ff71e41024991B2c5e58eF",
  "PAYMASTER_FACTORY": "0x65Cf6C4ab3d40f3C919b6F3CADC09Efb72817920",
  "MYSBT": "0x73E635Fc9eD362b7061495372B6eDFF511D9E18F",
  "XPNTS_FACTORY": "0x9dD72cB42427fC9F7Bf0c949DB7def51ef29D6Bd",
  "USDT": "0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc",
  "APNTS": "0xBD0710596010a157B88cd141d797E8Ad4bb2306b",
  "BPNTS": "0x70Da2c1B7Fcf471247Bc3B09f8927a4ab1751Ba3",
  "PAYMASTER_V4_1": "0x4D6A367aA183903968833Ec4AE361CFc8dDDBA38",
  "ENTRYPOINT": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  "PNT": "0xD14E87d8D8B69016Fcc08728c33799bD3F66F180",
  "SBT": "0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f"
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
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x95B20d8FdF173a1190ff71e41024991B2c5e58eF",
    "features": [
      "VERSION interface",
      "Unified architecture",
      "xPNTs gas token support",
      "Reputation-based pricing",
      "Multi-operator support"
    ],
    "category": "core"
  },
  {
    "name": "Registry",
    "version": "2.1.4",
    "versionCode": 20104,
    "deployedAt": "2025-11-02",
    "address": "0xf384c592D5258c91805128291c5D4c069DD30CA6",
    "features": [
      "VERSION interface",
      "allowPermissionlessMint defaults to true",
      "transferCommunityOwnership",
      "Community registration",
      "GToken staking requirement",
      "Slash mechanism",
      "Uses new GTokenStaking with GToken v2.0.0"
    ],
    "category": "core"
  },
  {
    "name": "GTokenStaking",
    "version": "2.0.0",
    "versionCode": 20000,
    "deployedAt": "2025-11-01",
    "address": "0x60Bd54645b0fDabA1114B701Df6f33C4ecE87fEa",
    "features": [
      "VERSION interface",
      "User-level slash tracking",
      "1:1 shares model",
      "Lock mechanism",
      "Percentage-based exit fee",
      "Multiple locker support",
      "Uses new GToken v2.0.0"
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
    "version": "2.4.0",
    "versionCode": 20400,
    "deployedAt": "2025-11-01",
    "address": "0x73E635Fc9eD362b7061495372B6eDFF511D9E18F",
    "features": [
      "VERSION interface",
      "NFT architecture refactor",
      "Soulbound token (SBT)",
      "Time-based reputation",
      "Membership management",
      "GToken mint fee (burn)"
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
    "deployedAt": "2025-11-01",
    "address": "0xF223660d24c436B5BfadFEF68B5051bf45E7C995",
    "features": [
      "VERSION interface",
      "BuilderDAO community gas token",
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

// Export for use in browser
if (typeof window !== 'undefined') {
  window.CONTRACTS = CONTRACTS;
  window.CONTRACT_METADATA = CONTRACT_METADATA;
}

// Export for CommonJS/ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTRACTS, CONTRACT_METADATA };
}
