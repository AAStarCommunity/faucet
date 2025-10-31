// Script to register multiple test communities for MySBT v2.3.1 testing
const { ethers } = require("ethers");
const {
  getCoreContracts,
} = require("@aastar/shared-config");

// Get contract addresses from shared-config
const network = "sepolia";
const coreContracts = getCoreContracts(network);

console.log("=== Register Test Communities ===");
console.log("Network:", network);
console.log("Registry Address:", coreContracts.registry);
console.log();

// Registry ABI
const REGISTRY_ABI = [
  "function registerCommunity(tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint) profile, uint256 stGTokenAmount) external",
  "function getCommunityProfile(address communityAddress) external view returns (tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint))",
  "function setPermissionlessMint(bool enabled) external",
];

const GTOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const GTOKEN_STAKING_ABI = [
  "function balanceOf(address user) external view returns (uint256)",
  "function availableBalance(address user) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const REQUIRED_STAKE = ethers.parseUnits("30", 18);  // 30 stGT minimum for PAYMASTER_AOA

// Test communities with their private keys
const TEST_COMMUNITIES = [
  {
    name: "AAstar Test Community A",
    address: "0xf63F964cCAf8A1BAD4B65D1fAc2CE844c095287E",
    privateKey: "0xd6ff0ee3b3032b8568917e23282a6570f860096711c422c257a767ea8698e25c",
    ensName: "test-a.aastar.eth",
    description: "Test community for permissionless MySBT minting - Community A",
    website: "https://test-a.aastar.io",
    logoURI: "https://avatars.githubusercontent.com/u/test-a",
    twitterHandle: "@aastar_test_a",
    githubOrg: "aastar-test-a",
    telegramGroup: "https://t.me/aastar_test_a",
  },
  {
    name: "AAstar Test Community B",
    address: "0x2dE69065D657760E2C58daD1DaF26C331207c676",
    privateKey: "0xee991e71b839e3eef4b5aae80e125e16aaf3f21eb588f267cc2f2b55ffda9cea",
    ensName: "test-b.aastar.eth",
    description: "Test community for permissionless MySBT minting - Community B",
    website: "https://test-b.aastar.io",
    logoURI: "https://avatars.githubusercontent.com/u/test-b",
    twitterHandle: "@aastar_test_b",
    githubOrg: "aastar-test-b",
    telegramGroup: "https://t.me/aastar_test_b",
  },
  {
    name: "AAstar Test Community C",
    address: "0x411BD567E46C0781248dbB6a9211891C032885e5",
    privateKey: "0x2717524c39f8b8ab74c902dc712e590fee36993774119c1e06d31daa4b0fbc81",
    ensName: "test-c.aastar.eth",
    description: "Test community for permissionless MySBT minting - Community C",
    website: "https://test-c.aastar.io",
    logoURI: "https://avatars.githubusercontent.com/u/test-c",
    twitterHandle: "@aastar_test_c",
    githubOrg: "aastar-test-c",
    telegramGroup: "https://t.me/aastar_test_c",
  },
];

async function registerCommunity(community, provider) {
  const wallet = new ethers.Wallet(community.privateKey, provider);
  const registry = new ethers.Contract(coreContracts.registry, REGISTRY_ABI, wallet);
  const gtokenStaking = new ethers.Contract(coreContracts.gTokenStaking, GTOKEN_STAKING_ABI, wallet);

  console.log(`\nRegistering: ${community.name}`);
  console.log(`  Address: ${community.address}`);
  console.log(`  Wallet: ${wallet.address}`);

  // Check stGToken balance
  const stGTokenBalance = await gtokenStaking.balanceOf(wallet.address);
  const availableStGToken = await gtokenStaking.availableBalance(wallet.address);
  console.log(`  stGToken Balance: ${ethers.formatUnits(stGTokenBalance, 18)} stGT`);
  console.log(`  Available stGToken: ${ethers.formatUnits(availableStGToken, 18)} stGT`);

  // Check if already registered
  try {
    const profile = await registry.getCommunityProfile(wallet.address);
    if (profile.registeredAt > 0n) {
      console.log(`  ✓ Already registered`);
      console.log(`    Registered at: ${new Date(Number(profile.registeredAt) * 1000).toISOString()}`);
      console.log(`    Permissionless mint: ${profile.allowPermissionlessMint}`);

      // Make sure permissionless mint is enabled
      if (!profile.allowPermissionlessMint) {
        console.log(`  Enabling permissionless mint...`);
        const tx = await registry.setPermissionlessMint(true);
        await tx.wait();
        console.log(`  ✓ Permissionless mint enabled`);
      }
      return;
    }
  } catch (error) {
    // Not registered yet, continue
  }

  // Check if enough stGToken
  if (availableStGToken < REQUIRED_STAKE) {
    console.error(`  ✗ Insufficient stGToken!`);
    console.error(`    Required: ${ethers.formatUnits(REQUIRED_STAKE, 18)} stGT`);
    console.error(`    Available: ${ethers.formatUnits(availableStGToken, 18)} stGT`);
    console.error(`    Please stake more GToken first`);
    return;
  }

  // Create community profile
  const profile = {
    name: community.name,
    ensName: community.ensName,
    description: community.description,
    website: community.website,
    logoURI: community.logoURI,
    twitterHandle: community.twitterHandle,
    githubOrg: community.githubOrg,
    telegramGroup: community.telegramGroup,
    xPNTsToken: ethers.ZeroAddress,
    supportedSBTs: [],
    mode: 0,  // INDEPENDENT
    nodeType: 0,  // PAYMASTER_AOA
    paymasterAddress: ethers.ZeroAddress,
    community: wallet.address,
    registeredAt: 0,
    lastUpdatedAt: 0,
    isActive: true,
    memberCount: 0,
    allowPermissionlessMint: true,  // Enable by default
  };

  try {
    // Register with 30 stGToken (minimum for PAYMASTER_AOA)
    console.log(`  Registering with ${ethers.formatUnits(REQUIRED_STAKE, 18)} stGT stake...`);
    const tx = await registry.registerCommunity(profile, REQUIRED_STAKE);
    console.log(`  TX: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`  ✓ Registered successfully`);
    console.log(`    Block: ${receipt.blockNumber}`);
    console.log(`    Staked: ${ethers.formatUnits(REQUIRED_STAKE, 18)} stGT`);
    console.log(`    Permissionless mint: ENABLED`);
  } catch (error) {
    console.error(`  ✗ Registration failed:`, error.message);
    if (error.data) {
      console.error(`    Error data: ${error.data}`);
    }
  }
}

async function main() {
  // Configuration from environment
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    console.error("Error: SEPOLIA_RPC_URL required");
    console.log("Usage: SEPOLIA_RPC_URL=<rpc_url> node register-communities.js");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log("Registering test communities...\n");

  for (const community of TEST_COMMUNITIES) {
    await registerCommunity(community, provider);
  }

  console.log("\n=== Registration Complete ===");
  console.log("Registered communities:");
  TEST_COMMUNITIES.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (${c.address})`);
  });
  console.log("\nAll communities have permissionless mint ENABLED");
  console.log("Users can now mint MySBT by calling: userMint(communityAddress, metadata)");
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
