// src/App.jsx
import React, { useState, useEffect } from "react";
import { WalletBar } from "./components/WalletBar.jsx";
import { PollCard } from "./components/PollCard.jsx";
import { ActivityFeed } from "./components/ActivityFeed.jsx";
import { CountdownTimer } from "./components/CountdownTimer.jsx";
import { useWallet } from "./hooks/useWallet.js";
import { usePoll } from "./hooks/usePoll.js";

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("poll_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("poll_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const { publicKey, connecting, walletError, connect, disconnect, signTransaction } =
    useWallet();

  const {
    results,
    voters,
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
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="app__body">
        <div className="app__layout">
          <div className="app__main">
            <div className="poll-header">
              <h2>{import.meta.env.VITE_POLL_QUESTION || "Live Poll"}</h2>
              <CountdownTimer />
            </div>
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
          <aside className="app__sidebar">
            <ActivityFeed voters={voters} />
          </aside>
        </div>
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
