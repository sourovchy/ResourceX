export type TrustLevel =
  | "ELITE"
  | "TRUSTED"
  | "STANDARD"
  | "AT_RISK"
  | "HIGH_RISK"
  | "SUSPENDED_RISK";

export interface TrustSummaryResponse {
  userId: number;
  trustScore: number;
  trustLevel: TrustLevel;
  badgeLabel: string;
  nextLevel?: number | null;
  pointsToNextLevel?: number | null;
  trustWarningActive: boolean;
  restricted: boolean;
  suspended: boolean;
  suspensionEndsAt?: string | null;
  suspensionCount?: number;
  recommendations: string[];
}

export const TRUST_SCORE_MIN = 0;
export const TRUST_SCORE_MAX = 200;

/** Mirrors backend TrustLevelCalculator. */
export function trustLevelFor(score: number): TrustLevel {
  if (score >= 150) return "ELITE";
  if (score >= 120) return "TRUSTED";
  if (score >= 80) return "STANDARD";
  if (score >= 60) return "AT_RISK";
  if (score >= 40) return "HIGH_RISK";
  return "SUSPENDED_RISK";
}

export const TRUST_LEVEL_LABEL: Record<TrustLevel, string> = {
  ELITE: "Elite",
  TRUSTED: "Trusted",
  STANDARD: "Standard",
  AT_RISK: "At-Risk",
  HIGH_RISK: "High Risk",
  SUSPENDED_RISK: "Restricted",
};

export function trustColor(score: number | null): string {
  if (score == null) return "bg-outlineVariant text-textSecondary";
  const level = trustLevelFor(score);
  switch (level) {
    case "ELITE":
      return "bg-dashboardBlueTint text-dashboardBlue";
    case "TRUSTED":
      return "bg-successLight text-successDark";
    case "STANDARD":
      return "bg-primaryLight text-primaryDark";
    case "AT_RISK":
      return "bg-warningLight text-warningDark";
    case "HIGH_RISK":
      return "bg-errorLight/60 text-errorDark";
    case "SUSPENDED_RISK":
      return "bg-errorLight text-error";
    default:
      return "bg-outlineVariant text-textSecondary";
  }
}
