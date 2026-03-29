# Live Poll Advanced: Video Demonstration Script

*Keep this script open on a second monitor or split screen while you record your screen.*

---

## 🕒 [0:00 - 0:15] Introduction
**Visual:** Start on the frontend's main page showing the clean beige theme. Do not connect your wallet yet.
**Voiceover:** "Hello! Welcome to Live Poll, a decentralized polling platform fully built on the Stellar Testnet using Soroban smart contracts. This application allows anyone to spin up instantaneous, transparent, and globally verifiable public polls."

## 🕒 [0:15 - 0:30] Connecting the Wallet
**Visual:** Click the "Connect Wallet" button in the top right. Select Freighter and approve the connection.
**Voiceover:** "To interact with the smart contract, users connect their Freighter wallet. Once connected, your Stellar address is verified, and you're immediately granted access to vote or deploy new polls directly to the network."

## 🕒 [0:30 - 1:00] Creating a Custom Poll
**Visual:** Click the "Create Poll +" button. Type a question like *"Should Stellar adopt a universal basic income?"* into the modal. Click "Create Poll". Sign the transaction in Freighter.
**Voiceover:** "Let's create a new poll. We type our question into this modal, and when we submit, we're actually signing a transaction that mutates the Soroban smart contract state. The contract assigns a unique tracking ID to our poll and pins it to the active ledger."

## 🕒 [1:00 - 1:20] Engaging & Casting a Vote
**Visual:** The UI refreshes and your new poll appears at the top. Click the "👍 Yes" button on your new poll. Approve the transaction in Freighter.
**Voiceover:** "Our poll is live. Now, anyone on the network can vote. Let's cast a 'Yes' vote. This dispatches a smart contract call. Behind the scenes, the Soroban backend increments the global metric and permanently maps our wallet address to this specific poll ID to prevent duplicates."

## 🕒 [1:20 - 1:40] Duplicate Protection & Error Handling
**Visual:** Once the transaction processes and the UI shows "Your vote has been recorded". Try to click the vote button again (or mock an attempt).
**Voiceover:** "Notice that the UI instantly updates our vote state, leveraging fast local-caching on top of blockchain consensus. But what if we try to cheat? The Soroban smart contract strictly tracks our wallet and will throw an explicit 'already_voted' panic if we try to hit the contract again, keeping the democratic process completely secure."

## 🕒 [1:40 - 2:00] Closing a Poll (Access Control)
**Visual:** Click the "Close Poll" button on your active poll. Sign the transaction.
**Voiceover:** "Finally, poll creators have root access to close their polls. When we hit 'Close', the smart contract verifies our wallet signature against the poll's creator tag. Once validated, voting is permanently frozen on-chain."

## 🕒 [2:00 - 2:15] Advanced Features & Outro
**Visual:** Toggle the Dark/Light mode theme switcher in the top right to show off the styling.
**Voiceover:** "The frontend is built with React and Vite, featuring a responsive Light and Dark mode synced to local storage. Thank you for watching my demonstration of the Stellar Live Poll application!"
