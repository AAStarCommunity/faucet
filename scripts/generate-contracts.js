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
} = require('@aastar/shared-config');

const network = 'sepolia';

// Get all contracts from shared-config
const core = getCoreContracts(network);
const tokens = getTokenContracts(network);
const testTokens = getTestTokenContracts(network);
const paymasterV4_1 = getPaymasterV4_1(network);
const entryPoint = getEntryPoint(network);

// Build contracts object
const contracts = {
  // Core System v0.2.10
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

// Generate JavaScript file
const output = `// Auto-generated from @aastar/shared-config v0.2.10
// DO NOT EDIT MANUALLY - Run 'npm run build:contracts' to regenerate
// Generated at: ${new Date().toISOString()}

const CONTRACTS = ${JSON.stringify(contracts, null, 2)};

// Export for use in browser
if (typeof window !== 'undefined') {
  window.CONTRACTS = CONTRACTS;
}

// Export for CommonJS/ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONTRACTS;
}
`;

// Write to public directory
const outputPath = path.join(__dirname, '../public/contracts.js');
fs.writeFileSync(outputPath, output, 'utf8');

console.log('✅ Generated contracts.js from shared-config v0.2.10');
console.log(`📍 Output: ${outputPath}`);
console.log('\n📋 Contract Addresses:');
console.log('─────────────────────────────────────────────────────────');
Object.entries(contracts).forEach(([name, address]) => {
  console.log(`  ${name.padEnd(20)} ${address}`);
});
console.log('─────────────────────────────────────────────────────────');
