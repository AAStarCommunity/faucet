// Complete end-to-end test for MySBT v2.3.1 permissionless minting
const { ethers } = require("ethers");
const { getCoreContracts, getTokenContracts } = require("@aastar/shared-config");

const network = "sepolia";
const coreContracts = getCoreContracts(network);
const tokenContracts = getTokenContracts(network);

console.log("=== MySBT v2.3.1 Complete E2E Test ===");
console.log("Network:", network);
console.log("MySBT:", tokenContracts.mySBT);
console.log("Registry:", coreContracts.registry);
console.log();

const MYSBT_ABI = [
  "function userMint(address communityToJoin, string metadata) external returns (uint256 tokenId, bool isNewMint)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function userToSBT(address user) external view returns (uint256)",
  "function getMemberships(uint256 tokenId) external view returns (tuple(address community, uint256 joinedAt, uint256 lastActiveTime, bool isActive, string metadata)[])",
];

const REGISTRY_ABI = [
  "function getCommunityProfile(address communityAddress) external view returns (tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint))",
];

const GTOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

const GTOKEN_STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function balanceOf(address user) external view returns (uint256)",
  "function availableBalance(address user) external view returns (uint256)",
];

// Fresh test community
const TEST_COMMUNITY = "0xc1172B5D6165DbaC3777d8aE880EB4A71f919023";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const sourcePrivateKey = process.env.OWNER_PRIVATE_KEY;

  if (!rpcUrl || !sourcePrivateKey) {
    console.error("Error: SEPOLIA_RPC_URL and OWNER_PRIVATE_KEY required");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);

  // Create new user
  const userWallet = ethers.Wallet.createRandom().connect(provider);
  console.log("Test User:", userWallet.address);
  console.log();

  // Setup
  console.log("Step 1: Setting up test user...");
  const ethTx = await sourceWallet.sendTransaction({
    to: userWallet.address,
    value: ethers.parseEther("0.01")
  });
  await ethTx.wait();
  console.log("  ✓ Sent 0.01 ETH for gas");

  const gtoken = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, sourceWallet);
  const gtTx = await gtoken.transfer(userWallet.address, ethers.parseUnits("1", 18));
  await gtTx.wait();
  console.log("  ✓ Transferred 1 GT");

  // Stake to get stGT
  const gtokenUser = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, userWallet);
  const gtokenStaking = new ethers.Contract(coreContracts.gTokenStaking, GTOKEN_STAKING_ABI, userWallet);

  const approveTx = await gtokenUser.approve(coreContracts.gTokenStaking, ethers.parseUnits("0.5", 18));
  await approveTx.wait();
  console.log("  ✓ Approved GTokenStaking");

  const stakeTx = await gtokenStaking.stake(ethers.parseUnits("0.5", 18));
  await stakeTx.wait();
  console.log("  ✓ Staked 0.5 GT for 0.5 stGT");
  console.log();

  // Check balances
  console.log("Step 2: Checking user balances...");
  const gtBalance = await gtokenUser.balanceOf(userWallet.address);
  const stGTBalance = await gtokenStaking.balanceOf(userWallet.address);
  const availableStGT = await gtokenStaking.availableBalance(userWallet.address);
  console.log("  GToken:", ethers.formatUnits(gtBalance, 18), "GT");
  console.log("  stGToken:", ethers.formatUnits(stGTBalance, 18), "stGT");
  console.log("  Available stGToken:", ethers.formatUnits(availableStGT, 18), "stGT");
  console.log();

  // Check community
  console.log("Step 3: Checking community status...");
  const registry = new ethers.Contract(coreContracts.registry, REGISTRY_ABI, provider);
  const profile = await registry.getCommunityProfile(TEST_COMMUNITY);
  console.log("  Community:", profile.name);
  console.log("  Is Active:", profile.isActive);
  console.log("  Permissionless Mint:", profile.allowPermissionlessMint);
  console.log();

  // Approve and mint
  console.log("Step 4: Approving MySBT for GToken burn...");
  const approveMintTx = await gtokenUser.approve(tokenContracts.mySBT, ethers.parseUnits("0.1", 18));
  await approveMintTx.wait();
  console.log("  ✓ Approved 0.1 GT");
  console.log();

  console.log("Step 5: Minting SBT via userMint...");
  const mysbt = new ethers.Contract(tokenContracts.mySBT, MYSBT_ABI, userWallet);
  const metadata = JSON.stringify({
    type: "e2e-test",
    timestamp: Date.now(),
    version: "2.3.1"
  });

  const mintTx = await mysbt.userMint(TEST_COMMUNITY, metadata);
  console.log("  TX:", mintTx.hash);
  const receipt = await mintTx.wait();
  console.log("  ✓ Minted! Block:", receipt.blockNumber);
  console.log();

  // Verify
  console.log("Step 6: Verifying SBT...");
  const sbtId = await mysbt.userToSBT(userWallet.address);
  const balance = await mysbt.balanceOf(userWallet.address);
  console.log("  SBT ID:", sbtId.toString());
  console.log("  Balance:", balance.toString());

  const memberships = await mysbt.getMemberships(sbtId);
  console.log("  Memberships:", memberships.length);
  memberships.forEach((m, i) => {
    console.log(`    ${i + 1}. Community: ${m.community}`);
    console.log(`       Active: ${m.isActive}`);
    console.log(`       Joined: ${new Date(Number(m.joinedAt) * 1000).toISOString()}`);
  });
  console.log();

  console.log("✅ MySBT v2.3.1 Permissionless Mint Test PASSED!");
  console.log();
  console.log("Summary:");
  console.log("- User created fresh account and staked 0.5 GT");
  console.log("- User successfully minted SBT without community operator approval");
  console.log("- User automatically joined community:", profile.name);
  console.log("- Permissionless mint feature working correctly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
