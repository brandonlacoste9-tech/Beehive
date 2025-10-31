export type RippleDetail = { x: number; y: number };

export function emitAuroraRipple(x: number, y: number) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) return;
  window.dispatchEvent(new CustomEvent<RippleDetail>("aurora:ripple", { detail: { x, y } }));
}
