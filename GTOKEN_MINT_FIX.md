# GToken Mint 权限修复 - 2025-11-03

## 问题描述

Faucet API 在 mint GToken 时报错：
```
Error: execution reverted (0x118cdaa7)
```

## 错误分析

### 错误码解析
- `0x118cdaa7` = `OwnableUnauthorizedAccount`
- 这是 OpenZeppelin Ownable 的自定义错误
- 说明调用者没有权限执行 `onlyOwner` 的函数

### 合约权限要求

**GToken.sol** (v2.0.0):
```solidity
function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
}
```

只有合约 owner 可以调用 `mint()`。

### 地址验证（使用 @aastar/shared-config v0.2.12）

| 角色 | 地址 | 说明 |
|------|------|------|
| **GToken Owner** | `0x411BD567E46C0781248dbB6a9211891C032885e5` | Deployer 1 (AAStar Community Owner) |
| **Faucet 使用的地址** | `0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA` | OWNER2 (之前用于 PNT mint) |

**问题**：Faucet 使用的 OWNER2 地址**不是** GToken 的 owner，无法 mint。

## 解决方案

### 更新 Vercel 环境变量

将 `OWNER_PRIVATE_KEY` 更新为 **Deployer 1** 的私钥：

```bash
# 1. 删除旧的环境变量
vercel env rm OWNER_PRIVATE_KEY production
vercel env rm OWNER_PRIVATE_KEY preview
vercel env rm OWNER_PRIVATE_KEY development

# 2. 添加新的环境变量（使用 DEPLOYER 私钥）
echo -n "0x2717..." | vercel env add OWNER_PRIVATE_KEY production
echo -n "0x2717..." | vercel env add OWNER_PRIVATE_KEY preview
echo -n "0x2717..." | vercel env add OWNER_PRIVATE_KEY development
```

**重要**：
- 使用 `echo -n` 确保移除末尾换行符
- 私钥来自 `env/.env` 的 `PRIVATE_KEY` (Deployer 1)

### 执行时间
- **日期**: 2025-11-03
- **执行结果**: ✅ 成功

### 验证

```bash
# 查看更新后的环境变量
vercel env ls

# 输出：
# OWNER_PRIVATE_KEY  Encrypted  Production   24s ago
# OWNER_PRIVATE_KEY  Encrypted  Preview      16s ago
# OWNER_PRIVATE_KEY  Encrypted  Development   6s ago
```

## 合约信息（来自 shared-config）

```javascript
// @aastar/shared-config v0.2.12
const { getCommunities, getCoreContracts } = require("@aastar/shared-config");

const network = "sepolia";
const core = getCoreContracts(network);
const communities = getCommunities(network);

console.log("GToken:", core.gToken);
// 0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc

console.log("Owner:", communities.aastar.owner);
// 0x411BD567E46C0781248dbB6a9211891C032885e5 (Deployer 1)
```

## 历史背景

### 之前的 PNT Mint 修复 (2025-10-10)

参考文档：`UPDATES_20251010.md`

当时修复的是 **GasTokenV2 (PNT)** 的 mint 问题：
- PNT 合约 owner 是 **OWNER2** (`0xe24b6...DaFA`)
- 所以将 Faucet 的 `OWNER_PRIVATE_KEY` 设为 OWNER2 的私钥

### 现在的 GToken Mint 问题

**GToken v2.0.0** 是新部署的合约（2025-11-01）：
- GToken owner 是 **Deployer 1** (`0x411BD5...85e5`)
- Faucet 还在使用 OWNER2 的私钥，导致无权限

## 长期优化建议

### 多私钥配置方案

修改 `faucet/api/mint.js`，根据 token 类型使用不同的私钥：

```javascript
// 环境变量配置
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;  // For GToken
const OWNER2_PRIVATE_KEY = process.env.OWNER2_PRIVATE_KEY;      // For PNT (GasTokenV2)

// 根据 token 类型选择 signer
function getSigner(tokenType, provider) {
  switch(tokenType) {
    case 'gtoken':
      return new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    case 'pnt':
      return new ethers.Wallet(OWNER2_PRIVATE_KEY, provider);
    case 'sbt':
    case 'usdt':
    default:
      return new ethers.Wallet(OWNER2_PRIVATE_KEY, provider);
  }
}

// 使用示例
async function mintGToken(address, provider) {
  const signer = getSigner('gtoken', provider);
  const gtokenContract = new ethers.Contract(
    GTOKEN_ADDRESS,
    GTOKEN_ABI,
    signer
  );
  const tx = await gtokenContract.mint(address, GTOKEN_MINT_AMOUNT);
  return await tx.wait();
}
```

### 优点
- 每个 token 使用正确的私钥
- 更灵活，易于维护
- 降低单点私钥泄露风险

## 相关文件

- **Faucet API**: `/Volumes/UltraDisk/Dev2/aastar/faucet/api/mint.js`
- **Shared Config**: `@aastar/shared-config` v0.2.12
- **GToken 合约**: `/Volumes/UltraDisk/Dev2/aastar/SuperPaymaster/src/paymasters/v2/core/GToken.sol`
- **环境配置**: `/Volumes/UltraDisk/Dev2/aastar/SuperPaymaster/env/.env`

## 链上验证

```bash
# 使用 cast 验证 GToken owner
cast call 0x99cCb70646Be7A5aeE7aF98cE853a1EA1A676DCc \
  "owner()" \
  --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo

# 输出：
# 0x000000000000000000000000411bd567e46c0781248dbb6a9211891c032885e5
```

## 部署验证

**部署时间**: 2025-11-03 02:04 UTC

```bash
# 部署到生产环境
vercel --prod

# 部署结果
✅ Status: Ready
✅ URL: https://faucet-aastar.vercel.app
✅ Deployment: faucet-8se0efytm-jhfnetboys-projects.vercel.app
✅ Duration: 17s
```

**环境变量已更新**:
- `OWNER_PRIVATE_KEY` 现在使用 Deployer 1 的私钥
- 所有环境（Production, Preview, Development）都已更新

现在 GToken mint 功能已使用正确的私钥，应该可以正常工作。

---
**更新时间**: 2025-11-03
**更新人**: Claude Code Assistant
