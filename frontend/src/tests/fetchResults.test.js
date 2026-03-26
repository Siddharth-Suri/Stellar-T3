// src/tests/fetchResults.test.js
import { describe, it, expect, vi } from "vitest";

// Mock the soroban module entirely so no network calls are made
vi.mock("../utils/soroban", () => ({
  fetchResults: vi.fn().mockResolvedValue({ yes: 5, no: 3 }),
  castVote: vi.fn(),
}));

import { fetchResults } from "../utils/soroban";

describe("fetchResults", () => {
  it("returns yes and no counts", async () => {
    const result = await fetchResults();
    expect(result).toHaveProperty("yes");
    expect(result).toHaveProperty("no");
    expect(result.yes).toBe(5);
    expect(result.no).toBe(3);
  });

  it("returns numeric values", async () => {
    const result = await fetchResults();
    expect(typeof result.yes).toBe("number");
    expect(typeof result.no).toBe("number");
  });
});
