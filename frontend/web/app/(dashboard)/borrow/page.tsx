"use client";

import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/cards/ItemCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, AlertTriangle, PackageOpen } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { PageError } from "@/components/ui/PageError";
import { PageEmpty } from "@/components/ui/PageEmpty";

export default function BorrowPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeAvailability, setActiveAvailability] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);

  // Load category list once
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const raw: { name?: string; categoryName?: string }[] = Array.isArray(
          res.data,
        )
          ? res.data
          : (res.data?.content ?? []);
        const names = raw
          .map((c) => c.name ?? c.categoryName)
          .filter(Boolean) as string[];
        setCategories(["All", ...names]);
      })
      .catch(() => {});
  }, []);

  // Debounced item fetch
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (activeAvailability !== "All")
          params.append("availabilityScope", activeAvailability);
        if (searchQuery.trim())
          params.append("searchQuery", searchQuery.trim());

        const res = await api.get(`/items?${params.toString()}`);
        const page = res.data?.content ?? res.data;
        const all: any[] = Array.isArray(page) ? page : [];

        // Hide the current user's own listings from the marketplace
        const myId = user?.userId;
        const visible = myId
          ? all.filter((i) => i.owner?.userId !== myId)
          : all;

        // Hide deleted / blocked items
        setItems(
          visible.filter(
            (i) => i.status === "AVAILABLE" || i.status === "UNAVAILABLE",
          ),
        );
      } catch {
        setError("Failed to load items. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [activeCategory, activeAvailability, searchQuery, user?.userId]);

  return (
    <div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
            Browse <span className="text-gradient-brand italic">items.</span>
          </h1>
          <p className="mt-0.5 text-sm text-textSecondary">
            Find gear you need from trusted students on campus.
          </p>
        </div>
      </div>

      {/* Search + Categories */}
      <div className="relative z-50 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative z-50 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="w-full sm:w-48 shrink-0">
            <Select
              options={categories.map((cat) => ({
                value: cat,
                label: cat === "All" ? "All Categories" : cat,
              }))}
              value={activeCategory}
              onChange={(val) => setActiveCategory(val)}
              placeholder="All Categories"
              searchable
              searchPlaceholder="Search categories..."
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveAvailability((prev) =>
                prev === "CAMPUS_ONLY" ? "All" : "CAMPUS_ONLY",
              );
            }}
            className={`w-full sm:w-auto flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-all shadow-sm ${
              activeAvailability === "CAMPUS_ONLY"
                ? "bg-primaryLight border-primary text-primary"
                : "bg-card border-border text-textSecondary hover:text-textPrimary hover:bg-surfaceVariant/30"
            }`}
          >
            Campus Only
          </button>
        </div>

        <div className="relative w-full shrink-0 sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
          <input
            type="text"
            placeholder="Search items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
          />
        </div>
      </div>

      {/* States */}
      {loading && <CardGridSkeleton count={8} />}

      {!loading && error && (
        <PageError message={error} onRetry={() => setSearchQuery("")} />
      )}

      {!loading && !error && items.length === 0 && (
        <PageEmpty
          icon={PackageOpen}
          title="No listings found"
          description={
            searchQuery || activeCategory !== "All"
              ? "Try a different search or category."
              : "No items are currently available."
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5 stagger-children">
          {items.map((item) => (
            <ItemCard
              key={item.itemId}
              item={{
                id: String(item.itemId),
                title: item.title,
                category: item.category ?? "General",
                condition: item.itemCondition ?? "Good",
                pricePerDay: item.dailyRate,
                owner: item.owner?.name ?? "Campus Provider",
                ownerAvatar: item.owner?.avatarUrl,
                trustScore: item.owner?.studentProfile?.trustScore,
                image: item.imageUrls?.[0],
                availabilityScope: item.availabilityScope,
                rating: item.rating,
                reviews: item.reviews,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
