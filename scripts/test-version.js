#!/usr/bin/env node
/**
 * Test script to verify shared-config version detection
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing @aastar/shared-config version detection...\n');

// Method 1: Try require.resolve
try {
  const packagePath = require.resolve('@aastar/shared-config/package.json');
  const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`✅ Method 1 - require.resolve: v${packageInfo.version}`);
} catch (error) {
  console.log(`❌ Method 1 failed: ${error.message}`);
}

// Method 2: Try direct path
try {
  const directPath = path.join(__dirname, '../node_modules/@aastar/shared-config/package.json');
  if (fs.existsSync(directPath)) {
    const packageInfo = JSON.parse(fs.readFileSync(directPath, 'utf8'));
    console.log(`✅ Method 2 - direct path: v${packageInfo.version}`);
  } else {
    console.log('❌ Method 2 - package.json not found at direct path');
  }
} catch (error) {
  console.log(`❌ Method 2 failed: ${error.message}`);
}

// Method 3: Try importing the module
try {
  const sharedConfig = require('@aastar/shared-config');
  if (sharedConfig.getAllV2Contracts) {
    const contracts = sharedConfig.getAllV2Contracts();
    console.log(`✅ Method 3 - module import: Found ${contracts.length} contracts`);
    if (contracts.length > 0) {
      console.log(`   Sample contract: ${contracts[0].name} v${contracts[0].version}`);
    }
  } else {
    console.log('❌ Method 3 - getAllV2Contracts not found');
  }
} catch (error) {
  console.log(`❌ Method 3 failed: ${error.message}`);
}

console.log('\n🏁 Test complete');