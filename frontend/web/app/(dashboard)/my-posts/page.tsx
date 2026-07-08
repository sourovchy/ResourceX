"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import api from "@/lib/api";
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  ImageIcon,
  Archive,
  Search,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import ItemCard from "@/components/cards/ItemCard";
import Button from "@/components/ui/Button";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";

type Item = {
  itemId: number;
  title: string;
  status: string;
  dailyRate: number;
  imageUrls?: string[];
  category?: string;
  rating?: number;
  reviews?: number;
  availabilityScope?: string;
};

type Booking = {
  bookingId: number;
  status: string;
  item?: { itemId: number };
};

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "bg-successLight text-successDark",
  UNAVAILABLE: "bg-warningLight text-warningDark",
  BLOCKED: "bg-errorLight text-error",
};

export default function MyPostsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Item[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);

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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const [itemsRes, requestRes] = await Promise.all([
        api.get<{ content: Item[] } | Item[]>("/items/me"),
        api.get<Booking[]>("/bookings/owner"),
      ]);
      const itemsData = itemsRes.data;
      const allItems = Array.isArray(itemsData)
        ? itemsData
        : ((itemsData as { content: Item[] }).content ?? []);
      // Never show DELETED items in the owner's view
      setPosts(allItems.filter((i) => i.status !== "DELETED"));
      setRequests(requestRes.data ?? []);
      setError("");
    } catch {
      setError("Could not load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const pendingRequestsByItem = useMemo(() => {
    return requests.reduce<Record<number, number>>((acc, request) => {
      if (request.status === "PENDING" && request.item?.itemId) {
        acc[request.item.itemId] = (acc[request.item.itemId] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [requests]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/items/${deleteTarget.itemId}`);
      // Remove immediately from local state — no re-fetch needed
      setPosts((prev) => prev.filter((p) => p.itemId !== deleteTarget.itemId));
      setDeleteTarget(null);
      toast("Listing deleted successfully.");
    } catch {
      toast(
        "Could not delete this listing. It may have active bookings.",
        "error",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading your listings..." />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchPosts} />;
  }

  return (
    <div className="w-full space-y-6 px-4 pb-16 sm:px-6 sm:pb-20 lg:space-y-8 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-normal italic text-textPrimary sm:text-4xl">
            Manage <span className="text-primary font-bold">items.</span>
          </h1>
          <p className="mt-2 text-sm text-textSecondary sm:text-base lg:text-lg">
            Manage the items you are renting out.
          </p>
        </div>
        <Link href="/my-posts/add" className="w-full sm:w-auto">
          <Button className="w-full">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
          </Button>
        </Link>
      </div>

      <div className="relative z-50 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative z-50 w-full shrink-0 sm:w-48">
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

        <div className="relative w-full shrink-0 sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
          <input
            type="text"
            placeholder="Search your items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="space-y-6">
          <PageEmpty
            icon={Archive}
            title={
              posts.length === 0 ? "No listings found" : "No results found"
            }
            description={
              posts.length === 0
                ? "You haven't posted any items yet. Create your first listing to start renting."
                : "No items match your search and category filters."
            }
          />
          {posts.length === 0 && (
            <div className="flex justify-center">
              <Link href="/my-posts/add">
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" /> Create listing
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5 stagger-children">
          {filteredPosts.map((post) => {
            const requestCount = pendingRequestsByItem[post.itemId] ?? 0;
            return (
              <ItemCard
                key={post.itemId}
                item={{
                  id: String(post.itemId),
                  title: post.title,
                  status: post.status,
                  pricePerDay: post.dailyRate,
                  image: post.imageUrls?.[0],
                  rating: post.rating,
                  reviews: post.reviews,
                  availabilityScope: post.availabilityScope,
                }}
                href={`/borrow/item/${post.itemId}`}
                actionsSlot={
                  <div className="flex flex-col gap-2">
                    {requestCount > 0 && (
                      <Link
                        href={`/my-posts/requests?postId=${post.itemId}`}
                        className="flex items-center justify-between rounded-lg bg-warningLight px-2 py-1 text-[10px] font-bold text-warningDark transition hover:opacity-80"
                      >
                        <span>{requestCount} requests</span>
                        <span>View</span>
                      </Link>
                    )}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/my-posts/edit/${post.itemId}`}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primaryLight py-1.5 text-xs font-bold text-primary transition-all hover:bg-primaryLight/80"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteTarget(post);
                        }}
                        className="flex items-center justify-center rounded-lg bg-errorLight px-3 py-1.5 text-xs font-bold text-error transition-all hover:bg-errorLight/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Listing"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the listing and its images.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
