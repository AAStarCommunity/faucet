#!/bin/bash

FAUCET_API="https://faucet.aastar.io/api"
TEST_ADDRESS="0xc8d1Ae1063176BEBC750D9aD5D057BA4A65daf3d"

echo "🧪 Testing Faucet APIs"
echo "====================="
echo ""

echo "1️⃣ Testing PNT Mint..."
curl -X POST "$FAUCET_API/mint" \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$TEST_ADDRESS\",\"type\":\"pnt\"}" \
  -s | jq .

echo ""
echo "2️⃣ Testing USDT Mint..."
curl -X POST "$FAUCET_API/mint-usdt" \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$TEST_ADDRESS\"}" \
  -s | jq .

echo ""
echo "✅ Tests completed!"
