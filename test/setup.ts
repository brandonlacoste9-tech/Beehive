/**
 * test/setup.ts — minimal Vitest setup
 * Provides a fetch polyfill for jsdom tests.
 */

// Modern Node.js (18+) has native fetch, so we don't need a polyfill
// Just ensure it's available in the test environment
if (typeof globalThis.fetch === "undefined") {
  // Node 18+ should have native fetch, but if not available,
  // the test environment (happy-dom/jsdom) should provide it
  console.warn("fetch is not available in test environment");
}

export {};
