/**
 * Frontend-side scoring utilities — display helpers only.
 * The actual scoring calculations (calcGrowthScore, etc.) live in the backend.
 */

/** Score to color class — used by UI components to colorise score values */
export function scoreToColor(score: number): "green" | "yellow" | "red" {
  if (score >= 7) return "green";
  if (score >= 4) return "yellow";
  return "red";
}

/** Format large numbers for display — used by ExportButton and card components */
export function formatCurrency(value: number | null): string {
  if (value === null) return "N/A";
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}
