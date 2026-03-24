// src/App.jsx
import React from "react";
import { WalletBar } from "./components/WalletBar.jsx";
import { PollCard } from "./components/PollCard.jsx";
import { useWallet } from "./hooks/useWallet.js";
import { usePoll } from "./hooks/usePoll.js";

export default function App() {
  const { publicKey, connecting, walletError, connect, disconnect, signTransaction } =
    useWallet();

  const {
    results,
    loadingResults,
    txStatus,
    txHash,
    txError,
    hasVoted,
    vote,
    resetTx,
  } = usePoll(publicKey, signTransaction);

  return (
    <div className="app">
      <WalletBar
        publicKey={publicKey}
        connecting={connecting}
        walletError={walletError}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <div className="app__body">
        <PollCard
          publicKey={publicKey}
          results={results}
          loadingResults={loadingResults}
          txStatus={txStatus}
          txHash={txHash}
          txError={txError}
          hasVoted={hasVoted}
          onVote={vote}
          onResetTx={resetTx}
          onConnect={connect}
        />
      </div>

      <footer className="app__footer">
        <p>
          Built on{" "}
          <a
            href="https://developers.stellar.org/docs/smart-contracts"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            Soroban
          </a>{" "}
          · Stellar Testnet
        </p>
      </footer>
    </div>
  );
}
