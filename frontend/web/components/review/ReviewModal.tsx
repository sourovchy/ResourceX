import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, MessageSquare, Info, X, Loader2 } from "lucide-react";
import { reviewService } from "@/lib/services/reviewService";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { useDialog } from "@/hooks/useDialog";
import { TiltCard } from "@/components/ui/TiltCard";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  itemTitle: string;
  itemImageUrl: string | null;
  onSuccess: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  itemTitle,
  itemImageUrl,
  onSuccess,
}: ReviewModalProps) {
  const { toast } = useToast();
  const dialogRef = useDialog({ open: isOpen, onClose, closeOnEsc: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetState = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSubmitError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (rating === 0) {
      setSubmitError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview({
        bookingId,
        rating,
        comment: comment.trim(),
      });
      toast("Review submitted. Thank you!");
      onSuccess();
      handleClose();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <TiltCard
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-label="Review your rental"
        tabIndex={-1}
        maxTilt={2}
        hoverScale={1.01}
        glare={false}
        className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-borderLight/60 bg-surface/90 shadow-2xl backdrop-blur-md outline-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 sm:slide-in-from-bottom-0 duration-200"
      >
        <div className="flex items-center justify-between border-b border-borderLight px-6 py-4">
          <h3 className="text-lg font-bold text-textPrimary">
            Review your rental
          </h3>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-2 text-textSecondary transition-colors hover:bg-surfaceVariant hover:text-textPrimary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-surfaceVariant p-5 sm:p-6 flex items-center gap-4 border-b border-borderLight">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
            <SafeImage
              src={itemImageUrl ?? undefined}
              alt={itemTitle}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-textPrimary line-clamp-2">{itemTitle}</p>
            <p className="text-xs text-textSecondary mt-1">Please be honest and respectful.</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="flex items-start gap-2 rounded-xl border border-error bg-errorLight/30 p-3 text-sm text-errorDark">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Star selector */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                Your Rating
              </span>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
                role="radiogroup"
                aria-label="Star rating"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-warning text-warning"
                          : "text-outlineVariant"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="h-5 text-sm font-bold uppercase tracking-wider text-textSecondary">
                {RATING_LABELS[hoverRating || rating] ?? ""}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label
                htmlFor="item-review-comment"
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comment
              </label>
              <textarea
                id="item-review-comment"
                rows={5}
                maxLength={1000}
                placeholder="Share details about the item's condition or the owner's communication…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none rounded-xl border border-borderLight bg-card px-4 py-3 text-sm text-textPrimary placeholder-textSecondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-right font-mono text-xs text-textSecondary">
                {comment.length}/1000
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="subtle"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || !comment.trim() || submitting}
                loading={submitting}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      </TiltCard>
    </div>,
    document.body
  );
}
