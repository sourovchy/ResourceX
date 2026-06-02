"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import ActionCard from "@/components/cards/ActionCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import {
  ShieldCheck,
  PackageSearch,
  PlusCircle,
  KeyRound,
  PackageOpen,
  Bell,
  Wallet,
  Star,
  HistoryIcon,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

type Item = {
  itemId: number;
  title: string;
  dailyRate: number;
  status: string;
};
type Booking = { bookingId: number; status: string; item?: Item };

/* ── Status badge colours */
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-successLight text-successDark",
  APPROVED: "bg-successLight text-successDark",
  PENDING: "bg-warningLight text-warningDark",
  REJECTED: "bg-errorLight   text-errorDark",
  RETURNED: "bg-surfaceVariant text-textSecondary",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLE[status] ?? "bg-surfaceVariant text-textSecondary";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

/* ── Main component  */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [itemsRes, bookingsRes] = await Promise.all([
        api.get<Item[]>("/items/me").catch(() => ({ data: [] as Item[] })),
        api.get<Booking[]>("/bookings/me").catch(() => ({ data: [] as Booking[] })),
      ]);

      const rawItems = itemsRes.data as unknown;
      setItems(
        Array.isArray(rawItems)
          ? (rawItems as Item[])
          : Array.isArray((rawItems as any)?.content)
            ? (rawItems as any).content
            : [],
      );

      const rawBookings = bookingsRes.data as unknown;
      setBookings(
        Array.isArray(rawBookings)
          ? (rawBookings as Booking[])
          : Array.isArray((rawBookings as any)?.content)
            ? (rawBookings as any).content
            : [],
      );
    } catch {
      setError("Could not load your dashboard data.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Auto-refresh silently on tab focus + moderate polling
  useAutoRefresh(() => loadDashboard(true), { intervalMs: 60_000 });

  const activeRentals = useMemo(
    () =>
      bookings.filter((b) => ["APPROVED", "ACTIVE"].includes(b.status)).length,
    [bookings],
  );
  const pendingRequests = useMemo(
    () => bookings.filter((b) => b.status === "PENDING").length,
    [bookings],
  );

  /* ── Loading ─────── */
  // Removed full page loader in favor of skeleton state

  /* ── Dashboard ───── */
  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-slide-down">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Welcome strip ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-borderLight bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-textTertiary">
            Student Dashboard
          </p>
          <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
            Welcome back, {user?.name ?? "student"}.
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Your dashboard is synced with your ResourceX account.
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center gap-3 rounded-lg border border-borderLight bg-surfaceVariant px-4 py-3 sm:w-auto">
          <div className="rounded-full bg-successLight p-1.5">
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-textTertiary">
              Account status
            </div>
            <div className="text-sm font-bold text-success">
              {user?.status ?? "ACTIVE"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 stagger-children">
        <StatCard
          loading={loading}
          icon={<PackageOpen className="h-5 w-5 text-dashboardBlue" />}
          title="Active Rentals"
          value={String(activeRentals)}
          tint="bg-dashboardBlueTint"
        />
        <StatCard
          loading={loading}
          icon={<PlusCircle className="h-5 w-5 text-dashboardPurple" />}
          title="Items Listed"
          value={String(items.length)}
          tint="bg-dashboardPurpleTint"
        />
        <StatCard
          loading={loading}
          icon={<Bell className="h-5 w-5 text-dashboardYellow" />}
          title="Pending Requests"
          value={String(pendingRequests)}
          tint="bg-dashboardYellowTint"
        />
        <StatCard
          loading={loading}
          icon={<Star className="h-5 w-5 text-dashboardGreen" />}
          title="Trust Score"
          value={String(user?.studentProfile?.trustScore ?? 0)}
          tint="bg-dashboardGreenTint"
        />
      </div>

      {/* ── Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-textTertiary">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 stagger-children">
          <ActionCard
            href="/borrow"
            icon={<PackageSearch className="h-6 w-6 text-primary" />}
            bgIcon="bg-primaryLight"
            title="Browse Items"
            description="Find items to rent"
          />
          <ActionCard
            href="/my-posts/add"
            icon={<PlusCircle className="h-6 w-6 text-accent" />}
            bgIcon="bg-accentLight"
            title="List an Item"
            description="Rent out your gear"
          />
          <ActionCard
            href="/my-posts/active-rentals"
            icon={<KeyRound className="h-6 w-6 text-dashboardBlue" />}
            bgIcon="bg-dashboardBlueTint"
            title="Active Rentals"
            description="Manage your currently rented items"
          />

          <ActionCard
            href="/my-posts/earnings"
            icon={<Wallet className="h-6 w-6 text-dashboardYellow" />}
            bgIcon="bg-dashboardYellowTint"
            title="My Earnings"
            description="Track your rental income and payouts"
          />
          <ActionCard
            href="/history"
            icon={<HistoryIcon className="h-6 w-6 text-dashboardPurple" />}
            bgIcon="bg-dashboardPurpleTint"
            title="History"
            description="Past transactions"
          />
        </div>
      </div>

      {/* ── Listings + Bookings panels ────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Your Listings */}
        <Panel
          title="Your Listings"
          action={
            <Link
              href="/my-posts/add"
              className="text-xs font-semibold text-primary hover:underline"
            >
              + New listing
            </Link>
          }
          empty="No listings yet. Create your first listing."
          isEmpty={!loading && items.length === 0}
        >
          {loading ? (
            <ListRowSkeleton count={3} />
          ) : (
            <>
              {items.slice(0, 4).map((item) => (
                <ListingRow key={item.itemId} item={item} />
              ))}
              {items.length > 4 && (
                <ViewAll
                  href="/my-posts"
                  label={`View all ${items.length} listings`}
                />
              )}
            </>
          )}
        </Panel>

        {/* Your Bookings */}
        <Panel
          title="Your Bookings"
          action={
            <Link
              href="/borrow"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Browse items
            </Link>
          }
          empty="No bookings yet. Browse items to get started."
          isEmpty={!loading && bookings.length === 0}
        >
          {loading ? (
            <ListRowSkeleton count={3} />
          ) : (
            <>
              {bookings.slice(0, 4).map((booking) => (
                <BookingRow key={booking.bookingId} booking={booking} />
              ))}
              {bookings.length > 4 && (
                <ViewAll
                  href="/bookings"
                  label={`View all ${bookings.length} bookings`}
                />
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ── Panel wrapper ─────── */
function Panel({
  title,
  action,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  action: React.ReactNode;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
        <h2 className="text-sm font-bold text-textPrimary">{title}</h2>
        {action}
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
          <TrendingUp className="h-8 w-8 text-borderLight" />
          <p className="text-sm text-textSecondary">{empty}</p>
        </div>
      ) : (
        <div className="divide-y divide-borderLight">{children}</div>
      )}
    </section>
  );
}

/* ── Listing row ───────── */
function ListingRow({ item }: { item: Item }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surfaceVariant/60">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-textPrimary">
          {item.title}
        </p>
        <p className="text-xs text-textTertiary">৳{item.dailyRate}/day</p>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

/* ── Booking row ───────── */
function BookingRow({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surfaceVariant/60">
      <p className="min-w-0 truncate text-sm font-semibold text-textPrimary">
        {booking.item?.title ?? `Booking #${booking.bookingId}`}
      </p>
      <StatusBadge status={booking.status} />
    </div>
  );
}

/* ── View all link ─────── */
function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center px-5 py-3 text-xs font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant/60 hover:text-primary"
    >
      {label} →
    </Link>
  );
}
