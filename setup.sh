#!/bin/bash
set -e

echo "🚀 Bootstrapping Live Poll Advanced locally..."

# 1. Build and Deploy Smart Contract
echo "📦 Building smart contract (soroban)..."
cd contract
cargo build --target wasm32-unknown-unknown --release

echo "🌐 Deploying to Stellar Testnet (assuming 'deployer' identity exists)..."
CONTRACT_ID=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm --source deployer --network testnet)

echo "✅ Deployed! Contract ID: $CONTRACT_ID"
cd ..

# 2. Update Environment Variables
echo "🔧 Updating frontend .env..."
cat <<EOF > frontend/.env
VITE_CONTRACT_ID=$CONTRACT_ID
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
EOF

# 3. Setup Frontend
echo "💻 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps

echo "🧪 Running unit tests..."
npm run test

echo "🌐 Starting development server..."
npm run dev
