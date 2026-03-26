// src/tests/cache.test.js
import { describe, it, expect, beforeEach } from "vitest";

describe("localStorage cache", () => {
  beforeEach(() => localStorage.clear());

  it("saves and retrieves poll results", () => {
    const data = { yes: 10, no: 4 };
    localStorage.setItem("poll_results", JSON.stringify(data));
    const loaded = JSON.parse(localStorage.getItem("poll_results"));
    expect(loaded.yes).toBe(10);
    expect(loaded.no).toBe(4);
  });

  it("returns null when no cache exists", () => {
    expect(localStorage.getItem("poll_results")).toBeNull();
  });

  it("overwrites stale cache with fresh data", () => {
    localStorage.setItem("poll_results", JSON.stringify({ yes: 1, no: 0 }));
    const fresh = { yes: 7, no: 3 };
    localStorage.setItem("poll_results", JSON.stringify(fresh));
    const loaded = JSON.parse(localStorage.getItem("poll_results"));
    expect(loaded.yes).toBe(7);
    expect(loaded.no).toBe(3);
  });
});
