import React from "react";
import { Star } from "lucide-react";
import type { ReviewSummary } from "@/types/review";

export function RatingBreakdown({ summary }: { summary: ReviewSummary }) {
  const total = summary.totalReviews;

  return (
    <div className="flex flex-col justify-center gap-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = Number(summary.distribution?.[star] ?? 0);
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="flex w-12 shrink-0 items-center justify-end gap-1 font-mono text-textSecondary">
              {star}
              <Star className="h-4 w-4 fill-warning text-warning" />
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surfaceVariant">
              <div
                className="h-full rounded-full bg-warning transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-textSecondary">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
