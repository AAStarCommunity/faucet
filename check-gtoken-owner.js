const { ethers } = require("ethers");

const GTOKEN_ADDRESS = "0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc";
const RPC_URL = "https://rpc.sepolia.org";

const GTOKEN_ABI = [
  "function owner() external view returns (address)"
];

async function checkGToken() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(GTOKEN_ADDRESS, GTOKEN_ABI, provider);
  
  try {
    const owner = await contract.owner();
    console.log("GToken Owner:", owner);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkGToken();
