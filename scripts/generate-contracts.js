#!/usr/bin/env node
/**
 * Generate contracts.js from @aastar/shared-config
 * This ensures contract addresses are always in sync with shared-config
 */

const fs = require('fs');
const path = require('path');
const {
  getCoreContracts,
  getTokenContracts,
  getTestTokenContracts,
  getPaymasterV4_1,
  getEntryPoint,
  getAllV2Contracts,
  getCommunities,
} = require('@aastar/shared-config');

// Get shared-config version from package.json
const sharedConfigPath = path.dirname(require.resolve('@aastar/shared-config'));
const sharedConfigPackagePath = path.join(sharedConfigPath, '../package.json');
const sharedConfigPackage = JSON.parse(fs.readFileSync(sharedConfigPackagePath, 'utf8'));
const SHARED_CONFIG_VERSION = sharedConfigPackage.version;

const network = 'sepolia';

// Get all contracts from shared-config
const core = getCoreContracts(network);
const tokens = getTokenContracts(network);
const testTokens = getTestTokenContracts(network);
const paymasterV4_1 = getPaymasterV4_1(network);
const entryPoint = getEntryPoint(network);

// Get all V2 contracts with version info
const allV2Contracts = getAllV2Contracts(network);

// Add category field to each contract
const categoryMap = {
  // Core
  'GToken': 'core',
  'SuperPaymasterV2': 'core',
  'Registry': 'core',
  'GTokenStaking': 'core',
  'PaymasterFactory': 'core',
  // Tokens
  'MySBT': 'tokens',
  'xPNTsFactory': 'tokens',
  // Test Tokens
  'Mock USDT': 'testTokens',
  'aPNTs': 'testTokens',
  'bPNTs': 'testTokens',
};

const contractsWithCategory = allV2Contracts.map(contract => ({
  ...contract,
  category: categoryMap[contract.name] || 'other'
}));

// Fix bPNTs metadata to use breadCommunity instead of BuilderDAO
// (shared-config CONTRACT_METADATA hasn't been updated yet)
const breadCommunity = getCommunities(network).breadCommunity;
const fixedContracts = contractsWithCategory.map(contract => {
  if (contract.name === 'bPNTs') {
    return {
      ...contract,
      address: breadCommunity.gasToken,
      features: [
        'VERSION interface',
        'BreadCommunity gas token',
        'Test token for development',
        'Auto-approved spenders'
      ]
    };
  }
  return contract;
});

// Build contracts object
const contracts = {
  // Core System from shared-config
  GTOKEN: core.gToken,
  GTOKEN_STAKING: core.gTokenStaking,
  REGISTRY: core.registry,
  SUPER_PAYMASTER_V2: core.superPaymasterV2,
  PAYMASTER_FACTORY: core.paymasterFactory,

  // Token System
  MYSBT: tokens.mySBT,
  XPNTS_FACTORY: tokens.xPNTsFactory,

  // Test Tokens
  USDT: testTokens.mockUSDT,
  APNTS: testTokens.aPNTs,
  BPNTS: testTokens.bPNTs,

  // Paymasters
  PAYMASTER_V4_1: paymasterV4_1,

  // Official Contracts
  ENTRYPOINT: entryPoint,

  // Backward compatibility (for legacy faucet functions)
  // These still use old contracts for minting
  PNT: '0xD14E87d8D8B69016Fcc08728c33799bD3F66F180', // Old GasTokenV2 (legacy)
  SBT: '0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f', // Old MySBT (legacy)
};

// Generate JavaScript file with version info
const output = `// Auto-generated from @aastar/shared-config v${SHARED_CONFIG_VERSION}
// DO NOT EDIT MANUALLY - Run 'npm run build:contracts' to regenerate
// Generated at: ${new Date().toISOString()}

const CONTRACTS = ${JSON.stringify(contracts, null, 2)};

// Contract metadata with version info and categories
const CONTRACT_METADATA = ${JSON.stringify(fixedContracts, null, 2)};

// Version string for display in UI
const SHARED_CONFIG_VERSION = '${SHARED_CONFIG_VERSION}';

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
`;

// Write to public directory
const outputPath = path.join(__dirname, '../public/contracts.js');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`✅ Generated contracts.js from shared-config v${SHARED_CONFIG_VERSION}`);
console.log(`📍 Output: ${outputPath}`);
console.log('\n📋 Contract Addresses:');
console.log('─────────────────────────────────────────────────────────');
Object.entries(contracts).forEach(([name, address]) => {
  console.log(`  ${name.padEnd(20)} ${address}`);
});
console.log('─────────────────────────────────────────────────────────');
