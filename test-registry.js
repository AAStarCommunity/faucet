// Test Registry isRegisteredCommunity function
const { ethers } = require("ethers");
const { getCoreContracts } = require("@aastar/shared-config");

const network = "sepolia";
const coreContracts = getCoreContracts(network);

const REGISTRY_ABI = [
  "function isRegisteredCommunity(address communityAddress) external view returns (bool)",
  "function getCommunityProfile(address communityAddress) external view returns (tuple(string name, string ensName, string description, string website, string logoURI, string twitterHandle, string githubOrg, string telegramGroup, address xPNTsToken, address[] supportedSBTs, uint8 mode, uint8 nodeType, address paymasterAddress, address community, uint256 registeredAt, uint256 lastUpdatedAt, bool isActive, uint256 memberCount, bool allowPermissionlessMint))",
];

const testCommunity = "0xf63F964cCAf8A1BAD4B65D1fAc2CE844c095287E";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    console.error("Error: SEPOLIA_RPC_URL required");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const registry = new ethers.Contract(coreContracts.registry, REGISTRY_ABI, provider);

  console.log("Testing Registry:", coreContracts.registry);
  console.log("Test Community:", testCommunity);
  console.log();

  try {
    console.log("Calling isRegisteredCommunity...");
    const isRegistered = await registry.isRegisteredCommunity(testCommunity);
    console.log("Result:", isRegistered);
    console.log();

    console.log("Calling getCommunityProfile...");
    const profile = await registry.getCommunityProfile(testCommunity);
    console.log("Name:", profile.name);
    console.log("Registered At:", profile.registeredAt);
    console.log("Is Active:", profile.isActive);
    console.log("Allow Permissionless Mint:", profile.allowPermissionlessMint);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
