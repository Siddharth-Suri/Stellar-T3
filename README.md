# Live Poll — Stellar Testnet

A decentralised community poll running on **Soroban** smart contracts on the Stellar Testnet. Users connect their Stellar wallet, vote YES or NO on a governance question, and see live results updated every 5 seconds — all on-chain.

---

## Features

- 🔗 **Wallet Connect** — Freighter, LOBSTR, and all StellarWalletsKit-supported wallets
- ✅ **On-chain Voting** — Each vote is a real Soroban contract call
- 📊 **Live Results** — Results refresh every 5 seconds via Soroban simulation
- 🔴 **Error Handling** — Wallet not found, user cancelled, insufficient balance
- 🔍 **TX Explorer** — Every successful vote links to Stellar Expert

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Smart contract | Rust + Soroban SDK             |
| Frontend  | React + Vite                      |
| Wallet    | @creit.tech/stellar-wallets-kit   |
| Stellar   | @stellar/stellar-sdk              |
| Network   | Stellar Testnet (Soroban)         |

---

## Project Structure

```
live-poll/
├── contract/
│   ├── Cargo.toml
│   └── src/lib.rs          ← Soroban smart contract
└── frontend/
    ├── .env                ← Environment variables
    └── src/
        ├── constants.js
        ├── utils/soroban.js
        ├── hooks/useWallet.js
        ├── hooks/usePoll.js
        ├── components/WalletBar.jsx
        ├── components/PollCard.jsx
        ├── components/ResultsBar.jsx
        └── components/TxStatus.jsx
```

---

## Setup

### 1. Deploy the Smart Contract

> Requires the [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (`stellar`) and Rust with `wasm32-unknown-unknown` target.

```bash
# Add WASM target (once)
rustup target add wasm32-unknown-unknown

cd contract

# Build the WASM
stellar contract build

# Deploy to testnet (replace YOUR_SECRET_KEY)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

The command will output a contract address like `CXXXX...`. Copy it.

### 2. Configure the Frontend

```bash
cd ../frontend
cp .env .env.local   # or edit .env directly
```

Edit `.env`:
```env
VITE_CONTRACT_ID=<paste contract address here>
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_POLL_QUESTION=Should Stellar adopt a universal basic income protocol?
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Testnet Resources

| Resource | URL |
|----------|-----|
| Friendbot (free XLM) | https://laboratory.stellar.org/#account-creator |
| Stellar Expert Explorer | https://stellar.expert/explorer/testnet |
| Soroban Docs | https://developers.stellar.org/docs/smart-contracts |

---

## Deployed Contract

> **Contract Address:** `<填入已部署合约地址>`  
> Update this after deploying.

---

## Error Handling

| Error | Trigger | Message Shown |
|-------|---------|---------------|
| `WALLET_NOT_FOUND` | Extension not installed | "Wallet not found. Install Freighter or LOBSTR." |
| `USER_REJECTED` | Modal closed / TX denied | "Cancelled." |
| `INSUFFICIENT_BALANCE` | Not enough XLM for fees | "Not enough XLM. Get testnet funds from Friendbot." |

---

## Screenshot

> _Add a screenshot of the wallet connect modal here._

---

## Sample Transaction

> _Add a verifiable transaction hash after a successful vote._  
> Explorer: `https://stellar.expert/explorer/testnet/tx/<hash>`
