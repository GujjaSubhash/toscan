export const RISK = {
  safe: "#22C55E",
  moderate: "#F59E0B",
  high: "#EF4444",
} as const;

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function riskColor(score: number | null): string {
  if (score == null) return "#71717A";
  if (score <= 2) return RISK.safe;
  if (score === 3) return RISK.moderate;
  return RISK.high;
}

export function riskLabel(score: number | null): string {
  if (score == null) return "Unknown";
  if (score <= 2) return "Safe";
  if (score === 3) return "Moderate";
  return "High";
}

export function riskTint(score: number | null, alpha = 0.15): string {
  return hexToRgba(riskColor(score), alpha);
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Data Collection": "#6366F1",
  "Data Sharing": "#8B5CF6",
  "User Rights": "#22C55E",
  Liability: "#F59E0B",
  Termination: "#EF4444",
  Arbitration: "#EC4899",
  "Content Ownership": "#06B6D4",
  Payment: "#14B8A6",
  Other: "#71717A",
};

export function categoryColor(category: string | null): string {
  if (!category) return "#71717A";
  return CATEGORY_COLORS[category] ?? "#71717A";
}

export function documentTitle(sourceUrl: string | null): string {
  if (!sourceUrl) return "Pasted Document";
  if (sourceUrl.startsWith("demo:")) {
    const slug = sourceUrl.slice(5);
    return `${slug.charAt(0).toUpperCase()}${slug.slice(1)} Terms of Service`;
  }
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}
