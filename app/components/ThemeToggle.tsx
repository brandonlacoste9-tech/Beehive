"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "system";
    setTheme(saved);
    apply(saved);
  }, []);

  function apply(next: string) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const wantsDark = next === "dark" || (next === "system" && prefersDark);
    root.classList.toggle("dark", wantsDark);
  }

  function onChange(next: string) {
    localStorage.setItem("theme", next);
    setTheme(next);
    apply(next);
  }

  return (
    <div 
      className="inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 text-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
      role="group" 
      aria-label="Theme"
    >
      <label className="sr-only" htmlFor="theme-select">Theme</label>
      <select 
        id="theme-select" 
        className="bg-transparent outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
        value={theme} 
        onChange={(e) => onChange(e.target.value)} 
        aria-label="Select theme"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
