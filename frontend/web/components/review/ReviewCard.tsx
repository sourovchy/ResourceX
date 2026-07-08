import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { formatShortDate } from "@/lib/dateUtils";
import Avatar from "@/components/ui/Avatar";
import type { ReviewResponse } from "@/types/review";
import { StarRow } from "./StarRow";

import { TiltCard } from "@/components/ui/TiltCard";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function ReviewCard({ review }: { review: ReviewResponse }) {
  const name = review.reviewer?.name ?? "Borrower";

  return (
    <TiltCard
      maxTilt={2}
      glare={true}
      className="group overflow-hidden rounded-2xl border border-borderLight bg-surface p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg sm:p-5"
    >
      <div className="flex items-start gap-3 relative z-10">
        <Avatar src={review.reviewer?.avatarUrl} name={name} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-textPrimary">{name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-successLight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-successDark">
                <ShieldCheck className="h-3 w-3" />
                Verified Borrower
              </span>
            </div>
            <time className="font-mono text-xs text-textSecondary">
              {formatShortDate(review.createdAt)}
            </time>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <StarRow value={review.rating} />
            <span className="text-[11px] font-bold uppercase tracking-wide text-textSecondary">
              {RATING_LABELS[review.rating] ?? ""}
            </span>
          </div>

          {review.comment && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-textSecondary">
              {review.comment}
            </p>
          )}

          <p className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Booking completed
          </p>
        </div>
      </div>
    </TiltCard>
  );
}
