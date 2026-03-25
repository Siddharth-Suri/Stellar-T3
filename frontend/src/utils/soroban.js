// src/utils/soroban.js
// @stellar/stellar-sdk v13 — uses `rpc` namespace (not SorobanRpc)
import {
  rpc,
  TransactionBuilder,
  Account,
  Contract,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import {
  CONTRACT_ID,
  SOROBAN_RPC_URL,
  NETWORK_PASSPHRASE,
  ERROR_TYPES,
} from "../constants.js";

const server = new rpc.Server(SOROBAN_RPC_URL);

// Stellar Friendbot account — 56-char valid StrKey, always funded on testnet.
// Used ONLY as the transaction source for read-only simulation (never submitted).
// Note: the previous key was 55 chars and failed Account's StrKey validation.
const DUMMY_KEY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

function classifyError(err) {
  const msg = (err?.message || "").toLowerCase();
  const codes = JSON.stringify(err?.response?.data || "").toLowerCase();
  const code = err?.code;

  if (
    msg.includes("not found") ||
    msg.includes("install") ||
    msg.includes("extension")
  ) {
    return ERROR_TYPES.WALLET_NOT_FOUND;
  }
  if (
    msg.includes("reject") ||
    msg.includes("cancel") ||
    msg.includes("denied") ||
    msg.includes("closed the modal") ||
    msg.includes("user declined") ||
    code === -1
  ) {
    return ERROR_TYPES.USER_REJECTED;
  }
  if (
    codes.includes("op_insufficient_balance") ||
    codes.includes("insufficient_balance") ||
    msg.includes("insufficient")
  ) {
    return ERROR_TYPES.INSUFFICIENT_BALANCE;
  }
  return ERROR_TYPES.UNKNOWN;
}

export async function fetchResults() {
  // Silently return zeros when no contract is configured
  if (!CONTRACT_ID) return { yes: 0, no: 0 };

  const contract = new Contract(CONTRACT_ID);
  const dummyAccount = new Account(DUMMY_KEY, "0");

  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_results"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error("Simulation failed: " + sim.error);
  }

  const retval = sim.result?.retval;
  if (!retval) throw new Error("No return value from simulation.");

  const native = scValToNative(retval);
  // Contract returns (u32, u32) — may be BigInt in v13
  return {
    yes: Number(native[0]),
    no: Number(native[1]),
  };
}

export async function castVote(option, publicKey, signTransaction) {
  if (!CONTRACT_ID) throw new Error("Contract ID not set. Add VITE_CONTRACT_ID to .env");
  const contract = new Contract(CONTRACT_ID);

  try {
    // 1. Load voter's account from RPC
    const account = await server.getAccount(publicKey);

    // 2. Build the transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("vote", nativeToScVal(option, { type: "symbol" }))
      )
      .setTimeout(30)
      .build();

    // 3. Simulate to get auth + footprint (required by Soroban)
    const simResult = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      const simErr = new Error("Simulation error: " + simResult.error);
      simErr.response = { data: simResult.error };
      throw simErr;
    }

    // 4. Assemble authorised tx and export XDR
    const assembled = rpc.assembleTransaction(tx, simResult).build().toXDR();

    // 5. Sign via the wallet
    const signed = await signTransaction(assembled, {
      address: publicKey,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // 6. Send signed XDR directly to RPC — avoids TransactionBuilder.fromXDR()
    //    which throws "Bad union switch: 4" on Soroban auth entries in sdk v13.
    const signedXdr = signed.signedTxXdr ?? signed;
    const rpcResponse = await fetch(SOROBAN_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "sendTransaction",
        params: { transaction: signedXdr },
      }),
    });
    const rpcJson = await rpcResponse.json();
    if (rpcJson.error) {
      const e = new Error(rpcJson.error.message || "RPC sendTransaction error");
      e.response = { data: rpcJson.error };
      throw e;
    }
    const sendResult = rpcJson.result;

    if (sendResult.status === "ERROR") {
      const e = new Error("Transaction error");
      e.response = { data: sendResult.errorResult };
      throw e;
    }

    // 7. Poll every 2 s until confirmed (up to 60 s)
    //    Uses raw JSON-RPC to avoid SDK parsing the result XDR (same union bug).
    const hash = sendResult.hash;
    let status = "NOT_FOUND";
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollResp = await fetch(SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "getTransaction",
          params: { hash },
        }),
      });
      const pollJson = await pollResp.json();
      status = pollJson?.result?.status || "NOT_FOUND";
      if (status !== "NOT_FOUND") break;
    }

    // Explicit FAILED = tx was included but execution was rejected
    if (status === "FAILED") {
      throw new Error("Transaction was rejected by the network.");
    }

    // SUCCESS or still NOT_FOUND (pending / slow testnet indexing):
    // the tx reached the mempool — return the hash so the user gets the explorer link.
    return { hash };
  } catch (err) {
    console.error("[castVote] raw error:", err, "| message:", err?.message, "| type:", err?.type);
    const errType = classifyError(err);
    const error = new Error(err.message);
    error.type = err.type ?? errType; // preserve type if already set
    throw error;
  }
}
