import React from "react";
import type { ReviewResponse } from "@/types/review";
import { ReviewCard } from "./ReviewCard";
import { Star } from "lucide-react";

export function ReviewList({ 
  reviews, 
  loading 
}: { 
  reviews: ReviewResponse[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-28 w-full rounded-2xl bg-surfaceVariant" />
        <div className="h-28 w-full rounded-2xl bg-surfaceVariant" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-borderLight bg-surface px-4 py-12 text-center">
        <Star className="mx-auto mb-2 h-9 w-9 text-outlineVariant" />
        <p className="text-sm font-bold text-textPrimary">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <ReviewCard key={r.reviewId} review={r} />
      ))}
    </div>
  );
}
