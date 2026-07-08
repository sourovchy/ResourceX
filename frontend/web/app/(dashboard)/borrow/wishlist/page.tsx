"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import ItemCard from "@/components/cards/ItemCard";
import {
  Heart,
  Search,
  Loader2,
  AlertTriangle,
  X,
  Tag,
  Star,
  Shield,
} from "lucide-react";
import api from "@/lib/api";
import type { ItemResponse } from "@/types/item";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";
import Button from "@/components/ui/Button";

interface WishlistEntry {
  wishlistId: number;
  item: ItemResponse;
  createdAt: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WishlistEntry[]>("/wishlist");
      setWishlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (itemId: number) => {
    setRemoving(itemId);
    try {
      await api.delete(`/wishlist/${itemId}`);
      setWishlist((prev) => prev.filter((w) => w.item.itemId !== itemId));
    } catch {
      // Item may have already been removed
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return <PageLoader message="Loading wishlist..." />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchWishlist} />;
  }

  return (
    <div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
      <div className="mb-2">
        <h1 className="mt-1 text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
          My <span className="text-primary italic font-bold">Wishlist.</span>
        </h1>
      </div>

      <Card padding="none" className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between sm:p-6">
        <div>
          <p className="text-sm text-textSecondary font-medium">
            Items you&apos;ve saved for later renting.
          </p>
        </div>
        <div className="w-full rounded-full border border-primary/20 bg-primaryLight px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-primary md:w-auto font-mono">
          {wishlist.length} Item{wishlist.length !== 1 ? "s" : ""} Saved
        </div>
      </Card>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5">
          {wishlist.map(({ wishlistId, item }) => (
            <ItemCard
              key={wishlistId}
              item={{
                id: String(item.itemId),
                title: item.title,
                category: item.category ?? "General",
                pricePerDay: item.dailyRate ?? 0,
                owner: item.owner?.name ?? "Campus Provider",
                ownerAvatar: item.owner?.avatarUrl || undefined,
                trustScore: item.owner?.studentProfile?.trustScore,
                image: item.imageUrls?.[0],
              }}
              topRightSlot={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.itemId);
                  }}
                  disabled={removing === item.itemId}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-textSecondary shadow transition hover:bg-error hover:text-white"
                  aria-label="Remove from wishlist"
                >
                  {removing === item.itemId ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <PageEmpty
            icon={Heart}
            title="Your wishlist is empty"
            description="Browse the catalog and save items you'd like to rent later. Look for the heart button on item pages."
          />
          <div className="flex justify-center">
            <Link
              href="/borrow"
              className="inline-flex items-center justify-center rounded-full font-bold italic transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-primary/40 shadow-sm px-6 py-3 text-sm gap-2"
            >
              <Search className="h-4 w-4" /> Browse Items
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
