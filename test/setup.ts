/**
 * test/setup.ts — minimal Vitest setup
 * Provides a fetch polyfill for jsdom tests.
 */
import fetch from "cross-fetch";

if (typeof (globalThis as any).fetch === "undefined") {
  (globalThis as any).fetch = fetch;
}

export {};
