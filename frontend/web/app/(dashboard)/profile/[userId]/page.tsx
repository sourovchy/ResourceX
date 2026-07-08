"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MessageModal from "@/components/misc/MessageModal";
import ReportModal from "@/components/misc/ReportModal";
import TrustBadge from "@/components/TrustBadge";
import { formatShortDate } from "@/lib/dateUtils";
import {
  CardGridSkeleton,
  ProfileSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import ItemCard from "@/components/cards/ItemCard";
import { Select } from "@/components/ui/Select";
import { TiltCard } from "@/components/ui/TiltCard";
import Card from "@/components/ui/Card";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicItem = {
  itemId: number;
  title: string;
  dailyRate: number | null;
  imageUrls: string[];
  category: string | null;
  status: string;
};

type ProfileInfo = {
  userId: number;
  name: string;
  status?: string | null;
  emailVerified: boolean;
  trustScore: number | null;
  university: string | null;
  department: string | null;
  avatarUrl?: string | null;
  memberSince?: string | null;
};

type ReviewSnippet = {
  rating: number;
  excerpt: string;
  reviewerName: string;
  createdAt: string;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  recentSnippets?: ReviewSnippet[];
  completedRentals?: number;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PublicProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const targetId = params.userId;

  // Redirect to private profile if visiting own public profile
  useEffect(() => {
    if (user?.userId && targetId === user.userId.toString()) {
      router.replace("/profile");
    }
  }, [user?.userId, targetId, router]);

  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [itemsListedCount, setItemsListedCount] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (!targetId) return;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/users/${targetId}`),
      api.get(`/items/user/${targetId}`),
      api.get(`/reviews/owner/${targetId}/summary`),
      api.get("/categories").catch(() => ({ data: [] })),
    ])
      .then(([userRes, itemsRes, summaryRes, categoriesRes]) => {
        if (!active) return;

        const u = userRes.data;
        setProfile({
          userId: u.userId ?? targetId,
          name: u.name ?? "Unknown User",
          status: u.status,
          emailVerified: u.studentProfile?.emailVerified ?? false,
          trustScore: u.studentProfile?.trustScore ?? null,
          university: u.studentProfile?.university ?? null,
          department: u.studentProfile?.department ?? null,
          avatarUrl: u.avatarUrl,
          memberSince: u.createdAt ?? null,
        });

        setSummary(summaryRes.data ?? null);

        const rawCat: any = categoriesRes.data;
        setCategories(
          Array.isArray(rawCat)
            ? rawCat
            : Array.isArray(rawCat?.data)
              ? rawCat.data
              : Array.isArray(rawCat?.content)
                ? rawCat.content
                : [],
        );

        const raw: any[] = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : (itemsRes.data?.content ?? []);

        setItems(
          raw
            .filter((i) => i.status === "AVAILABLE")
            .map((i) => ({
              itemId: Number(i.itemId ?? i.id),
              title: String(i.title ?? "Untitled"),
              dailyRate: i.dailyRate != null ? Number(i.dailyRate) : null,
              imageUrls: Array.isArray(i.imageUrls) ? i.imageUrls : [],
              category: i.category ? String(i.category) : null,
              status: String(i.status ?? "AVAILABLE"),
            }))
            .sort((a, b) => b.itemId - a.itemId),
        );
        setItemsListedCount(raw.length);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Profile fetch error:", err);
        setError("Could not load this profile. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [targetId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <PageLoader message="Loading profile..." />;
  }

  if (error) {
    return (
      <PageError message={error} onRetry={() => window.location.reload()} />
    );
  }

  // ── Main ────────────────────────────────────────────────────────────────────

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <>
      <div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
        {/* Profile header card */}
        <ProfileHeaderCard
          avatarUrl={profile?.avatarUrl}
          initials={profile?.name?.charAt(0).toUpperCase() ?? "?"}
          avatarBgClass="bg-primaryLight text-primary [&>span]:bg-success [&>span]:text-white"
          name={profile?.name || ""}
          nameBadge={
            profile?.emailVerified ? (
              <CheckCircle2
                className="h-5 w-5 text-success"
                aria-label="Verified member"
              />
            ) : null
          }
          infoRows={[
            ...(profile?.university ? [{ icon: <Building2 className="h-4 w-4" />, text: profile.university }] : []),
            ...(profile?.department ? [{ icon: <GraduationCap className="h-4 w-4" />, text: profile.department }] : []),
            ...(profile?.trustScore != null ? [{ 
              icon: <div className="text-accent"><Star className="h-4 w-4 fill-current" /></div>, 
              text: (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-accent">Trust Score</span>
                  <div className="scale-90 origin-left">
                    <TrustBadge score={profile.trustScore} />
                  </div>
                </div>
              )
            }] : []),
            { icon: <Star className="h-4 w-4" />, text: `${summary ? summary.averageRating.toFixed(1) : '0.0'} (${summary ? summary.totalReviews : 0} reviews)` },
            { icon: <Package className="h-4 w-4" />, text: `${itemsListedCount} Items Listed` },
            { icon: <CheckCircle className="h-4 w-4" />, text: `${summary?.completedRentals ?? 0} Completed Rentals` }
          ]}
          rightContent={null}
          actions={
            <div className="grid grid-cols-2 gap-3 w-full sm:w-[320px]">
              <button
                onClick={() => setMessageOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primaryDark hover:shadow-md justify-center"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </button>

              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center justify-center gap-2 rounded-full border border-borderLight bg-surface px-4 py-2.5 text-sm font-bold text-textSecondary shadow-sm transition-all hover:-translate-y-0.5 hover:border-error/30 hover:bg-errorLight/50 hover:text-error hover:shadow-md"
              >
                <AlertTriangle className="h-4 w-4" /> Report
              </button>
            </div>
          }
        />

        {/* Listings section */}
        <div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-textPrimary">
              <Package className="h-5 w-5 text-primary" />
              Active Listings
              {filteredItems.length > 0 && (
                <span className="rounded-full bg-primaryLight px-2 py-0.5 text-xs font-bold text-primary">
                  {filteredItems.length}
                </span>
              )}
            </h2>

            {categories.length > 0 && (
              <div className="w-full sm:w-56 sm:ml-auto">
                <Select
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  options={[
                    { value: "all", label: "All Categories" },
                    ...categories.map((c: any) => ({
                      value: c.name,
                      label: c.name,
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderLight bg-surface px-4 py-14 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-outlineVariant" />
              <p className="text-sm font-semibold text-textSecondary">
                {selectedCategory === "all"
                  ? "No active listings right now."
                  : "No listings found in this category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5 stagger-children">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.itemId}
                  item={{
                    id: String(item.itemId),
                    title: item.title,
                    category: item.category ?? "General",
                    pricePerDay: item.dailyRate ?? 0,
                    image: item.imageUrls?.[0],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message modal */}
      {profile && (
        <MessageModal
          isOpen={messageOpen}
          targetUserId={profile.userId}
          targetName={profile.name}
          onClose={() => setMessageOpen(false)}
        />
      )}

      {profile && (
        <ReportModal
          isOpen={reportOpen}
          entityType="USER"
          entityId={profile.userId}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
}
