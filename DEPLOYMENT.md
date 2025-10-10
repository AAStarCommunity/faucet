# Faucet Deployment Guide

## Environment Variables Configuration

The faucet application requires the following environment variables to be set in Vercel:

### Required Environment Variables

1. **SEPOLIA_RPC_URL**
   - Description: Sepolia network RPC endpoint (e.g., Alchemy or Infura)
   - Example: `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`
   - Required for: All API endpoints

2. **SEPOLIA_PRIVATE_KEY** or **SEPOLIA_PRIVATE_KEY_NEW**
   - Description: Private key of the faucet operator account (must have ETH for gas)
   - Format: `0x...` (66 characters hex string)
   - Required for: Minting tokens and creating accounts
   - ⚠️ **Security**: This account should be funded but not hold significant assets

3. **PNT_TOKEN_ADDRESS** (Optional, has default)
   - Description: PNT token contract address
   - Default: `0xD14E87d8D8B69016Fcc08728c33799bD3F66F180`

4. **SBT_CONTRACT_ADDRESS** (Optional, has default)
   - Description: SBT contract address
   - Default: `0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f`

5. **USDT_CONTRACT_ADDRESS** (Optional, has default)
   - Description: Mock USDT contract address
   - Default: `0x14EaC6C3D49AEDff3D59773A7d7bfb50182bCfDc`

6. **ADMIN_KEY** (Optional)
   - Description: Secret key for admin operations (init-pool endpoint)
   - Only required if using the init-pool API

## Vercel Deployment Steps

### 1. Set Environment Variables in Vercel Dashboard

Navigate to: `https://vercel.com/[your-username]/faucet/settings/environment-variables`

Add the following:
```
SEPOLIA_RPC_URL = https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY = 0xYOUR_PRIVATE_KEY
```

⚠️ **Important**: Set these for **Production**, **Preview**, and **Development** environments.

### 2. Redeploy the Application

After setting environment variables, trigger a redeploy:

```bash
# Option 1: Via CLI
cd /path/to/faucet
vercel --prod

# Option 2: Via Vercel Dashboard
# Go to Deployments tab and click "Redeploy"
```

### 3. Verify Deployment

Test the API endpoints:

```bash
# Test mint SBT
curl -X POST https://faucet.aastar.io/api/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourAddress","type":"sbt"}'

# Test mint USDT
curl -X POST https://faucet.aastar.io/api/mint-usdt \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourAddress"}'

# Test create account
curl -X POST https://faucet.aastar.io/api/create-account \
  -H "Content-Type: application/json" \
  -d '{"ownerAddress":"0xYourAddress"}'
```

## Current Errors and Solutions

### Error: "Server configuration error"

**Cause**: Missing `SEPOLIA_RPC_URL` or `SEPOLIA_PRIVATE_KEY` in Vercel environment variables.

**Solution**: Add these environment variables in Vercel dashboard and redeploy.

### Error: "Method not allowed"

**Cause**: API endpoint received wrong HTTP method (e.g., GET instead of POST).

**Solution**: Ensure you're sending POST requests to all API endpoints.

### Error: "Faucet is out of funds"

**Cause**: The faucet operator account has insufficient ETH for gas fees.

**Solution**: Fund the operator account with Sepolia ETH (https://sepoliafaucet.com).

## API Endpoints

- `POST /api/mint` - Mint SBT or PNT tokens
- `POST /api/mint-usdt` - Mint 10 Mock USDT
- `POST /api/create-account` - Create AA account
- `POST /api/init-pool` - Initialize PNT pool (admin only)

## Rate Limits

- SBT/PNT: 2 requests per hour per address
- USDT: 5 requests per hour per address
- Account creation: 3 requests per hour per address

## Security Notes

1. **Never commit** `.env` file to git
2. Use a **dedicated operator account** with limited funds
3. Rotate the `ADMIN_KEY` regularly if using init-pool endpoint
4. Monitor the operator account balance to ensure continuous service
5. Consider using a **managed secret service** for production (e.g., Vercel Secret Storage)

## Troubleshooting

### Check Vercel Logs

```bash
vercel logs faucet --prod
```

### Common Issues

1. **Environment variables not updating**: Redeploy after setting variables
2. **CORS errors**: Check that API allows origins (currently set to `*`)
3. **Transaction failures**: Verify operator account has sufficient ETH
4. **Contract call reverts**: Ensure contract addresses are correct for Sepolia

## Support

For issues, please visit: https://github.com/AAStarCommunity/faucet/issues
