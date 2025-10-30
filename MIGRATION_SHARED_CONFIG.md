# Migration to @aastar/shared-config

This document describes the migration of the faucet to use `@aastar/shared-config` for contract address management.

## Changes Made

### 1. Package Installation

```bash
pnpm add @aastar/shared-config@latest
```

### 2. Updated Files

#### `api/mint.js`
- **Before**: All contract addresses hardcoded or from env vars only
- **After**: Core contract addresses from `@aastar/shared-config` with env var overrides

**Addresses now from shared-config:**
- `SBT_CONTRACT_ADDRESS` → `tokenContracts.mySBT` (MySBT v2.3: `0xc1085841307d85d4a8dC973321Df2dF7c01cE5C8`)
- `GTOKEN_CONTRACT_ADDRESS` → `coreContracts.gToken` (GToken: `0x868F843723a98c6EECC4BF0aF3352C53d5004147`)

**Legacy addresses preserved:**
- `PNT_TOKEN_ADDRESS` - Kept as legacy GasTokenV2 (`0xD14E87d8D8B69016Fcc08728c33799bD3F66F180`)
- Note: New communities should use xPNTsFactory to deploy custom gas tokens

### 3. Usage

The faucet now automatically uses correct contract addresses from shared-config:

```javascript
const {
  getCoreContracts,
  getTokenContracts,
} = require("@aastar/shared-config");

const network = "sepolia";
const coreContracts = getCoreContracts(network);
const tokenContracts = getTokenContracts(network);

// Addresses are now centrally managed
const SBT_ADDRESS = tokenContracts.mySBT;  // MySBT v2.3
const GTOKEN_ADDRESS = coreContracts.gToken; // GToken
```

## Benefits

### 1. Single Source of Truth
- Contract addresses managed in one place
- Updates propagate automatically when updating the package

### 2. Consistency
- Same addresses as registry and other AAstar projects
- No more address mismatches between deployments

### 3. Easy Updates
When contracts are redeployed:
1. Update `@aastar/shared-config` package
2. Publish new version
3. Update faucet: `pnpm add @aastar/shared-config@latest`
4. Redeploy to Vercel
5. Done!

## Environment Variables

### Now Optional (Defaults from shared-config)

These env vars are now optional. If not set, values from shared-config are used:

```env
# Optional overrides (rarely needed)
SBT_CONTRACT_ADDRESS=...
GTOKEN_CONTRACT_ADDRESS=...
```

### Still Required

These env vars are still required:

```env
# Required for operation
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ADMIN_KEY=your-admin-secret
```

## Backward Compatibility

✅ **Fully backward compatible!**

- Existing env vars still work (they override shared-config defaults)
- API responses now include `contractAddress` field
- Response includes `note` field explaining which contract system is used

## Testing

### Local Testing

```bash
# Test the mint API locally
./test-mint-api.sh
```

### Vercel Deployment

```bash
# Deploy to Vercel
pnpm deploy
```

### Verify Contract Addresses

The API response now includes the contract address used:

```json
{
  "success": true,
  "txHash": "0x...",
  "contractAddress": "0xc1085841307d85d4a8dC973321Df2dF7c01cE5C8",
  "type": "sbt",
  "note": "Using MySBT v2.3 from @aastar/shared-config"
}
```

## Contract Address Reference

| Token Type | Contract | Address | Source |
|------------|----------|---------|--------|
| SBT | MySBT v2.3 | `0xc1085841307d85d4a8dC973321Df2dF7c01cE5C8` | shared-config |
| GToken | GToken | `0x868F843723a98c6EECC4BF0aF3352C53d5004147` | shared-config |
| PNT | GasTokenV2 (legacy) | `0xD14E87d8D8B69016Fcc08728c33799bD3F66F180` | hardcoded |

## Rollback Plan

If needed, revert by setting env vars explicitly:

```env
# Override with specific addresses
SBT_CONTRACT_ADDRESS=0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f
GTOKEN_CONTRACT_ADDRESS=0x868F843723a98c6EECC4BF0aF3352C53d5004147
```

Or remove the package:

```bash
pnpm remove @aastar/shared-config
git checkout HEAD~ api/mint.js
```

## Questions?

- Package docs: https://github.com/AAStarCommunity/aastar-shared-config
- Issues: https://github.com/AAStarCommunity/aastar-shared-config/issues
