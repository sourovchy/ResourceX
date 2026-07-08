import React from "react";
import { StarRow } from "./StarRow";
import type { ReviewSummary as ReviewSummaryType } from "@/types/review";
import Link from "next/link";

export function ReviewSummary({ 
  summary, 
  href 
}: { 
  summary: ReviewSummaryType;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <StarRow value={summary.averageRating} size="h-4 w-4" />
        <span className="text-sm font-bold text-textPrimary">
          {summary.averageRating.toFixed(1)}
        </span>
      </div>
      <span className="text-xs font-medium text-textSecondary">
        {summary.totalReviews} Review{summary.totalReviews === 1 ? "" : "s"}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block rounded-lg p-2 transition-colors hover:bg-surfaceVariant">
        {content}
      </Link>
    );
  }

  return content;
}
