// src/tests/PollCard.test.jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollCard } from "../components/PollCard";

describe("PollCard", () => {
  it("disables vote buttons when wallet not connected", () => {
    render(
      <PollCard
        publicKey={null}
        results={{ yes: 0, no: 0 }}
        loadingResults={false}
        txStatus={null}
        txHash={null}
        txError={null}
        hasVoted={false}
        onVote={() => {}}
        onResetTx={() => {}}
        onConnect={() => {}}
      />
    );

    // When publicKey is null the gate renders a Connect Wallet button, not vote buttons
    const connectBtn = screen.getByRole("button", { name: /connect wallet/i });
    expect(connectBtn).toBeInTheDocument();

    // Vote buttons should NOT be present when the wallet is disconnected
    expect(screen.queryByRole("button", { name: /yes/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /no/i })).toBeNull();
  });

  it("shows vote buttons when wallet is connected and not yet voted", () => {
    render(
      <PollCard
        publicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
        results={{ yes: 2, no: 1 }}
        loadingResults={false}
        txStatus={null}
        txHash={null}
        txError={null}
        hasVoted={false}
        onVote={() => {}}
        onResetTx={() => {}}
        onConnect={() => {}}
      />
    );

    const yesBtn = screen.getByRole("button", { name: /yes/i });
    const noBtn = screen.getByRole("button", { name: /no/i });
    expect(yesBtn).toBeEnabled();
    expect(noBtn).toBeEnabled();
  });
});
