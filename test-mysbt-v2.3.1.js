// Test script for MySBT v2.3.1 permissionless minting
// This demonstrates the complete flow of using the new userMint feature

const { ethers } = require("ethers");
const {
  getCoreContracts,
  getTokenContracts,
} = require("@aastar/shared-config");

// Get contract addresses from shared-config
const network = "sepolia";
const coreContracts = getCoreContracts(network);
const tokenContracts = getTokenContracts(network);

console.log("=== MySBT v2.3.1 Test ===");
console.log("Network:", network);
console.log("MySBT Address:", tokenContracts.mySBT);
console.log("Registry Address:", coreContracts.registry);
console.log();

// ABIs
const MYSBT_ABI = [
  "function userMint(address communityToJoin, string metadata) external returns (uint256 tokenId, bool isNewMint)",
  "function mintOrAddMembership(address user, string metadata) external returns (uint256 tokenId, bool isNewMint)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function userToSBT(address user) external view returns (uint256)",
  "function getMemberships(uint256 tokenId) external view returns (tuple(address community, uint256 joinedAt, uint256 lastActiveTime, bool isActive, string metadata)[])",
];

const REGISTRY_ABI = [
  "function isPermissionlessMintAllowed(address communityAddress) external view returns (bool)",
  "function setPermissionlessMint(bool enabled) external",
  "function getCommunityProfile(address communityAddress) external view returns (tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint))",
];

const GTOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

const GTOKEN_STAKING_ABI = [
  "function balanceOf(address user) external view returns (uint256)",
  "function availableBalance(address user) external view returns (uint256)",
];

async function main() {
  // Configuration from environment
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.TEST_PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error("Error: SEPOLIA_RPC_URL and TEST_PRIVATE_KEY required");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Test Wallet:", wallet.address);
  console.log();

  // Initialize contracts
  const mysbt = new ethers.Contract(tokenContracts.mySBT, MYSBT_ABI, wallet);
  const registry = new ethers.Contract(coreContracts.registry, REGISTRY_ABI, wallet);
  const gtoken = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, wallet);
  const gtokenStaking = new ethers.Contract(coreContracts.gTokenStaking, GTOKEN_STAKING_ABI, wallet);

  // Test 1: Check if user has GToken and stGToken
  console.log("Step 1: Checking balances...");
  const gtokenBalance = await gtoken.balanceOf(wallet.address);
  const stGTokenBalance = await gtokenStaking.balanceOf(wallet.address);
  const availableStGToken = await gtokenStaking.availableBalance(wallet.address);

  console.log("  GToken Balance:", ethers.formatUnits(gtokenBalance, 18), "GT");
  console.log("  stGToken Balance:", ethers.formatUnits(stGTokenBalance, 18), "stGT");
  console.log("  Available stGToken:", ethers.formatUnits(availableStGToken, 18), "stGT");
  console.log();

  // Check if user already has SBT
  const existingSBT = await mysbt.userToSBT(wallet.address);
  if (existingSBT > 0n) {
    console.log("User already has SBT with ID:", existingSBT.toString());
    const memberships = await mysbt.getMemberships(existingSBT);
    console.log("Current memberships:", memberships.length);
    memberships.forEach((m, i) => {
      console.log(`  ${i + 1}. Community: ${m.community}`);
      console.log(`     Active: ${m.isActive}`);
      console.log(`     Joined: ${new Date(Number(m.joinedAt) * 1000).toISOString()}`);
    });
    console.log();
    return;
  }

  // Test 2: Check a community's permissionless mint status
  console.log("Step 2: Checking community permissionless mint status...");

  // Use fresh registered test community
  const testCommunity = "0xc1172B5D6165DbaC3777d8aE880EB4A71f919023";  // AAstar Fresh Test Community

  try {
    const profile = await registry.getCommunityProfile(testCommunity);
    console.log("  Community:", profile.name);
    console.log("  Is Active:", profile.isActive);
    console.log("  Allow Permissionless Mint:", profile.allowPermissionlessMint);
    console.log();

    if (!profile.isActive) {
      console.log("❌ Community is not active. Cannot mint SBT.");
      return;
    }

    if (!profile.allowPermissionlessMint) {
      console.log("❌ Community has permissionless mint disabled.");
      console.log("   Please choose a different community or ask the operator to enable it.");
      return;
    }

    console.log("  ✅ Permissionless mint is enabled!");
    console.log();

    // Test 3: Approve GToken for MySBT
    console.log("Step 3: Approving GToken for MySBT...");
    const approveAmount = ethers.parseUnits("1", 18); // 1 GToken
    const approveTx = await gtoken.approve(tokenContracts.mySBT, approveAmount);
    console.log("  TX:", approveTx.hash);
    await approveTx.wait();
    console.log("  ✅ Approved!");
    console.log();

    // Test 4: User mint SBT
    console.log("Step 4: Minting SBT via userMint...");
    const metadata = JSON.stringify({
      type: "faucet-test",
      timestamp: Date.now(),
      version: "2.3.1"
    });

    const mintTx = await mysbt.userMint(testCommunity, metadata);
    console.log("  TX:", mintTx.hash);
    const receipt = await mintTx.wait();
    console.log("  ✅ SBT Minted!");
    console.log("  Block:", receipt.blockNumber);
    console.log();

    // Test 5: Verify SBT
    console.log("Step 5: Verifying SBT...");
    const sbtId = await mysbt.userToSBT(wallet.address);
    const balance = await mysbt.balanceOf(wallet.address);
    console.log("  SBT ID:", sbtId.toString());
    console.log("  Balance:", balance.toString());

    const memberships = await mysbt.getMemberships(sbtId);
    console.log("  Memberships:", memberships.length);
    memberships.forEach((m, i) => {
      console.log(`    ${i + 1}. Community: ${m.community}`);
      console.log(`       Active: ${m.isActive}`);
    });
    console.log();

    console.log("✅ All tests passed!");

  } catch (error) {
    if (error.message.includes("not registered")) {
      console.log("❌ Test community is not registered.");
      console.log("   Please register a community first or use an existing community address.");
    } else {
      console.error("Error:", error.message);
    }
  }
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
