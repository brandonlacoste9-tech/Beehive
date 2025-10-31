/**
 * Theme Configuration
 * Centralized theme settings for the Beehive platform
 */

export const THEME_COLORS = {
  // Primary palette
  primary: "#3b82f6", // blue-500
  secondary: "#10b981", // emerald-500
  accent: "#f59e0b", // amber-500

  // Background & surfaces
  background: "#ffffff",
  surface: "#f9fafb",
  border: "#e5e7eb",

  // Text colors
  text: "#111827",
  textMuted: "#6b7280",
  textInverse: "#ffffff",

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Dark mode variants
  dark: {
    background: "#111827",
    surface: "#1f2937",
    border: "#374151",
    text: "#f3f4f6",
    textMuted: "#9ca3af",
  },
};

export const THEME_SPACING = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
};

export const THEME_BREAKPOINTS = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export const THEME_TYPOGRAPHY = {
  fontFamily: {
    sans: '"Inter", "Helvetica Neue", sans-serif',
    mono: '"Fira Code", monospace',
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  mode: ThemeMode;
  colors: typeof THEME_COLORS;
  spacing: typeof THEME_SPACING;
  breakpoints: typeof THEME_BREAKPOINTS;
  typography: typeof THEME_TYPOGRAPHY;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: "system",
  colors: THEME_COLORS,
  spacing: THEME_SPACING,
  breakpoints: THEME_BREAKPOINTS,
  typography: THEME_TYPOGRAPHY,
};

/**
 * Get theme colors based on current mode
 */
export function getThemeColors(mode: ThemeMode = "light") {
  if (mode === "dark") {
    return {
      ...THEME_COLORS,
      background: THEME_COLORS.dark.background,
      surface: THEME_COLORS.dark.surface,
      border: THEME_COLORS.dark.border,
      text: THEME_COLORS.dark.text,
      textMuted: THEME_COLORS.dark.textMuted,
    };
  }
  return THEME_COLORS;
}

/**
 * Get CSS variables for theme
 */
export function getThemeVariables(mode: ThemeMode = "light") {
  const colors = getThemeColors(mode);
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-accent": colors.accent,
    "--color-background": colors.background,
    "--color-surface": colors.surface,
    "--color-border": colors.border,
    "--color-text": colors.text,
    "--color-text-muted": colors.textMuted,
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-error": colors.error,
    "--color-info": colors.info,
  };
}
