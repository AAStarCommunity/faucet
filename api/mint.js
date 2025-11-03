// Vercel Serverless Function for Faucet Minting
// Mints SBT, PNT, or GToken tokens to user addresses
// Now uses @aastar/shared-config for contract addresses

const { ethers } = require("ethers");
const {
  getCoreContracts,
  getTokenContracts,
  getTestTokenContracts,
} = require("@aastar/shared-config");

// Get contract addresses from shared-config
const network = "sepolia";
const coreContracts = getCoreContracts(network);
const tokenContracts = getTokenContracts(network);
const testTokenContracts = getTestTokenContracts(network);

// Contract ABIs
const SBT_ABI = [
  "function safeMint(address to) external",
  "function balanceOf(address owner) external view returns (uint256)",
];

const PNT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address owner) external view returns (uint256)",
];

const GTOKEN_ABI = ["function mint(address to, uint256 amount) external"];

const USDT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address owner) external view returns (uint256)",
];

// Configuration - Now from shared-config with env var overrides
const SEPOLIA_RPC_URL = (process.env.SEPOLIA_RPC_URL || "").trim();
const OWNER_PRIVATE_KEY = (process.env.OWNER_PRIVATE_KEY || "").trim(); // For aPNTs, GToken
const OWNER2_PRIVATE_KEY = (process.env.OWNER2_PRIVATE_KEY || "").trim(); // For bPNTs

// Contract addresses from shared-config (can be overridden by env vars)
const SBT_ADDRESS = (
  process.env.SBT_CONTRACT_ADDRESS || tokenContracts.mySBT
).trim();

// For PNT, we now use aPNTs and bPNTs from xPNTsFactory
const APNTS_ADDRESS = (
  process.env.APNTS_CONTRACT_ADDRESS || testTokenContracts.aPNTs
).trim();

const BPNTS_ADDRESS = (
  process.env.BPNTS_CONTRACT_ADDRESS || testTokenContracts.bPNTs
).trim();

const GTOKEN_ADDRESS = (
  process.env.GTOKEN_CONTRACT_ADDRESS || coreContracts.gToken
).trim();

// Mock USDT for testing (now in shared-config)
const USDT_ADDRESS = (
  process.env.USDT_CONTRACT_ADDRESS || testTokenContracts.mockUSDT
).trim();

// Mint amounts
const APNTS_MINT_AMOUNT = ethers.parseUnits("1000", 18); // 1000 aPNTs
const BPNTS_MINT_AMOUNT = ethers.parseUnits("1000", 18); // 1000 bPNTs
const GTOKEN_MINT_AMOUNT = ethers.parseUnits("300", 18); // 300 GToken
const USDT_MINT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDT (6 decimals)

// Rate limiting (simple in-memory cache for demo)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 2; // 2 requests per hour per address

function checkRateLimit(address, type) {
  const key = `${address}-${type}`;
  const now = Date.now();

  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, [now]);
    return true;
  }

  const timestamps = rateLimitCache
    .get(key)
    .filter((ts) => now - ts < RATE_LIMIT_WINDOW);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  timestamps.push(now);
  rateLimitCache.set(key, timestamps);
  return true;
}

async function mintSBT(address, provider, signer) {
  const sbtContract = new ethers.Contract(SBT_ADDRESS, SBT_ABI, signer);

  // Check if user already has SBT
  const balance = await sbtContract.balanceOf(address);
  if (balance > 0n) {
    throw new Error("Address already owns an SBT");
  }

  // Mint SBT (using safeMint which requires owner)
  const tx = await sbtContract.safeMint(address);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    amount: "1 SBT",
    contractAddress: SBT_ADDRESS,
  };
}

async function mintPNT(address, provider) {
  // Mint aPNTs (using Deployer 1's private key)
  const apntsSigner = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  const apntsContract = new ethers.Contract(APNTS_ADDRESS, PNT_ABI, apntsSigner);
  const apntsTx = await apntsContract.mint(address, APNTS_MINT_AMOUNT);
  const apntsReceipt = await apntsTx.wait();

  // Mint bPNTs (using OWNER2's private key)
  const bpntsSigner = new ethers.Wallet(OWNER2_PRIVATE_KEY, provider);
  const bpntsContract = new ethers.Contract(BPNTS_ADDRESS, PNT_ABI, bpntsSigner);
  const bpntsTx = await bpntsContract.mint(address, BPNTS_MINT_AMOUNT);
  const bpntsReceipt = await bpntsTx.wait();

  return {
    txHash: apntsReceipt.hash,
    txHash2: bpntsReceipt.hash,
    blockNumber: apntsReceipt.blockNumber,
    amount: "1000 aPNTs + 1000 bPNTs",
    contractAddress: APNTS_ADDRESS,
    contractAddress2: BPNTS_ADDRESS,
  };
}

async function mintGToken(address, provider, signer) {
  const gtokenContract = new ethers.Contract(
    GTOKEN_ADDRESS,
    GTOKEN_ABI,
    signer,
  );

  // Mint GToken
  const tx = await gtokenContract.mint(address, GTOKEN_MINT_AMOUNT);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    amount: "300 GToken",
    contractAddress: GTOKEN_ADDRESS,
  };
}

async function mintUSDT(address, provider, signer) {
  const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

  // Mint USDT
  const tx = await usdtContract.mint(address, USDT_MINT_AMOUNT);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    amount: "1000 USDT",
    contractAddress: USDT_ADDRESS,
  };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, type } = req.body;

    // Validate input
    if (!address || !type) {
      return res
        .status(400)
        .json({ error: "Missing address or type parameter" });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    if (!["sbt", "pnt", "gtoken", "usdt"].includes(type)) {
      return res
        .status(400)
        .json({
          error:
            'Invalid type. Must be "sbt", "pnt", "gtoken", or "usdt"',
        });
    }

    // Check rate limit
    if (!checkRateLimit(address, type)) {
      return res.status(429).json({
        error:
          "Rate limit exceeded. Please try again later (max 2 requests per hour)",
      });
    }

    // Validate environment variables
    if (!SEPOLIA_RPC_URL || !OWNER_PRIVATE_KEY || !OWNER2_PRIVATE_KEY) {
      console.error("Missing environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

    // Mint token
    let result;
    if (type === "sbt") {
      result = await mintSBT(address, provider, signer);
    } else if (type === "pnt") {
      result = await mintPNT(address, provider); // PNT uses both OWNER and OWNER2 keys
    } else if (type === "gtoken") {
      result = await mintGToken(address, provider, signer);
    } else if (type === "usdt") {
      result = await mintUSDT(address, provider, signer);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      amount: result.amount,
      contractAddress: result.contractAddress,
      recipient: address,
      type: type,
      network: "Sepolia",
      note:
        type === "sbt"
          ? "Using MySBT v2.3 from @aastar/shared-config"
          : type === "gtoken"
            ? "Using GToken from @aastar/shared-config"
            : type === "usdt"
              ? "Using Mock USDT from @aastar/shared-config"
              : "Using aPNTs and bPNTs from @aastar/shared-config",
    });
  } catch (error) {
    console.error("Mint error:", error);

    // Handle specific errors
    let errorMessage = error.message;
    let statusCode = 500;

    if (errorMessage.includes("already owns")) {
      statusCode = 400;
    } else if (errorMessage.includes("insufficient funds")) {
      errorMessage =
        "Faucet is out of funds. Please contact the administrator.";
    } else if (errorMessage.includes("nonce")) {
      errorMessage = "Transaction conflict. Please try again.";
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
}
