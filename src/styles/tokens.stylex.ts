import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  // Base navy backgrounds
  bgDeep: "#0a0e17",
  bgSurface: "#111827",
  bgPanel: "#1a2332",
  bgHover: "#1f2d3f",

  // Borders
  border: "#2a3a4e",
  borderFocus: "#3b82f6",

  // Text
  textPrimary: "#e0e6ed",
  textSecondary: "#8899aa",
  textMuted: "#5a6a7a",

  // Status colors
  statusNominal: "#22c55e",
  statusWarning: "#f59e0b",
  statusCritical: "#ef4444",
  statusOffline: "#6b7280",

  // Accent — teal/cyan for maritime
  accentPrimary: "#06b6d4",
  accentSecondary: "#0891b2",

  // Vessel type colors
  vesselLightfish: "#06b6d4",
  vesselQuickfish: "#f59e0b",
});

export const spacing = stylex.defineVars({
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
});

export const radii = stylex.defineVars({
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
});

export const fontSizes = stylex.defineVars({
  xs: "11px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
});
