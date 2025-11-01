/**
 * test/setup.ts — minimal Vitest setup
 * Node 20+ has native fetch support, no polyfill needed.
 */

// In Node 20+, fetch is available globally via the undici library
// If for some reason it's not available, we can dynamically import node-fetch
if (typeof globalThis.fetch === "undefined") {
  // Fallback for environments without native fetch
  import("node-fetch").then((nodeFetch) => {
    (globalThis as any).fetch = nodeFetch.default;
  });
}

export {};
