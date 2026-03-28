// src/hooks/usePoll.js
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchResults, castVote, fetchVoters } from "../utils/soroban.js";
import {
  TX_STATUS,
  ERROR_MESSAGES,
  POLL_OPTIONS,
} from "../constants.js";

export function usePoll(publicKey, signTransaction) {
  const CACHE_KEY = "poll_results";

  // Seed state from cache immediately (avoids a flash of 0/0)
  const [results, setResults] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : { yes: 0, no: 0 };
    } catch {
      return { yes: 0, no: 0 };
    }
  });
  
  const [voters, setVoters] = useState(() => {
    try {
      const cached = localStorage.getItem("poll_voters");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  // If we already have cached data, don't show the skeleton on first paint
  const [loadingResults, setLoadingResults] = useState(() => {
    try {
      return !localStorage.getItem("poll_results");
    } catch {
      return true;
    }
  });
  const [txStatus, setTxStatus] = useState(TX_STATUS.IDLE);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const intervalRef = useRef(null);

  const loadResults = useCallback(async () => {
    try {
      const [data, votersData] = await Promise.all([
        fetchResults(),
        fetchVoters(),
      ]);
      setResults(data);
      setVoters(votersData);
      // Persist fresh data to localStorage cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem("poll_voters", JSON.stringify(votersData));
      } catch { /* storage quota exceeded — ignore */ }
    } catch (err) {
      console.warn("Failed to fetch results:", err.message);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    loadResults();
    intervalRef.current = setInterval(loadResults, 5000);
    return () => clearInterval(intervalRef.current);
  }, [loadResults]);

  const vote = useCallback(
    async (option) => {
      if (!publicKey || !signTransaction) return;
      setTxStatus(TX_STATUS.PENDING);
      setTxHash(null);
      setTxError(null);

      try {
        const { hash } = await castVote(option, publicKey, signTransaction);
        setTxStatus(TX_STATUS.SUCCESS);
        setTxHash(hash);
        setHasVoted(true);
        // Refresh immediately after successful vote
        await loadResults();
      } catch (err) {
        setTxStatus(TX_STATUS.FAIL);
        const msg =
          err.type && ERROR_MESSAGES[err.type]
            ? ERROR_MESSAGES[err.type]
            : err.message || ERROR_MESSAGES.UNKNOWN;
        setTxError(msg);
      }
    },
    [publicKey, signTransaction, loadResults]
  );

  const resetTx = useCallback(() => {
    setTxStatus(TX_STATUS.IDLE);
    setTxHash(null);
    setTxError(null);
  }, []);

  return {
    results,
    voters,
    loadingResults,
    txStatus,
    txHash,
    txError,
    hasVoted,
    vote,
    resetTx,
  };
}
