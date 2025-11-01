/**
 * test/setup.ts — minimal Vitest setup
 * Provides a fetch polyfill for jsdom tests.
 * Node 20+ has native fetch support, so no external polyfill needed.
 */

// Node 20+ has native fetch, just ensure it's available globally
if (typeof globalThis.fetch === "undefined") {
  // This should not happen in Node 20+, but as a fallback we can use node-fetch
  // which is already in dependencies
  const nodeFetch = require("node-fetch");
  (globalThis as any).fetch = nodeFetch;
}

export {};
