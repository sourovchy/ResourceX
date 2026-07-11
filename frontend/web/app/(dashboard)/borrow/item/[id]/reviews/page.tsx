"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ArrowLeft } from "lucide-react";
import { reviewService } from "@/lib/services/reviewService";
import { Card } from "@/components/ui/Card";
import type { ReviewResponse, ReviewSummary } from "@/types/review";
import { RatingBreakdown } from "@/components/review/RatingBreakdown";
import { ReviewList } from "@/components/review/ReviewList";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { TiltCard } from "@/components/ui/TiltCard";

const PAGE_SIZE = 10;

export default function ItemReviewsPage() {
  const { id } = useParams() as { id: string };
  const itemId = Number(id);
  const router = useRouter();

  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      const data = await reviewService.getItemReviewSummary(itemId);
      setSummary(data);
    } catch {
      setSummary({ averageRating: 0, totalReviews: 0, distribution: {} });
    } finally {
      setSummaryLoading(false);
    }
  }, [itemId]);

  const loadReviews = useCallback(async (page: number) => {
    setListLoading(true);
    try {
      const data = await reviewService.getItemReviews(itemId, page, PAGE_SIZE);
      setReviews(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setReviews([]);
      setTotalPages(0);
    } finally {
      setListLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadSummary();
    loadReviews(0);
  }, [loadSummary, loadReviews]);

  const handlePageChange = (next: number) => {
    setPageIndex(next);
    loadReviews(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 w-full">
      <div>
        <button
          onClick={() => router.push(`/borrow/item/${itemId}`)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Item
        </button>
        <h1 className="text-3xl font-bold italic text-textPrimary flex items-center gap-3">
          <Star className="h-8 w-8 fill-warning text-warning" />
          All Reviews
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr] lg:gap-12 items-start w-full">
        {/* Left column: Summary sticky sidebar */}
        <TiltCard maxTilt={1} className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm md:sticky md:top-24 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
          {summaryLoading || !summary ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="h-12 w-20 bg-surfaceVariant rounded-lg mb-2" />
                <div className="h-4 w-32 bg-surfaceVariant rounded-full" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-3 w-full bg-surfaceVariant rounded-full" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center gap-1 mb-8 border-b border-borderLight pb-6">
                <span className="text-6xl font-extrabold tracking-tight text-textPrimary">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="mt-1 text-sm font-bold text-textSecondary uppercase tracking-wider">
                  {summary.totalReviews} Review{summary.totalReviews === 1 ? "" : "s"}
                </span>
              </div>
              <RatingBreakdown summary={summary} />
            </>
          )}
        </TiltCard>

        {/* Right column: Reviews List */}
        <div className="space-y-4">
          <ReviewList reviews={reviews} loading={listLoading} />
          
          {totalPages > 1 && (
            <Card padding="none" className="mt-6">
              <Pagination
                pageIndex={pageIndex}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
