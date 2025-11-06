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
} = require('@aastar/shared-config');

// Get shared-config version from package.json
try {
  // Try to resolve the package.json directly
  const sharedConfigPackageJson = require.resolve('@aastar/shared-config/package.json');
  const sharedConfigPackage = JSON.parse(fs.readFileSync(sharedConfigPackageJson, 'utf8'));
  var SHARED_CONFIG_VERSION = sharedConfigPackage.version;
  console.log(`📦 Found @aastar/shared-config v${SHARED_CONFIG_VERSION}`);
} catch (error) {
  console.error('Error reading shared-config version:', error.message);
  console.log('🔧 Trying alternative approach...');
  try {
    // Fallback: read from node_modules directly
    const path = require('path');
    const fs = require('fs');
    const packagePath = path.join(__dirname, '../node_modules/@aastar/shared-config/package.json');
    const sharedConfigPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    var SHARED_CONFIG_VERSION = sharedConfigPackage.version;
    console.log(`📦 Found @aastar/shared-config v${SHARED_CONFIG_VERSION} (fallback)`);
  } catch (fallbackError) {
    console.error('Fallback also failed:', fallbackError.message);
    var SHARED_CONFIG_VERSION = '0.2.26'; // Known current version
    console.log(`📦 Using known version: ${SHARED_CONFIG_VERSION}`);
  }
}

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

// Add category field to each contract
const contractMetadata = allV2Contracts.map(contract => ({
  ...contract,
  category: categoryMap[contract.name] || 'other'
}));

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
};

// Generate JavaScript file with version info
const output = `// Auto-generated from @aastar/shared-config v${SHARED_CONFIG_VERSION}
// DO NOT EDIT MANUALLY - Run 'npm run build:contracts' to regenerate
// Generated at: ${new Date().toISOString()}

const CONTRACTS = ${JSON.stringify(contracts, null, 2)};

// Contract metadata with version info and categories
const CONTRACT_METADATA = ${JSON.stringify(contractMetadata, null, 2)};

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
