import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import TrustBadge from "@/components/TrustBadge";
import SafeImage from "@/components/ui/SafeImage";
import Avatar from "@/components/ui/Avatar";
import { TiltCard } from "@/components/ui/TiltCard";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    image?: string;
    category?: string;
    condition?: string;
    status?: string;
    rating?: number;
    reviews?: number;
    pricePerDay: number;
    deposit?: number;
    owner?: string;
    ownerAvatar?: string | null;
    trustScore?: number | null;
    availabilityScope?: string;
    href?: string;
  };
  href?: string;
  actionsSlot?: React.ReactNode; // e.g. for Edit/Delete buttons
  topRightSlot?: React.ReactNode; // e.g. for Wishlist Remove button
}

const ItemCard = ({ item, href, actionsSlot, topRightSlot }: ItemCardProps) => {
  const badgeStyles = {
    category: "bg-primaryLight text-primary border border-primary/20",
  };
  const conditionStyles: Record<string, string> = {
    excellent: "bg-successLight text-successDark border border-success/20",
    "like new": "bg-successLight text-successDark border border-success/20",
    good: "bg-warningLight text-warningDark border border-warning/20",
    fair: "bg-errorLight text-errorDark border border-error/20",
    poor: "bg-errorLight text-errorDark border border-error/20",
  };

  const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-successLight text-successDark border border-success/20",
    PENDING: "bg-warningLight text-warningDark border border-warning/20",
    BOOKED: "bg-primaryLight text-primary border border-primary/20",
    UNAVAILABLE: "bg-surfaceVariant text-textSecondary border border-border",
    BLOCKED: "bg-errorLight text-errorDark border border-error/20",
    DELETED: "bg-errorLight text-errorDark border border-error/20",
  };

  const itemHref = href || item.href || `/borrow/item/${item.id}`;

  return (
    <TiltCard
      maxTilt={1}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-md transition-colors duration-300 hover:border-primary/40 hover:shadow-lg"
    >
      {/* Stretched overlay link — the whole-card click target. Kept as a sibling
          (not a wrapper) so interactive slots can sit above it without nesting
          anchors inside an anchor. */}
      <Link
        href={itemHref}
        aria-label={item.title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />

      <div className="flex h-full flex-col">
        {/* Image Wrapper */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surfaceVariant">
          <SafeImage
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />

          {/* Badges / Slots */}
          {topRightSlot && (
            <div className="absolute right-2 top-2 z-20">{topRightSlot}</div>
          )}

          {!topRightSlot && item.condition && (
            <div className="absolute right-2 top-2 z-10">
              <span
                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md sm:px-2 sm:text-[10px] ${
                  conditionStyles[item.condition.toLowerCase()] ||
                  "bg-surface/90 text-textSecondary"
                }`}
              >
                {item.condition}
              </span>
            </div>
          )}

          {(item.status || item.category) && (
            <div className="absolute left-2 top-2 z-10">
              {item.status ? (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md sm:px-2 sm:text-xs ${
                    statusStyles[item.status.toUpperCase()] ||
                    "bg-surface/90 text-textSecondary"
                  }`}
                >
                  {item.status}
                </span>
              ) : (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md sm:px-2 sm:text-xs ${badgeStyles.category}`}
                >
                  {item.category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] break-words text-sm font-bold leading-tight text-textPrimary transition-colors group-hover:text-primary">
            {item.title}
          </h3>

          {/* Owner (Compact) */}
          {item.owner && (
            <div className="mt-2 flex items-center gap-1.5">
              <Avatar src={item.ownerAvatar} name={item.owner} size={20} />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="truncate text-[11px] font-medium text-textSecondary sm:text-xs">
                  {item.owner}
                </span>
              </div>
            </div>
          )}

          {/* Rating Block */}
          <div className="mt-2 flex items-center gap-1.5 min-h-[1.25rem]">
            {typeof item.rating === "number" &&
            item.reviews &&
            item.reviews > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-warning text-warning shrink-0" />
                <span className="text-xs font-bold text-textPrimary">
                  {item.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-textTertiary">
                  ({item.reviews})
                </span>
              </>
            ) : (
              <span className="text-[11px] text-textTertiary italic">
                No reviews yet
              </span>
            )}
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-primary sm:text-base">
              ৳ {item.pricePerDay}
            </span>
            <span className="text-[10px] font-semibold text-textSecondary sm:text-xs">
              /day
            </span>
          </div>

          {item.availabilityScope && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-textSecondary sm:text-xs">
              <span className="text-primary">📍</span>
              {item.availabilityScope === "CAMPUS_AND_OUTSIDE"
                ? "Campus & Outside Campus"
                : "Campus Only"}
            </div>
          )}

          {actionsSlot && (
            <div className="relative z-20 mt-3 border-t border-borderLight pt-3">
              {actionsSlot}
            </div>
          )}
        </div>
      </div>
    </TiltCard>
  );
};

export default ItemCard;
