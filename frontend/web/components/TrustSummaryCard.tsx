"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Ban, Lightbulb, Loader2 } from "lucide-react";

import TrustBadge from "@/components/TrustBadge";
import { useAuth } from "@/context/AuthContext";
import { trustLevelFor, TRUST_SCORE_MAX, TrustLevel } from "@/types/trust";
import { TiltCard } from "@/components/ui/TiltCard";

interface TrustSummaryCardProps {
  className?: string;
}

/** Tier boundaries, mirroring backend TrustLevelCalculator. */
const TIER_BOUNDARIES = [40, 60, 80, 120, 150];
/** Backend StudentRestrictionManager restricts accounts below this score. */
const RESTRICTION_THRESHOLD = 50;

const LEVEL_TIPS: Record<TrustLevel, string[]> = {
  ELITE: ["Keep up the on-time returns to stay at the top tier."],
  TRUSTED: [
    "Return items on or before the due date to keep climbing.",
    "Completed rentals with no issues earn bonus points.",
  ],
  STANDARD: [
    "Complete bookings and return items on time to build trust.",
    "Great reviews from owners and renters boost your score.",
  ],
  AT_RISK: [
    "Avoid cancelling bookings after they are approved.",
    "Return items on time — late returns cost trust points.",
  ],
  HIGH_RISK: [
    "Your score is close to the restriction threshold (50).",
    "Complete your current rentals without issues to recover.",
  ],
  SUSPENDED_RISK: [
    "Complete rentals responsibly to rebuild your standing.",
    "Contact support if you believe your score is incorrect.",
  ],
};

/**
 * Trust & reputation summary derived entirely from the signed-in user
 * (auth context) — score, tier progress, enforcement state, and tips.
 */
export default function TrustSummaryCard({
  className = "",
}: TrustSummaryCardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <TiltCard
        maxTilt={4}
        glare={true}
        className={`flex items-center justify-center rounded-2xl border border-borderLight bg-surface p-8 shadow-sm ${className}`}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </TiltCard>
    );
  }

  const trustScore = user?.studentProfile?.trustScore;
  if (trustScore == null) {
    return (
      <TiltCard
        maxTilt={4}
        glare={true}
        className={`rounded-2xl border border-borderLight bg-surface p-5 text-sm text-textTertiary shadow-sm ${className}`}
      >
        Trust information is unavailable.
      </TiltCard>
    );
  }

  const level = trustLevelFor(trustScore);
  const nextLevel = TIER_BOUNDARIES.find((b) => b > trustScore) ?? null;
  const pointsToNextLevel = nextLevel != null ? nextLevel - trustScore : null;
  const suspended = user?.status === "SUSPENDED";
  const restricted = !suspended && trustScore < RESTRICTION_THRESHOLD;
  const trustWarningActive = !suspended && !restricted && trustScore < 80;
  const recommendations = LEVEL_TIPS[level];

  const pct = Math.min(100, Math.round((trustScore / TRUST_SCORE_MAX) * 100));

  return (
    <TiltCard
      maxTilt={4}
      glare={true}
      className={`overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-borderLight bg-surfaceVariant/30 px-5 py-4">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-textPrimary">
          Trust &amp; Reputation
        </h2>
      </div>

      <div className="space-y-5 p-5">
        {/* Score + badge */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-extrabold text-textPrimary">
              {trustScore}
              <span className="text-base font-medium text-textTertiary">
                {" "}
                / {TRUST_SCORE_MAX}
              </span>
            </div>
            <div className="mt-1">
              <TrustBadge score={trustScore} level={level} />
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surfaceVariant">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pointsToNextLevel != null && nextLevel != null ? (
            <p className="mt-1.5 text-xs text-textTertiary">
              {pointsToNextLevel} more point{pointsToNextLevel === 1 ? "" : "s"}{" "}
              to reach the next tier ({nextLevel}).
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-textTertiary">
              You&apos;ve reached the highest trust tier. 🎉
            </p>
          )}
        </div>

        {/* Enforcement banners */}
        {suspended && (
          <Banner tone="error" icon={<Ban className="h-4 w-4" />}>
            Your account is suspended pending review.
          </Banner>
        )}
        {restricted && (
          <Banner tone="error" icon={<Ban className="h-4 w-4" />}>
            Your account is restricted — you cannot create new items or
            bookings until your score recovers.
          </Banner>
        )}
        {trustWarningActive && (
          <Banner tone="warning" icon={<AlertTriangle className="h-4 w-4" />}>
            Your trust score is below the community standard. Continued issues
            may lead to restrictions.
          </Banner>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-xl border border-borderLight bg-surfaceVariant/40 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-textSecondary">
              <Lightbulb className="h-3.5 w-3.5" /> Recommendations
            </div>
            <ul className="space-y-1 text-sm text-textSecondary">
              {recommendations.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TiltCard>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "error" | "warning";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-error/40 bg-errorLight text-error"
      : "border-warning/40 bg-warningLight text-warningDark";
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${cls}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
