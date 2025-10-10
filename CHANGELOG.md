# Changelog

All notable changes to the Faucet API will be documented in this file.

## [1.3.0] - 2025-01-10

### Fixed
- **Critical**: Updated `SIMPLE_ACCOUNT_FACTORY_ADDRESS` from V1 to V2 in `vercel.json`
  - V1 Factory (old): `0x9bD66892144FCf0BAF5B6946AEAFf38B0d967881`
  - V2 Factory (new): `0x8B516A71c134a4b5196775e63b944f88Cc637F2b`
  - V2 Implementation: `0x174f4b95baf89E1295F1b3826a719F505caDD02A`

### Changed
- All new accounts created via `/api/create-account` now use SimpleAccountV2
- V2 accounts support both personal_sign and raw signature formats
- V2 accounts include `version()` function returning "2.0.0"

### Migration Notes
- Old V1 accounts remain functional but don't support personal_sign signatures
- Users should clear old accounts from localStorage and create new V2 accounts
- Demo UI includes "Clear Account" button for easy migration

### Verification
```bash
# Test creating V2 account
curl -X POST https://faucet.aastar.io/api/create-account \
  -H "Content-Type: application/json" \
  -d '{"owner":"0x411BD567E46C0781248dbB6a9211891C032885e5","salt":666555}'

# Verify it's V2
cast call <account_address> "version()(string)" --rpc-url <rpc_url>
# Expected output: "2.0.0"
```

## [1.2.0] - 2025-01-XX

### Added
- Contract info display in faucet UI
- Updated branding and styling

## [1.1.0] - Previous releases

### Added
- Basic faucet functionality
- PNT, SBT, USDT token minting
- SimpleAccount creation via factory
- Rate limiting
- CORS support
