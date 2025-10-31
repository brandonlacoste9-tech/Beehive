"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

type Ripple = { id: number; x: number; y: number };

export default function AuroraField() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [1, 0.8, 0.4]);

  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const move = (e: MouseEvent) =>
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [prefersReducedMotion]);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  useEffect(() => {
    if (prefersReducedMotion) return;

    let seq = 0;
    const onRipple = (e: Event) => {
      const evt = e as CustomEvent<{ x: number; y: number }>;
      const id = ++seq;
      setRipples((p) => [...p, { id, x: evt.detail.x, y: evt.detail.y }]);
      setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 650);
    };
    window.addEventListener("aurora:ripple", onRipple as EventListener);
    return () => window.removeEventListener("aurora:ripple", onRipple as EventListener);
  }, [prefersReducedMotion]);

  return (
    <motion.div 
      style={prefersReducedMotion ? {} : { y, opacity }} 
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" 
      aria-hidden="true"
    >
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="aurora" cx={`${mouse.x}%`} cy={`${mouse.y}%`} r="60%">
            <stop offset="0%" stopColor="#35E3FF" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#7C4DFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFD76A" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#aurora)" />
      </svg>

      {!prefersReducedMotion && ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0.4, opacity: 0.35 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          style={{
            position: "fixed",
            left: r.x - 150,
            top: r.y - 150,
            width: 300,
            height: 300,
            borderRadius: "9999px",
            background:
              "radial-gradient(closest-side, rgba(124,77,255,0.25), rgba(53,227,255,0.18), rgba(255,215,106,0))",
            filter: "blur(8px)",
          }}
        />
      ))}
    </motion.div>
  );
}
