"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/ui/Reveal";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { trustLevelFor, TRUST_LEVEL_LABEL } from "@/types/trust";
import {
  formatDateRange,
  formatRelativeTime,
  formatShortDate,
} from "@/lib/dateUtils";
import {
  ShieldCheck,
  PlusCircle,
  PackageOpen,
  Inbox,
  Star,
  AlertCircle,
  AlertTriangle,
  Clock,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

type Item = {
  itemId: number;
  title: string;
  dailyRate: number;
  status: string;
};
type Booking = {
  bookingId: number;
  status: string;
  startDate?: string;
  endDate?: string;
  item?: Item;
  renter?: { userId: number; name?: string };
};

/* ── Main component  */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [itemsRes, bookingsRes, requestsRes] =
        await Promise.all([
          api.get<Item[]>("/items/me").catch(() => ({ data: [] as Item[] })),
          api
            .get<Booking[]>("/bookings/me")
            .catch(() => ({ data: [] as Booking[] })),
          api
            .get<Booking[]>("/bookings/owner")
            .catch(() => ({ data: [] as Booking[] })),
        ]);

      setItems(toArray<Item>(itemsRes.data));
      setBookings(toArray<Booking>(bookingsRes.data));
      setOwnerRequests(toArray<Booking>(requestsRes.data));
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
  const incomingRequests = useMemo(
    () => ownerRequests.filter((b) => b.status === "PENDING"),
    [ownerRequests],
  );

  const attention = useMemo(
    () => buildAttentionItems(bookings, incomingRequests),
    [bookings, incomingRequests],
  );

  /* ── Dashboard ───── */
  return (
    <div className="space-y-6 pb-20 sm:pb-0 graph-grid">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-slide-down">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Welcome strip ─────────────────────────────────── */}
      <div className="glass-surface flex flex-col gap-4 rounded-xl p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
            Welcome back,{" "}
            <span className="text-gradient-brand italic">
              {user?.name ?? "student"}.
            </span>
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            {attention.length > 0
              ? `${attention.length} thing${attention.length === 1 ? "" : "s"} need${attention.length === 1 ? "s" : ""} your attention today.`
              : "You're all caught up."}
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        <StatCard
          loading={loading}
          href="/bookings"
          icon={<PackageOpen className="h-5 w-5 text-primary" />}
          title="Active Rentals"
          value={String(activeRentals)}
          tint="bg-primaryLight"
        />
        <StatCard
          loading={loading}
          href="/my-posts"
          icon={<PlusCircle className="h-5 w-5 text-primary" />}
          title="Items Listed"
          value={String(items.length)}
          tint="bg-primaryLight"
        />
        <StatCard
          loading={loading}
          href="/my-posts/requests"
          icon={<Inbox className="h-5 w-5 text-primary" />}
          title="Requests to Approve"
          value={String(incomingRequests.length)}
          tint="bg-primaryLight"
        />
        <StatCard
          loading={loading}
          href="/profile"
          icon={<Star className="h-5 w-5 text-primary" />}
          title="Trust Score"
          value={
            <span className="inline-flex items-baseline gap-1">
              {user?.studentProfile?.trustScore ?? 0}
              <span className="text-sm font-medium text-textTertiary sm:text-base">
                / 200
              </span>
            </span>
          }
          subtitle={
            TRUST_LEVEL_LABEL[
              trustLevelFor(user?.studentProfile?.trustScore ?? 0)
            ]
          }
          tint="bg-primaryLight"
        />
      </div>

      {/* ── Attention queue ───────────────── */}
      <Reveal className="w-full">
        <Panel
          title="Needs your attention"
          action={
            incomingRequests.length > 0 ? (
              <Link
                href="/my-posts/requests"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Review requests
              </Link>
            ) : null
          }
          isEmpty={!loading && attention.length === 0}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-success/60" />
              <p className="text-sm font-semibold text-textPrimary">
                All caught up
              </p>
              <p className="text-xs text-textSecondary">
                Requests, due dates and pickups will appear here when they need
                action.
              </p>
            </div>
          }
        >
          {loading ? (
            <ListRowSkeleton count={3} />
          ) : (
            attention
              .slice(0, 6)
              .map((entry) => <AttentionRow key={entry.key} entry={entry} />)
          )}
        </Panel>
      </Reveal>

      {/* ── Listings + Bookings panels ────────────────────── */}
      <Reveal delay={90} className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          isEmpty={!loading && items.length === 0}
          emptyState={
            <PanelEmpty text="No listings yet. Create your first listing." />
          }
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
          isEmpty={!loading && bookings.length === 0}
          emptyState={
            <PanelEmpty text="No bookings yet. Browse items to get started." />
          }
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
      </Reveal>
    </div>
  );
}

