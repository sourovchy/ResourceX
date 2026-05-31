"use client";

import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import api from "@/lib/api";
import type {ItemResponse} from "@/types/item";
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    Heart,
    Loader2,
    Link2,
    MessageSquare,
    Tag,
} from "lucide-react";
import {useToast} from "@/context/ToastContext";
import {useAuth} from "@/context/AuthContext";
import MessageModal from "@/components/misc/MessageModal";

// Trust score → colour tier (mirrors the requests page helper)
function trustBadgeClass(score: number | null): string {
    if (score == null) return "bg-outlineVariant text-textSecondary";
    if (score >= 90) return "bg-successLight text-successDark";
    if (score >= 75) return "bg-primaryLight text-primaryDark";
    if (score >= 60) return "bg-warningLight text-warningDark";
    return "bg-errorLight text-error";
}

export default function ItemDetailPage({params}: { params: { id: string } }) {
    const {toast} = useToast();
    const {user} = useAuth();

    const [item, setItem] = useState<ItemResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);

    // Fetch item details
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        api.get<ItemResponse>(`/items/${params.id}`)
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

    // Fetch wishlist state once item is loaded
    useEffect(() => {
        if (!item) return;
        api.get<{ wishlistId: number; item: { itemId: number } }[]>("/wishlist")
            .then((res) => {
                setIsWishlisted(res.data?.some((w) => w.item.itemId === item.itemId) ?? false);
            })
            .catch(() => {
            });
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
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                <p className="text-sm font-medium text-textSecondary">
                    Fetching item details…
                </p>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div
                className="w-full rounded-2xl border border-errorLight bg-errorLight/20 p-6 text-center sm:p-10">
                <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error"/>
                <p className="mb-2 font-bold text-errorDark">Item not found</p>
                <p className="mb-6 text-sm text-textSecondary">
                    {error ?? "The item you are looking for does not exist."}
                </p>
                <Link
                    href="/borrow"
                    className="inline-block rounded-xl bg-primary px-6 py-2.5 font-bold text-white shadow-sm hover:bg-primaryDark">
                    Back to Browse
                </Link>
            </div>
        );
    }

    const images = item.imageUrls?.length > 0 ? item.imageUrls : [];
    const mainImage = images[selectedImage] ?? null;
    const isAvailable = item.status === "AVAILABLE";

    // ── Main ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {/* Images */}
                    <div className="space-y-3">
                        <div
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-borderLight bg-surfaceVariant shadow-sm">
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
                                    <Tag className="h-12 w-12 text-outlineVariant"/>
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
                                aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}>
                                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-error" : ""}`}/>
                            </button>

                            {/* Status badge */}
                            {!isAvailable && (
                                <div
                                    className="absolute left-3 top-3 rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-bold text-textSecondary backdrop-blur-sm">
                                    {item.status}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div
                                className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                        aria-current={i === selectedImage}>
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
                    </div>

                    {/* Details */}
                    <div className="space-y-5">
                        {/* Category + condition chips */}
                        <div className="flex flex-wrap items-center gap-2">
                            {item.category && (
                                <span
                                    className="rounded-md bg-primaryLight px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
								{item.category}
							</span>
                            )}
                            {item.itemCondition && (
                                <span
                                    className="rounded-md bg-surfaceVariant px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
								{item.itemCondition}
							</span>
                            )}
                        </div>

                        <h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">
                            {item.title}
                        </h1>

                        {/* Pricing card */}
                        <div
                            className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5">
                            <div className="border-b border-borderLight pb-4">
                                <p className="mb-0.5 text-sm font-semibold text-textSecondary">
                                    Rental Price
                                </p>
                                <p className="text-2xl font-extrabold text-primary sm:text-3xl">
                                    ৳&thinsp;{Number(item.dailyRate).toLocaleString()}
                                    <span className="text-sm font-medium text-textSecondary"> / day</span>
                                </p>
                                {item.deposit != null && Number(item.deposit) > 0 && (
                                    <p className="mt-1 text-sm text-textSecondary">
                                        + ৳{Number(item.deposit).toLocaleString()} refundable deposit
                                    </p>
                                )}
                            </div>

                            {isOwnItem ? (
                                <div
                                    className="rounded-xl bg-surfaceVariant px-4 py-3 text-center text-sm font-semibold text-textSecondary">
                                    This is your listing
                                </div>
                            ) : isAvailable ? (
                                <Link
                                    href={`/borrow/book/${item.itemId}`}
                                    className="block w-full rounded-xl bg-primary py-3.5 text-center font-bold text-white shadow-sm transition-colors hover:bg-primaryDark">
                                    Book This Item
                                </Link>
                            ) : (
                                <div
                                    className="rounded-xl bg-outlineVariant/20 px-4 py-3 text-center text-sm font-semibold text-textSecondary">
                                    Currently unavailable
                                </div>
                            )}

                            <button
                                onClick={copyShareLink}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight py-3 text-sm font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant">
                                <Link2 className="h-4 w-4"/>
                                Copy Link
                            </button>

                            <div
                                className="flex items-start gap-2 rounded-xl bg-warningLight/50 p-3 text-xs font-medium text-warningDark">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>
                                Inspect the item carefully on pickup and return it in the same condition.
                            </div>
                        </div>

                        {/* Owner card */}
                        <div>
                            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-textSecondary">
                                Listed By
                            </h2>
                            <div
                                className="flex items-center justify-between gap-3 rounded-xl border border-borderLight bg-surface p-4 shadow-sm">
                                <Link
                                    href={`/profile/${item.owner?.userId}`}
                                    className="flex items-center gap-3 min-w-0 group">
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primaryLight text-base font-extrabold text-primary transition-opacity group-hover:opacity-80">
                                        {item.owner?.name?.charAt(0).toUpperCase() ?? "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <div
                                            className="flex items-center gap-1.5 font-bold text-textPrimary group-hover:text-primary transition-colors">
                                            {item.owner?.name ?? "Unknown"}
                                            {isOwnerVerified && (
                                                <CheckCircle2 className="h-4 w-4 text-success"/>
                                            )}
                                        </div>
                                        <div className="text-xs text-textSecondary">
                                            {item.owner?.studentProfile?.university ?? "Campus Member"}
                                            {item.owner?.studentProfile?.department
                                                ? ` · ${item.owner.studentProfile.department}`
                                                : ""}
                                        </div>
                                    </div>
                                </Link>
                                {ownerTrust != null && (
                                    <span
                                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${trustBadgeClass(ownerTrust)}`}>
									<Shield className="h-3.5 w-3.5"/>
                                        {ownerTrust}
								</span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {item.description && (
                            <div className="space-y-1.5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
                                    Description
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-textSecondary">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Message owner */}
                        {!isOwnItem && item.owner?.userId && (
                            <button
                                onClick={() => setMessageOpen(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight py-3 text-sm font-semibold text-textSecondary transition-colors hover:border-primary hover:bg-primaryLight hover:text-primary">
                                <MessageSquare className="h-4 w-4"/>
                                Message Owner
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {!isOwnItem && item.owner?.userId && (
                <MessageModal
                    isOpen={messageOpen}
                    targetUserId={item.owner.userId}
                    targetName={item.owner.name ?? "Owner"}
                    onClose={() => setMessageOpen(false)}
                />
            )}
        </>
    );
}
