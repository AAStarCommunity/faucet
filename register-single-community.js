// Register a single test community with fresh account
const { ethers } = require("ethers");
const { getCoreContracts } = require("@aastar/shared-config");

const network = "sepolia";
const coreContracts = getCoreContracts(network);

const REGISTRY_ABI = [
  "function registerCommunity(tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint) profile, uint256 stGTokenAmount) external",
  "function getCommunityProfile(address communityAddress) external view returns (tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint))",
  "function setPermissionlessMint(bool enabled) external",
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

const REQUIRED_STAKE = ethers.parseUnits("30", 18);

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const sourcePrivateKey = process.env.OWNER_PRIVATE_KEY;

  if (!rpcUrl || !sourcePrivateKey) {
    console.error("Error: SEPOLIA_RPC_URL and OWNER_PRIVATE_KEY required");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const sourceWallet = new ethers.Wallet(sourcePrivateKey, provider);

  console.log("=== Register Fresh Test Community ===");
  console.log("Source wallet:", sourceWallet.address);
  console.log("Registry:", coreContracts.registry);
  console.log();

  // Create new wallet for test community
  const newWallet = ethers.Wallet.createRandom().connect(provider);
  console.log("New community address:", newWallet.address);
  console.log("New community private key:", newWallet.privateKey);
  console.log();

  // Send ETH for gas
  console.log("Sending ETH for gas...");
  const ethTx = await sourceWallet.sendTransaction({
    to: newWallet.address,
    value: ethers.parseEther("0.01")
  });
  await ethTx.wait();
  console.log("  ✓ Sent 0.01 ETH");

  // Transfer 30 GToken
  const gtoken = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, sourceWallet);
  console.log("Transferring 30 GT...");
  const gtTx = await gtoken.transfer(newWallet.address, REQUIRED_STAKE);
  await gtTx.wait();
  console.log("  ✓ Transferred 30 GT");

  // Stake GToken
  const gtokenNew = new ethers.Contract(coreContracts.gToken, GTOKEN_ABI, newWallet);
  const gtokenStaking = new ethers.Contract(coreContracts.gTokenStaking, GTOKEN_STAKING_ABI, newWallet);

  console.log("Approving GTokenStaking...");
  const approveTx = await gtokenNew.approve(coreContracts.gTokenStaking, REQUIRED_STAKE);
  await approveTx.wait();
  console.log("  ✓ Approved");

  console.log("Staking 30 GT...");
  const stakeTx = await gtokenStaking.stake(REQUIRED_STAKE);
  await stakeTx.wait();
  console.log("  ✓ Staked");

  // Register community
  const registry = new ethers.Contract(coreContracts.registry, REGISTRY_ABI, newWallet);

  const profile = {
    name: "AAstar Fresh Test Community",
    ensName: "fresh-test.aastar.eth",
    description: "Fresh test community for MySBT v2.3.1 permissionless minting",
    website: "https://fresh-test.aastar.io",
    logoURI: "https://avatars.githubusercontent.com/u/fresh-test",
    twitterHandle: "@aastar_fresh_test",
    githubOrg: "aastar-fresh-test",
    telegramGroup: "https://t.me/aastar_fresh_test",
    xPNTsToken: ethers.ZeroAddress,
    supportedSBTs: [],
    mode: 0,  // INDEPENDENT
    nodeType: 0,  // PAYMASTER_AOA
    paymasterAddress: ethers.ZeroAddress,
    community: newWallet.address,
    registeredAt: 0,
    lastUpdatedAt: 0,
    isActive: true,
    memberCount: 0,
    allowPermissionlessMint: true,
  };

  console.log("Registering community...");
  const regTx = await registry.registerCommunity(profile, REQUIRED_STAKE);
  console.log("  TX:", regTx.hash);
  await regTx.wait();
  console.log("  ✓ Registered!");

  // Verify
  const regProfile = await registry.getCommunityProfile(newWallet.address);
  console.log();
  console.log("=== Community Registered ===");
  console.log("Name:", regProfile.name);
  console.log("Address:", newWallet.address);
  console.log("Private Key:", newWallet.privateKey);
  console.log("Allow Permissionless Mint:", regProfile.allowPermissionlessMint);
  console.log();
  console.log("✅ Ready for MySBT v2.3.1 testing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
