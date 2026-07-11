"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import Avatar from "@/components/ui/Avatar";
import api from "@/lib/api";
import type { ItemResponse } from "@/types/item";
import {
  CheckCircle2,
  AlertTriangle,
  Heart,
  Loader2,
  Link2,
  MessageSquare,
  Star,
  Tag,
  ArrowLeft,
  Globe,
  MapPin,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import MessageModal from "@/components/misc/MessageModal";
import ReportModal from "@/components/misc/ReportModal";
import TrustBadge from "@/components/TrustBadge";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";
import { reviewService } from "@/lib/services/reviewService";
import type { ReviewSummary, ReviewResponse } from "@/types/review";
import { ReviewSummary as ReviewSummaryComponent } from "@/components/review/ReviewSummary";
import { ReviewCard } from "@/components/review/ReviewCard";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { TiltCard } from "@/components/ui/TiltCard";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [ownerSummary, setOwnerSummary] = useState<ReviewSummary | null>(null);
  const [itemSummary, setItemSummary] = useState<ReviewSummary | null>(null);
  const [latestReviews, setLatestReviews] = useState<ReviewResponse[]>([]);

  // Fetch item details
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .get<ItemResponse>(`/items/${params.id}`)
      .then((res) => {
        if (!active) return;
        setItem(res.data);
        setSelectedImage(0);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load item.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  // Fetch the owner's overall rating snapshot for the owner card
  useEffect(() => {
    const ownerId = item?.owner?.userId;
    if (ownerId == null) return;
    let active = true;
    reviewService
      .getOwnerReviewSummary(ownerId)
      .then((res) => {
        if (active) setOwnerSummary(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [item?.owner?.userId]);

  // Fetch the item's review summary and latest reviews
  useEffect(() => {
    if (!item?.itemId) return;
    let active = true;
    Promise.all([
      reviewService.getItemReviewSummary(item.itemId),
      reviewService.getItemReviews(item.itemId, 0, 2),
    ])
      .then(([summary, reviewsData]) => {
        if (active) {
          setItemSummary(summary);
          setLatestReviews(reviewsData.content ?? []);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [item?.itemId]);

  // Fetch wishlist state once item is loaded
  useEffect(() => {
    if (!item) return;
    api
      .get<{ wishlistId: number; item: { itemId: number } }[]>("/wishlist")
      .then((res) => {
        setIsWishlisted(
          res.data?.some((w) => w.item.itemId === item.itemId) ?? false,
        );
      })
      .catch(() => {});
  }, [item]);

  const toggleWishlist = async () => {
    if (!item || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${item.itemId}`);
        setIsWishlisted(false);
        toast("Removed from wishlist.");
      } else {
        await api.post(`/wishlist/${item.itemId}`);
        setIsWishlisted(true);
        toast("Added to wishlist!");
      }
    } catch {
      toast("Could not update wishlist.", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast("Link copied to clipboard!"),
      () => toast("Could not copy link.", "error"),
    );
  };

  const ownerTrust = useMemo(
    () => item?.owner?.studentProfile?.trustScore ?? null,
    [item],
  );
  const isOwnerVerified = item?.owner?.studentProfile?.emailVerified ?? false;

  // Don't let the owner see their own item's borrow CTA
  const isOwnItem = user?.userId != null && item?.owner?.userId === user.userId;

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return <PageLoader message="Fetching item details..." />;
  }

  if (error || !item) {
    return (
      <PageError
        message={error ?? "Item not found"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const images = item.imageUrls?.length > 0 ? item.imageUrls : [];
  const mainImage = images[selectedImage] ?? null;
  const isAvailable = item.status === "AVAILABLE";

  // ── Main ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
        <Link
          href="/borrow"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-textSecondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Images */}
          <Reveal from="left" className="space-y-3">
            <TiltCard
              maxTilt={1}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-borderLight bg-surfaceVariant shadow-sm"
            >
              {mainImage ? (
                <SafeImage
                  key={mainImage}
                  src={mainImage}
                  alt={item.title}
                  fill
                  className="object-cover animate-in fade-in duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Tag className="h-12 w-12 text-outlineVariant" />
                </div>
              )}

              {/* Wishlist button */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading || isOwnItem}
                className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur-sm transition-all ${
                  isWishlisted
                    ? "bg-errorLight text-error"
                    : "bg-surface/80 text-textSecondary hover:bg-errorLight hover:text-error"
                } disabled:hidden`}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Save to wishlist"
                }
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-error" : ""}`}
                />
              </button>

              {/* Status badge */}
              {!isAvailable && (
                <div className="absolute left-3 top-3 z-10 backdrop-blur-sm">
                  <StatusBadge status={item.status} />
                </div>
              )}
            </TiltCard>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20 ${
                      i === selectedImage
                        ? "scale-105 border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === selectedImage}
                  >
                    <SafeImage
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {/* Details */}
          <Reveal from="right" delay={90} className="space-y-5">
            {/* Category + condition chips */}
            <div className="flex flex-wrap items-center gap-2">
              {item.category && (
                <span className="rounded-full bg-primaryLight border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {item.category}
                </span>
              )}
              {item.itemCondition && (
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  ["excellent", "like new"].includes(item.itemCondition.toLowerCase())
                    ? "bg-successLight text-successDark border-success/20"
                    : item.itemCondition.toLowerCase() === "good"
                    ? "bg-warningLight text-warningDark border-warning/20"
                    : "bg-errorLight text-errorDark border-error/20"
                }`}>
                  {item.itemCondition}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl italic">
                {item.title}
              </h1>
              {itemSummary && itemSummary.totalReviews > 0 && (
                <div className="w-fit">
                  <ReviewSummaryComponent summary={itemSummary} href="#item-reviews" />
                </div>
              )}
            </div>

            {/* Pricing card */}
            <TiltCard
              maxTilt={1}
              className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderLight pb-4">
                <div>
                  <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-textSecondary">
                    Rental Price
                  </p>
                  <p className="text-2xl font-extrabold text-primary sm:text-3xl tracking-tight">
                    ৳&thinsp;
                    {Number.isInteger(Number(item.dailyRate)) ? (
                      <CountUp value={Number(item.dailyRate)} />
                    ) : (
                      Number(item.dailyRate).toLocaleString()
                    )}
                    <span className="text-sm font-medium text-textSecondary">
                      {" "}
                      / day
                    </span>
                  </p>
                </div>
                {item.availabilityScope && (
                  <div className="flex flex-col sm:items-end">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-textSecondary">
                      Availability
                    </p>
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      item.availabilityScope === "CAMPUS_AND_OUTSIDE"
                        ? "bg-indigo-50/50 border-indigo-200/50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400"
                        : "bg-amber-50/50 border-amber-200/50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
                    }`}>
                      {item.availabilityScope === "CAMPUS_AND_OUTSIDE" ? (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          On/Off Campus
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          Campus Only
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isOwnItem ? (
                <div className="rounded-xl bg-surfaceVariant px-4 py-3 text-center text-sm font-bold text-textSecondary">
                  This is your listing
                </div>
              ) : isAvailable ? (
                <Link
                  href={`/borrow/book/${item.itemId}`}
                  className="block w-full text-center rounded-full font-bold italic transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-primary/40 shadow-sm px-6 py-3.5 text-sm gap-2"
                >
                  Book This Item
                </Link>
              ) : (
                <div className="rounded-xl bg-outlineVariant/20 px-4 py-3 text-center text-sm font-bold text-textSecondary">
                  Currently unavailable
                </div>
              )}

              <Button
                onClick={copyShareLink}
                variant="subtle"
                fullWidth
                leftIcon={<Link2 className="h-4 w-4" />}
              >
                Copy Link
              </Button>

              <div className="flex items-start gap-2 rounded-xl bg-warningLight/50 p-3 text-xs font-medium text-warningDark">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>
                  Inspect the item carefully on pickup and return it in the same
                  condition.
                </span>
              </div>
            </TiltCard>

            {/* Owner card */}
            {!isOwnItem && (
              <div className="space-y-2">
                <TiltCard
                  maxTilt={1}
                  className="rounded-xl border border-borderLight bg-surface p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3">
                    {/* Name + avatar */}
                    <Link
                      href={`/profile/${item.owner?.userId}`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      <Avatar src={item.owner?.avatarUrl} name={item.owner?.name} size={44} textClass="text-base" className="transition-opacity group-hover:opacity-80" />
                      <div className="flex min-w-0 items-center gap-1.5 font-bold text-textPrimary group-hover:text-primary transition-colors">
                        <span className="truncate">
                          {item.owner?.name ?? "Unknown"}
                        </span>
                        {isOwnerVerified && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        )}
                      </div>
                    </Link>

                    {/* Trust score */}
                    {ownerTrust != null && (
                      <TrustBadge score={ownerTrust} className="self-start" />
                    )}

                    {/* Review */}
                    {ownerSummary && ownerSummary.totalReviews > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-textSecondary">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="font-bold text-textPrimary">
                          {ownerSummary.averageRating.toFixed(1)}
                        </span>
                        <span>
                          ({ownerSummary.totalReviews} review
                          {ownerSummary.totalReviews === 1 ? "" : "s"})
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-textTertiary italic">
                        No reviews yet
                      </div>
                    )}

                    {/* Message owner */}
                    {item.owner?.userId && (
                      <Button
                        onClick={() => setMessageOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        leftIcon={<MessageSquare className="h-4 w-4" />}
                      >
                        Message Owner
                      </Button>
                    )}
                  </div>
                </TiltCard>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="space-y-2">
                <p className="whitespace-pre-line text-sm leading-relaxed text-textSecondary">
                  {item.description}
                </p>
              </div>
            )}


            {/* Message owner */}
            {!isOwnItem && item.owner?.userId && (
              <div className="pt-2 space-y-2">
                <Button
                  onClick={() => setReportOpen(true)}
                  variant="danger"
                  fullWidth
                  className="mt-2"
                  leftIcon={<AlertTriangle className="h-4 w-4" />}
                >
                  Report Listing
                </Button>
              </div>
            )}
          </Reveal>
        </div>

        {/* Reviews & Ratings */}
        <Reveal className="border-t border-borderLight pt-6" id="item-reviews">
          <TiltCard
            maxTilt={1}
            className="rounded-2xl border border-borderLight bg-surface shadow-sm overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-borderLight flex items-center justify-between">
              <h2 className="text-xl font-bold italic text-textPrimary flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning text-warning" />
                Reviews &amp; Ratings
              </h2>
              <Link
                href={`/borrow/item/${item.itemId}/reviews`}
                className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-1"
              >
                View All <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            
            <div className="p-5 sm:p-6 space-y-6">
              {itemSummary && itemSummary.totalReviews > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-extrabold text-textPrimary">
                      {itemSummary.averageRating.toFixed(1)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-textSecondary uppercase tracking-wider">
                        {itemSummary.totalReviews} Review{itemSummary.totalReviews === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {latestReviews.map((r) => (
                      <ReviewCard key={r.reviewId} review={r} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-textSecondary italic py-4 text-center">No reviews yet.</p>
              )}
            </div>
          </TiltCard>
        </Reveal>
      </div>

      {!isOwnItem && item.owner?.userId && (
        <MessageModal
          isOpen={messageOpen}
          targetUserId={item.owner.userId}
          targetName={item.owner.name ?? "Owner"}
          onClose={() => setMessageOpen(false)}
        />
      )}

      <ReportModal
        isOpen={reportOpen}
        entityType="ITEM"
        entityId={item.itemId}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
