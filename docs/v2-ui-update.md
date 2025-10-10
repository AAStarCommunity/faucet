# Faucet V2 UI Update - 2025-01-10

## 更新概览

Faucet网站已全面升级至SimpleAccountFactoryV2，并重新设计了UI布局。

## 主要变更

### 1. Factory升级至V2

**旧版本 (V1)**:
- Factory: `0x9bD66892144FCf0BAF5B6946AEAFf38B0d967881`
- 创建: SimpleAccount V1
- 签名支持: 仅eth_sign (已被MetaMask禁用)

**新版本 (V2)** ✅:
- Factory: `0x8B516A71c134a4b5196775e63b944f88Cc637F2b`
- 创建: SimpleAccountV2
- 签名支持: personal_sign + eth_sign (兼容MetaMask)
- 版本号: "2.0.0"

### 2. UI布局重新设计

#### 地址输入区域
**之前**:
```
[Your Ethereum Address]
[0x...               ]

[Mint SBT] [Mint 100 PNT]
[Mint 10 USDT] [Create AA Account]
```

**现在**:
```
[Your Ethereum Address]
[0x... (EOA or Contract)  ] [Create AA Account]

[Mint SBT] [Mint 100 PNT]
[     Mint 10 USDT       ]
```

**改进**:
- ✅ "Create AA Account"按钮移至地址输入框右侧，更符合用户操作流程
- ✅ 输入框placeholder更新为 "0x... (EOA or Contract)"，明确可输入类型
- ✅ USDT按钮占满整行，视觉上更平衡

### 3. 合约信息展示升级

**SimpleAccountFactoryV2** 卡片新增信息:
```
📋 Contract Information

SimpleAccountFactoryV2                    [ERC-4337]
Address: 0x8B51...7F2b                   [View →]
Creates: SimpleAccountV2 (supports personal_sign)
```

### 4. 错误提示优化

**旧提示**: "Please enter an Ethereum address"

**新提示**: "Please enter an Ethereum EOA(MetaMask) address or contract account address"

**改进**: 明确告知用户可以输入EOA地址或合约地址

### 5. 代码层面更新

#### HTML页面 (`public/index.html`)
- ✅ CONTRACTS.FACTORY 更新为 V2 地址
- ✅ 添加 `.address-input-wrapper` 和 `.btn-create-account` 样式
- ✅ Factory显示名称改为 "SimpleAccountFactoryV2"
- ✅ 添加 "Creates: SimpleAccountV2 (supports personal_sign)" 说明

#### API代码
- ✅ `api/create-account.js` - 默认factory更新为V2
- ✅ `api/init-pool.js` - 默认factory更新为V2

#### 配置文件
- ✅ `vercel.json` - SIMPLE_ACCOUNT_FACTORY_ADDRESS = V2
- ✅ `.env.example` - 示例地址更新为V2
- ✅ `API_REFERENCE.md` - 文档地址更新为V2

## 验证结果

### ✅ 网站部署验证
```bash
# 检查factory显示
curl -s https://faucet.aastar.io/ | grep -i "factory"
# ✅ 输出: SimpleAccountFactoryV2

# 检查personal_sign提示
curl -s https://faucet.aastar.io/ | grep -i "personal_sign"
# ✅ 输出: SimpleAccountV2 (supports personal_sign)
```

### ✅ API功能验证
```bash
# 创建新账户
curl -X POST https://faucet.aastar.io/api/create-account \
  -H "Content-Type: application/json" \
  -d '{"owner":"0x411BD567E46C0781248dbB6a9211891C032885e5","salt":555444}'

# 返回
{
  "success": true,
  "accountAddress": "0xEF6dBaEFD344A26f8860c2B7bCE3d0a20Fc602Eb",
  "txHash": "0x6427a649978233324ba8d86b863c970d33e1908349453fead9d2a076903d2a81"
}

# 验证版本
cast call 0xEF6dBaEFD344A26f8860c2B7bCE3d0a20Fc602Eb "version()(string)"
# ✅ 输出: "2.0.0"
```

## 用户体验改进

### 操作流程优化

**场景1: 使用MetaMask地址领取代币**
1. 用户连接MetaMask
2. 复制地址并粘贴到输入框
3. 点击 "Mint SBT" 或 "Mint 100 PNT"
4. ✅ 代币直接发送到EOA地址

**场景2: 创建AA账户并领取代币**
1. 用户在输入框输入自己的EOA地址
2. 点击右侧的 "Create AA Account" 按钮
3. ✅ 创建SimpleAccountV2账户（支持personal_sign）
4. 复制返回的AA账户地址
5. 粘贴到输入框
6. 点击领取代币
7. ✅ 代币发送到AA账户

### 视觉改进

- ✅ 按钮布局更加紧凑合理
- ✅ "Create AA Account"按钮位置更符合用户操作习惯
- ✅ USDT按钮全宽显示，避免视觉不平衡
- ✅ 合约信息卡片新增V2特性说明

## 技术细节

### V2 Factory实现
```solidity
// SimpleAccountFactoryV2.sol
contract SimpleAccountFactoryV2 {
    SimpleAccountV2 public immutable accountImplementation;
    
    function createAccount(address owner, uint256 salt) 
        public returns (SimpleAccountV2 ret) 
    {
        // 使用CREATE2创建确定性地址
        ret = SimpleAccountV2(payable(
            new ERC1967Proxy{salt: bytes32(salt)}(
                address(accountImplementation),
                abi.encodeCall(SimpleAccountV2.initialize, (owner))
            )
        ));
    }
}
```

### V2 Account签名验证
```solidity
// SimpleAccountV2.sol - validateUserOp()
function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
    internal override virtual returns (uint256 validationData) 
{
    bytes32 hash = userOpHash.toEthSignedMessageHash();
    // 支持personal_sign格式 (MetaMask默认)
    if (owner() != hash.recover(userOp.signature))
        return SIG_VALIDATION_FAILED;
    return 0;
}
```

## 部署信息

- **部署时间**: 2025-01-10
- **Commit**: `8ca7094`
- **URL**: https://faucet.aastar.io
- **Vercel**: https://vercel.com/jhfnetboys-projects/faucet

## 相关文档

- [V2迁移指南](../../demo/docs/v2-migration-guide.md)
- [V2修复总结](../../demo/docs/v2-fix-summary.md)
- [CHANGELOG](../CHANGELOG.md)
- [API Reference](../API_REFERENCE.md)

## 后续任务

- [x] 更新所有hardcoded V1地址为V2
- [x] 重新设计UI布局
- [x] 部署到生产环境
- [x] 验证V2账户创建
- [ ] 更新用户文档
- [ ] 通知社区更新

## 总结

此次更新全面迁移到SimpleAccountV2，解决了MetaMask禁用eth_sign的兼容性问题，同时优化了用户界面和操作流程。所有新创建的AA账户现在都支持personal_sign签名方法，确保与MetaMask的完美兼容。

**关键成果**:
- ✅ Factory V2升级完成
- ✅ UI布局更合理
- ✅ 错误提示更清晰
- ✅ 所有配置文件已更新
- ✅ 生产环境部署成功
- ✅ 功能验证通过

🎉 Faucet现在已完全支持SimpleAccountV2，为用户提供更好的Account Abstraction体验！