/* ── Attention queue derivation ───────────────────────────── */

type AttentionEntry = {
  key: string;
  tone: "error" | "warning" | "info" | "primary";
  icon: React.ReactNode;
  title: string;
  detail: string;
  href: string;
};

function buildAttentionItems(
  bookings: Booking[],
  incomingRequests: Booking[],
): AttentionEntry[] {
  const entries: AttentionEntry[] = [];
  const today = startOfToday();
  const soonCutoff = new Date(today);
  soonCutoff.setDate(soonCutoff.getDate() + 3);

  // Overdue returns (I am the renter and the end date has passed)
  bookings
    .filter(
      (b) => b.status === "ACTIVE" && b.endDate && new Date(b.endDate) < today,
    )
    .forEach((b) =>
      entries.push({
        key: `overdue-${b.bookingId}`,
        tone: "error",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `Overdue: ${b.item?.title ?? `booking #${b.bookingId}`}`,
        detail: `Was due ${formatShortDate(b.endDate)} — return it as soon as possible.`,
        href: "/bookings",
      }),
    );

  // Incoming requests awaiting my approval
  incomingRequests.forEach((b) =>
    entries.push({
      key: `request-${b.bookingId}`,
      tone: "primary",
      icon: <Inbox className="h-4 w-4" />,
      title: `${b.renter?.name ?? "A student"} wants "${b.item?.title ?? "your item"}"`,
      detail: b.startDate
        ? formatDateRange(b.startDate, b.endDate)
        : "Awaiting your approval",
      href: "/my-posts/requests",
    }),
  );

  // Due soon (within 3 days)
  bookings
    .filter(
      (b) =>
        b.status === "ACTIVE" &&
        b.endDate &&
        new Date(b.endDate) >= today &&
        new Date(b.endDate) <= soonCutoff,
    )
    .forEach((b) =>
      entries.push({
        key: `due-${b.bookingId}`,
        tone: "warning",
        icon: <Clock className="h-4 w-4" />,
        title: `Due soon: ${b.item?.title ?? `booking #${b.bookingId}`}`,
        detail: formatDateRange(b.startDate, b.endDate),
        href: "/bookings",
      }),
    );

  // Approved bookings waiting for pickup (I am the renter)
  bookings
    .filter((b) => b.status === "APPROVED")
    .forEach((b) =>
      entries.push({
        key: `pickup-${b.bookingId}`,
        tone: "info",
        icon: <KeyRound className="h-4 w-4" />,
        title: `Pickup approved: ${b.item?.title ?? `booking #${b.bookingId}`}`,
        detail: "Coordinate pickup with the owner.",
        href: "/bookings",
      }),
    );

  return entries;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const TONE_STYLES: Record<AttentionEntry["tone"], string> = {
  error: "bg-errorLight text-error",
  warning: "bg-warningLight text-warningDark",
  info: "bg-infoLight text-infoDark",
  primary: "bg-primaryLight text-primary",
};

function AttentionRow({ entry }: { entry: AttentionEntry }) {
  return (
    <Link
      href={entry.href}
      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surfaceVariant/60"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE_STYLES[entry.tone]}`}
      >
        {entry.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-textPrimary">
          {entry.title}
        </span>
        <span className="block truncate text-xs text-textTertiary">
          {entry.detail}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-textTertiary" />
    </Link>
  );
}

/* ── Panel wrapper ─────── */
function Panel({
  title,
  action,
  isEmpty,
  emptyState,
  className = "",
  children,
}: {
  title: string;
  action?: React.ReactNode;
  isEmpty: boolean;
  emptyState: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TiltCard
      maxTilt={3}
      glare={true}
      className={`overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
        <h2 className="text-sm font-bold text-textPrimary">{title}</h2>
        {action}
      </div>

      {/* Body */}
      {isEmpty ? (
        emptyState
      ) : (
        <div className="divide-y divide-borderLight">{children}</div>
      )}
    </TiltCard>
  );
}

function PanelEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <TrendingUp className="h-8 w-8 text-borderLight" />
      <p className="text-sm text-textSecondary">{text}</p>
    </div>
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
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-textPrimary">
          {booking.item?.title ?? `Booking #${booking.bookingId}`}
        </p>
        {booking.startDate && (
          <p className="text-xs text-textTertiary">
            {formatDateRange(booking.startDate, booking.endDate)}
          </p>
        )}
      </div>
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

/* ── Helpers ───────────── */
function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray((raw as any)?.content)) return (raw as any).content as T[];
  return [];
}
