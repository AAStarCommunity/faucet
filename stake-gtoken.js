// Script to stake GToken for test communities
const { ethers } = require("ethers");
const {
  getCoreContracts,
} = require("@aastar/shared-config");

// Get contract addresses from shared-config
const network = "sepolia";
const coreContracts = getCoreContracts(network);

console.log("=== Stake GToken for Test Communities ===");
console.log("Network:", network);
console.log("GToken:", coreContracts.gToken);
console.log("GTokenStaking:", coreContracts.gTokenStaking);
console.log();

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

// Test communities that need stGToken
const TEST_COMMUNITIES = [
  {
    name: "AAstar Test Community A",
    address: "0xf63F964cCAf8A1BAD4B65D1fAc2CE844c095287E",
    privateKey: "0xd6ff0ee3b3032b8568917e23282a6570f860096711c422c257a767ea8698e25c",
  },
  {
    name: "AAstar Test Community B",
    address: "0x2dE69065D657760E2C58daD1DaF26C331207c676",
    privateKey: "0xee991e71b839e3eef4b5aae80e125e16aaf3f21eb588f267cc2f2b55ffda9cea",
  },
  {
    name: "AAstar Test Community C",
    address: "0x411BD567E46C0781248dbB6a9211891C032885e5",
    privateKey: "0x2717524c39f8b8ab74c902dc712e590fee36993774119c1e06d31daa4b0fbc81",
  },
];

const STAKE_AMOUNT = ethers.parseUnits("30", 18);  // 30 GT per community

async function stakeForCommunity(community, provider, fromWallet) {
  const wallet = new ethers.Wallet(community.privateKey, provider);
  const gtoken = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, wallet);
  const gtokenStaking = new ethers.Contract(coreContracts.gTokenStaking, GTOKEN_STAKING_ABI, wallet);

  console.log(`\nProcessing: ${community.name}`);
  console.log(`  Address: ${community.address}`);

  // Check current balances
  const gtokenBalance = await gtoken.balanceOf(wallet.address);
  const stGTokenBalance = await gtokenStaking.balanceOf(wallet.address);

  console.log(`  Current GToken: ${ethers.formatUnits(gtokenBalance, 18)} GT`);
  console.log(`  Current stGToken: ${ethers.formatUnits(stGTokenBalance, 18)} stGT`);

  // If already has enough stGToken, skip
  if (stGTokenBalance >= STAKE_AMOUNT) {
    console.log(`  ✓ Already has sufficient stGToken`);
    return;
  }

  const needed = STAKE_AMOUNT - stGTokenBalance;
  console.log(`  Need to stake: ${ethers.formatUnits(needed, 18)} GT`);

  // Transfer GT if needed
  if (gtokenBalance < needed) {
    console.log(`  Transferring ${ethers.formatUnits(needed, 18)} GT from source...`);
    const gtokenFrom = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, fromWallet);
    const transferTx = await gtokenFrom.transfer(wallet.address, needed);
    console.log(`    TX: ${transferTx.hash}`);
    await transferTx.wait();
    console.log(`    ✓ Transfer complete`);
  }

  // Approve staking contract
  console.log(`  Approving GTokenStaking...`);
  const approveTx = await gtoken.approve(coreContracts.gTokenStaking, needed);
  console.log(`    TX: ${approveTx.hash}`);
  await approveTx.wait();
  console.log(`    ✓ Approved`);

  // Stake
  console.log(`  Staking ${ethers.formatUnits(needed, 18)} GT...`);
  const stakeTx = await gtokenStaking.stake(needed);
  console.log(`    TX: ${stakeTx.hash}`);
  await stakeTx.wait();
  console.log(`    ✓ Staked`);

  // Verify
  const newStGTokenBalance = await gtokenStaking.balanceOf(wallet.address);
  console.log(`  New stGToken: ${ethers.formatUnits(newStGTokenBalance, 18)} stGT`);
}

async function main() {
  // Configuration from environment
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const sourcePrivateKey = process.env.SOURCE_PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY;

  if (!rpcUrl || !sourcePrivateKey) {
    console.error("Error: SEPOLIA_RPC_URL and SOURCE_PRIVATE_KEY (or OWNER_PRIVATE_KEY) required");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);

  console.log("Source wallet:", sourceWallet.address);

  // Check source wallet balance
  const gtoken = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, sourceWallet);
  const sourceBalance = await gtoken.balanceOf(sourceWallet.address);
  console.log("Source GToken balance:", ethers.formatUnits(sourceBalance, 18), "GT");

  const totalNeeded = STAKE_AMOUNT * BigInt(TEST_COMMUNITIES.length);
  console.log("Total needed:", ethers.formatUnits(totalNeeded, 18), "GT");
  console.log();

  if (sourceBalance < totalNeeded) {
    console.warn("⚠️ Source wallet may not have enough GToken");
  }

  for (const community of TEST_COMMUNITIES) {
    try {
      await stakeForCommunity(community, provider, sourceWallet);
    } catch (error) {
      console.error(`  ✗ Failed:`, error.message);
    }
  }

  console.log("\n=== Staking Complete ===");
  console.log("All communities should now have at least 30 stGT");
  console.log("Run register-communities.js next to register them");
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
