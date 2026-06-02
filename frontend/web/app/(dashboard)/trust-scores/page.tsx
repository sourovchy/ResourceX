"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import TrustBadge from "@/components/TrustBadge";

import {
  Star,
  TrendingUp,
  TrendingDown,
  Edit2,
  Search,
  X,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

import api from "@/lib/api";
import { extractErrorMessage, logErrorDetails } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";

interface UserTrust {
  id: string | number;
  name: string;
  email: string;
  score: number;
}

interface UserApiResponse {
  id?: string | number;
  userId?: string | number;

  name?: string;

  email?: string;

  score?: number | string;
  trustScore?: number | string;
}

function normalizeUser(data: UserApiResponse): UserTrust {
  return {
    id: data.id ?? data.userId ?? "",

    name: data.name ?? "Unknown User",

    email: data.email ?? "",

    score: Number(data.score ?? data.trustScore ?? 0),
  };
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

type FilterRange = "ALL" | "BELOW_50" | "50_79" | "80_99" | "100";

export default function AdminTrustScoresPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserTrust[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRange, setFilterRange] = useState<FilterRange>("ALL");
  const [adjustUser, setAdjustUser] = useState<UserTrust | null>(null);

  const [adjustVal, setAdjustVal] = useState("");

  const [adjustReason, setAdjustReason] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const usersRes = await api.get("/trust/admin/users");

      const usersRaw = usersRes.data;

      const usersList = Array.isArray(usersRaw)
        ? usersRaw
        : Array.isArray(usersRaw?.data)
          ? usersRaw.data
          : Array.isArray(usersRaw?.content)
            ? usersRaw.content
            : [];

      setUsers(usersList.map(normalizeUser));
    } catch (err) {
      logErrorDetails(err, {
        endpoint: "/api/admin/trust-scores",
        action: "Fetch Trust Scores",
      });

      setError(extractErrorMessage(err));

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh on tab focus + moderate polling
  useAutoRefresh(fetchData, { intervalMs: 60_000 });

  const filteredUsers = useMemo(() => {
    const searchStr = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchStr) ||
        u.email.toLowerCase().includes(searchStr);

      let matchesRange = true;
      if (filterRange === "BELOW_50") matchesRange = u.score < 50;
      else if (filterRange === "50_79") matchesRange = u.score >= 50 && u.score <= 79;
      else if (filterRange === "80_99") matchesRange = u.score >= 80 && u.score <= 99;
      else if (filterRange === "100") matchesRange = u.score === 100;

      return matchesSearch && matchesRange;
    });
  }, [users, search, filterRange]);

  const applyAdjustment = async () => {
    if (!adjustUser) return;

    const amount = Number(adjustVal);

    if (Number.isNaN(amount) || amount === 0) {
      setError("Enter a valid adjustment amount.");

      return;
    }

    if (!adjustReason.trim()) {
      setError("Please provide a reason.");

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.patch(`/trust/admin/${adjustUser.id}/adjust`, {
        change: amount,
        reason: adjustReason.trim(),
      });

      await fetchData();

      setAdjustUser(null);

      setAdjustVal("");

      setAdjustReason("");
      toast(`Trust score ${amount > 0 ? "increased" : "decreased"} by ${Math.abs(amount)}.`);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 px-3 pb-16 sm:space-y-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Trust Scores</h1>

          <p className="mt-1 text-sm text-textSecondary">
            Review, monitor, and manage user trust scores with complete audit
            tracking.
          </p>
        </div>
      </div>

      {/* Page-level errors only — hidden while the modal is open so the message is
          never trapped behind the modal backdrop (it renders inside the modal instead). */}
      {error && !adjustUser && (
        <div
          role="alert"
          className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      )}

      {/* Manual Override Modal */}
      {adjustUser && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col space-y-4 overflow-y-auto rounded-2xl border border-borderLight bg-surface p-4 shadow-xl sm:max-w-lg sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-textPrimary">
                Adjust Trust Score
              </h3>
              <button onClick={() => setAdjustUser(null)}>
                <X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
              </button>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-surfaceVariant p-3 sm:flex-row sm:items-center sm:p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
                {adjustUser.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-textPrimary">
                  {adjustUser.name}
                </div>
                <div className="text-xs text-textTertiary">
                  Current score:{" "}
                  <span className="font-bold text-textPrimary">
                    {adjustUser.score}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                Adjustment value
              </label>
              <input
                type="number"
                value={adjustVal}
                onChange={(e) => {
                  setAdjustVal(e.target.value);
                  if (error) setError("");
                }}
                placeholder="+10 or -5"
                className="mt-1.5 w-full min-w-0 rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                Reason
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => {
                  setAdjustReason(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Explain the manual override..."
                aria-invalid={Boolean(error)}
                className="mt-1.5 w-full min-w-0 rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-error animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setAdjustUser(null)}
                className="flex-1 rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant"
              >
                Cancel
              </button>
              <button
                onClick={applyAdjustment}
                disabled={
                  submitting ||
                  !adjustVal.trim() ||
                  !adjustReason.trim()
                }
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Applying..." : "Apply & Log"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Controls: Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 pr-2 border-r border-borderLight text-textTertiary">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Filter</span>
          </div>
          {[
            { id: "ALL", label: "All" },
            { id: "BELOW_50", label: "< 50", title: "Below 50 (Critical)" },
            { id: "50_79", label: "50–79", title: "50 to 79 (Warning)" },
            { id: "80_99", label: "80–99", title: "80 to 99 (Good)" },
            { id: "100", label: "100", title: "Perfect (100)" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRange(f.id as FilterRange)}
              title={f.title}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterRange === f.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surfaceVariant text-textSecondary hover:bg-borderLight hover:text-textPrimary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-outlineVariant bg-surface py-2 pl-8 pr-3 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Users List */}
        <div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm min-w-0">
          <div className="flex items-center gap-2 border-b border-borderLight bg-surfaceVariant/30 px-5 py-4">
            <Star className="h-4 w-4 text-success" />
            <h2 className="text-sm font-bold text-textPrimary">User Moderation List</h2>
            <span className="ml-auto text-xs font-medium text-textTertiary">{filteredUsers.length} users</span>
          </div>
          <div className="divide-y divide-borderLight">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surfaceVariant/40 sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
                    {u.name[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-textPrimary">
                      {u.name}
                    </div>
                    <div className="truncate text-xs text-textTertiary">
                      {u.email}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <TrustBadge score={u.score} compact={true} />
                  
                  <button
                    onClick={() => {
                      setError("");
                      setAdjustUser(u);
                      setAdjustVal("");
                      setAdjustReason("");
                    }}
                    title="Adjust Trust Score"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-surfaceVariant border border-borderLight p-2 text-xs font-bold text-textSecondary transition hover:border-primary hover:text-primary sm:px-3 sm:py-2"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Adjust</span>
                  </button>

                  <Link
                    href={`/users/${u.id}`}
                    title="Open User Profile"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primaryLight p-2 text-xs font-bold text-primary transition hover:bg-primary/20 sm:px-3 sm:py-2"
                  >
                    <span className="hidden sm:inline">View Profile</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-textTertiary">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
