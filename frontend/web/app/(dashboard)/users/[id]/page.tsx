"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Star,
  Shield,
  Bookmark,
  Package,
  Edit2,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock3,
  User,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import MessageModal from "@/components/misc/MessageModal";
import TrustBadge from "@/components/TrustBadge";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { TrustLevel, trustLevelFor, TRUST_LEVEL_LABEL } from "@/types/trust";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";
type SuspensionDuration =
  | "ONE_DAY"
  | "SEVEN_DAYS"
  | "FOURTEEN_DAYS"
  | "THIRTY_DAYS"
  | "PERMANENT";

const SUSPENSION_OPTIONS: {
  value: SuspensionDuration;
  label: string;
  description: string;
}[] = [
  { value: "ONE_DAY", label: "1 Day", description: "24-hour cooldown" },
  { value: "SEVEN_DAYS", label: "7 Days", description: "1-week suspension" },
  {
    value: "FOURTEEN_DAYS",
    label: "14 Days",
    description: "2-week suspension",
  },
  {
    value: "THIRTY_DAYS",
    label: "30 Days",
    description: "Extended suspension",
  },
  {
    value: "PERMANENT",
    label: "Permanent",
    description: "Scheduled deletion after 15 days",
  },
];

type TrustLogItem = {
  change: number;
  reason: string;
  date: string;
};

type BookingItem = {
  id: string;
  item: string;
  status: string;
  date: string;
};

type ListedItem = {
  id: string;
  title: string;
  status: string;
  price: string;
};

type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  phone: string;
  department: string;
  university: string;
  idCardDataUrl?: string;
  status: UserStatus;
  trustScore: number;
  registered: string;
  lastActive: string;
  warnings: number;
  verificationSubmitted: string;
  verificationDocs: string[];
  bookings: BookingItem[];
  items: ListedItem[];
  trustLog: TrustLogItem[];
  // Suspension info
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  suspendedUntil?: string | null;
  scheduledDeletionAt?: string | null;
  avatarUrl?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<UserStatus, string> = {
  VERIFIED: "bg-successLight text-success",
  PENDING: "bg-warningLight text-warning",
  SUSPENDED: "bg-errorLight text-error",
};

function mapUserStatus(raw?: string): UserStatus {
  if (raw === "ACTIVE") return "VERIFIED";
  if (raw === "SUSPENDED") return "SUSPENDED";
  return "PENDING";
}

const LEVEL_TEXT_COLOR: Record<TrustLevel, string> = {
  ELITE: "text-emerald-600",
  TRUSTED: "text-blue-600",
  STANDARD: "text-textPrimary",
  AT_RISK: "text-amber-600",
  HIGH_RISK: "text-orange-600",
  SUSPENDED_RISK: "text-error",
};

function getTrustColor(score: number) {
  return LEVEL_TEXT_COLOR[trustLevelFor(score)];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const searchParams = useSearchParams();
  const isPendingType = searchParams.get("type") === "pending";
  const { toast } = useToast();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>("PENDING");
  const [trustScore, setTrustScore] = useState(0);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState({ value: "", reason: "" });
  const [trustError, setTrustError] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [permanentConfirmOpen, setPermanentConfirmOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [duration, setDuration] = useState<SuspensionDuration>("ONE_DAY");
  const [suspensionReason, setSuspensionReason] = useState("");

  const statusColor = useMemo(() => STATUS_COLORS[userStatus], [userStatus]);
  const trustColor = useMemo(() => getTrustColor(trustScore), [trustScore]);

  const [idCardBlobUrl, setIdCardBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.idCardDataUrl) {
      setIdCardBlobUrl(null);
      return;
    }

    const url = user.idCardDataUrl;
    if (url.startsWith("data:")) {
      setIdCardBlobUrl(url);
      return;
    }

    let fetchUrl = url;
    if (
      !url.startsWith("http") &&
      !url.startsWith("/api/") &&
      !url.startsWith("/")
    ) {
      fetchUrl = `/files/${url}`;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    api
      .get(fetchUrl, { responseType: "blob", signal: controller.signal })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setIdCardBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch ID card image", err);
          setIdCardBlobUrl(null);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.idCardDataUrl]);

  // Fetch trust log after the primary user load
  const loadSecondaryData = useCallback(async (uid: string) => {
    setSecondaryLoading(true);
    try {
      const trustResult = await api
        .get(`/trust/events/user/${uid}`)
        .catch(() => null);

      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };

        if (trustResult) {
          const events: any[] = Array.isArray(trustResult.data)
            ? trustResult.data
            : [];
          updated.trustLog = events.map((e) => ({
            change: e.points ?? 0,
            reason: e.reason ?? "—",
            date: formatShortDate(e.createdAt),
          }));
        }

        return updated;
      });
    } finally {
      setSecondaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setError("Missing user ID.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

        // Primary endpoint based on type query param; fall back to the other on 404
        const primaryEndpoint = isPendingType
          ? `/admin/pending-users/${encodeURIComponent(userId!)}`
          : `/users/${encodeURIComponent(userId!)}`;
        const fallbackEndpoint = isPendingType
          ? `/users/${encodeURIComponent(userId!)}`
          : `/admin/pending-users/${encodeURIComponent(userId!)}`;

        let payload: any;
        let resolvedAsPending = isPendingType;

        try {
          const res = await api.get(primaryEndpoint, {
            signal: controller.signal,
          });
          payload = res.data;
        } catch (primaryErr: any) {
          if (controller.signal.aborted) return;
          if (primaryErr?.response?.status === 404) {
            const res = await api.get(fallbackEndpoint, {
              signal: controller.signal,
            });
            payload = res.data;
            resolvedAsPending = !isPendingType;
          } else {
            throw primaryErr;
          }
        }

        let nextUser: AdminUserDetail;

        if (resolvedAsPending) {
          nextUser = {
            id: String(payload.userId ?? payload.id ?? ""),
            name: payload.name ?? "",
            email: payload.email ?? "",
            studentId:
              payload.studentProfile?.studentId ?? payload.studentId ?? "—",
            phone: payload.studentProfile?.phone ?? payload.phone ?? "—",
            department:
              payload.studentProfile?.department ?? payload.department ?? "—",
            university:
              payload.studentProfile?.university ?? payload.university ?? "—",
            status: "PENDING",
            trustScore: 0,
            registered: formatShortDate(payload.createdAt),
            lastActive: "—",
            warnings: 0,
            verificationSubmitted: formatShortDate(payload.createdAt),
            verificationDocs:
              payload.studentProfile?.idCardDataUrl || payload.idCardDataUrl
                ? ["ID Card"]
                : [],
            idCardDataUrl:
              payload.studentProfile?.idCardDataUrl ??
              payload.idCardDataUrl ??
              undefined,
            bookings: [],
            items: [],
            trustLog: [],
            avatarUrl: payload.avatarUrl ?? undefined,
          };
        } else {
          nextUser = {
            id: String(payload.userId ?? payload.id ?? ""),
            name: payload.name ?? "",
            email: payload.email ?? "",
            studentId: payload.studentProfile?.studentId ?? "—",
            phone: payload.studentProfile?.phone ?? "—",
            department: payload.studentProfile?.department ?? "—",
            university: payload.studentProfile?.university ?? "—",
            status: mapUserStatus(payload.status),
            trustScore: payload.studentProfile?.trustScore ?? 0,
            registered: formatShortDate(payload.createdAt),
            lastActive: "—",
            warnings: 0,
            verificationSubmitted: formatShortDate(payload.createdAt),
            verificationDocs: payload.studentProfile?.idCardDataUrl
              ? ["ID Card"]
              : [],
            idCardDataUrl: payload.studentProfile?.idCardDataUrl ?? undefined,
            bookings: [],
            items: [],
            trustLog: [],
            suspensionReason: payload.suspensionReason ?? null,
            suspendedAt: payload.suspendedAt ?? null,
            suspendedUntil: payload.suspendedUntil ?? null,
            scheduledDeletionAt: payload.scheduledDeletionAt ?? null,
            avatarUrl: payload.avatarUrl ?? undefined,
          };
        }

        if (!nextUser.id) throw new Error("User data was empty.");

        setUser(nextUser);
        setUserStatus(nextUser.status);
        setTrustScore(nextUser.trustScore);
        setAdminFeedback("");

        // Load trust history in the background for non-pending users
        if (!resolvedAsPending) {
          void loadSecondaryData(userId!);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load user details.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchUser();
    return () => controller.abort();
  }, [userId, isPendingType, loadSecondaryData]);

  const handleVerify = async () => {
    try {
      await api.post(`/admin/approve/${userId}`);
      setUserStatus("VERIFIED");
      setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
      setActionDone("User approved successfully.");
      toast("User approved successfully.");
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/admin/reject/${userId}`, {
        reason: adminFeedback || "Rejected by admin",
      });
      setActionDone("User registration rejected.");
      toast("User rejected.");
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    }
  };

  const handleSuspend = async () => {
    // The reason field is enforced inline by ConfirmModal (confirm stays disabled
    // until a reason is entered); this guard is a no-op safety net.
    if (!suspensionReason.trim()) return;
    // Permanent suspension is irreversible — require an extra confirmation
    if (duration === "PERMANENT") {
      setPermanentConfirmOpen(true);
      return;
    }
    await executeSuspend();
  };

  const executeSuspend = async () => {
    try {
      await api.post(`/admin/block/${userId}`, {
        duration,
        reason: suspensionReason.trim(),
      });
      setUserStatus("SUSPENDED");
      setUser((prev) =>
        prev
          ? {
              ...prev,
              status: "SUSPENDED",
              suspensionReason: suspensionReason.trim(),
            }
          : prev,
      );
      setSuspendModalOpen(false);
      setSuspensionReason("");
      setDuration("ONE_DAY");
      toast("User suspended.");
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    }
  };

  const handleReactivate = async () => {
    try {
      await api.post(`/admin/unblock/${userId}`);
      setUserStatus("VERIFIED");
      setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
      toast("User account reactivated.");
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    }
  };

  const handleTrustAdjustment = async () => {
    const value = Number(adjustment.value);
    if (Number.isNaN(value) || value === 0) {
      setTrustError("Enter a valid non-zero adjustment amount.");
      return;
    }

    if (!adjustment.reason.trim()) {
      setTrustError("A reason is required to adjust the trust score.");
      return;
    }

    setTrustError(null);
    try {
      // Correct endpoint: PATCH /trust/admin/{userId}/adjust with { change, reason }
      await api.patch(`/trust/admin/${userId}/adjust`, {
        change: value,
        reason: adjustment.reason,
      });
      setTrustScore((prev) => Math.max(0, Math.min(200, prev + value)));
      setAdjustment({ value: "", reason: "" });
      setAdjusting(false);
      toast(`Trust score adjusted by ${value > 0 ? "+" : ""}${value}.`);
      void loadSecondaryData(userId!);
    } catch (err) {
      toast(extractErrorMessage(err), "error");
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="w-full space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0">
        <div className="h-6 w-40 animate-pulse rounded bg-surfaceVariant" />
        <Card padding="none" className="h-40 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="none" className="h-64 animate-pulse" />
          <Card padding="none" className="h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────

  if (error || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-0">
        <Link
          href="/users"
          className="mb-4 inline-flex items-center gap-1 text-sm text-textSecondary transition hover:text-textPrimary"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Users
        </Link>
        <Card padding="none" className="mt-4 p-6">
          <h1 className="text-xl font-bold text-textPrimary">
            User details unavailable
          </h1>
          <p className="mt-2 text-sm text-textSecondary">
            {error ?? "We could not load this user right now."}
          </p>
        </Card>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0 graph-grid page-enter">
      {/* Back navigation breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-textSecondary transition hover:text-textPrimary"
        >
          <ChevronLeft className="h-4 w-4" /> Users
        </Link>
        <span className="text-textTertiary">/</span>
        <span className="truncate text-textTertiary">{user.name}</span>
      </div>

      {/* Profile Card */}
      <ProfileHeaderCard
        avatarUrl={user.avatarUrl}
        initials={user.name?.[0]?.toUpperCase() ?? "?"}
        avatarBgClass="bg-primaryLight text-primary"
        name={user.name}
        nameBadge={
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor}`}
          >
            {userStatus}
          </span>
        }
        infoRows={[
          { icon: <Mail className="h-3.5 w-3.5" />, text: user.email },
          { icon: <User className="h-3.5 w-3.5" />, text: user.studentId },
          {
            text:
              [user.department, user.university]
                .filter((v) => v && v !== "—")
                .join(" · ") || "—",
          },
          { icon: <Phone className="h-3.5 w-3.5" />, text: user.phone },
          {
            icon: <Calendar className="h-3.5 w-3.5" />,
            text: `Joined ${user.registered}`,
          },
          {
            icon: <Clock3 className="h-3.5 w-3.5" />,
            text: `Last active ${user.lastActive}`,
          },
        ]}
        rightContent={
          <div className="mt-5 sm:mt-0 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="rounded-xl bg-surfaceVariant px-3 py-2 text-sm border border-borderLight shadow-sm">
              Warnings:{" "}
              <span className="font-bold text-warning">{user.warnings}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surfaceVariant px-3 py-2 text-sm border border-borderLight shadow-sm">
              <span className="text-textSecondary">Trust:</span>
              <TrustBadge score={trustScore} compact />
              <span className="text-xs text-textTertiary">
                {TRUST_LEVEL_LABEL[trustLevelFor(trustScore)]}
              </span>
            </div>
          </div>
        }
      />

      {/* Verification Details */}
      <Card padding="none" className="p-5" interactive={true} maxTilt={1}>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-textPrimary">Verification Details</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-surfaceVariant/50 p-4">
            <div className="text-xs font-bold uppercase text-textTertiary">
              Submitted
            </div>
            <div className="mt-1 text-sm font-semibold text-textPrimary">
              {user.verificationSubmitted}
            </div>
          </div>
          <div className="rounded-xl bg-surfaceVariant/50 p-4">
            <div className="text-xs font-bold uppercase text-textTertiary">
              Provided Documents
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.verificationDocs.length > 0 ? (
                user.verificationDocs.map((doc) => (
                  <div
                    key={doc}
                    className="rounded-lg bg-primaryLight px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {doc}
                  </div>
                ))
              ) : (
                <div className="text-sm font-medium text-textTertiary">
                  None provided
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-borderLight pt-5">
          <p className="mb-3 text-xs font-bold uppercase text-textTertiary">
            Student ID Card Image
          </p>
          {user.idCardDataUrl ? (
            <div className="max-w-sm overflow-hidden rounded-xl border border-borderLight">
              {idCardBlobUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob/object-URL preview; next/image cannot optimize these
                <img
                  src={idCardBlobUrl}
                  alt="Student ID Card"
                  className="max-h-[300px] w-full bg-surfaceVariant/30 object-contain"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-surfaceVariant/30 text-sm text-textTertiary">
                  Loading image...
                </div>
              )}
            </div>
          ) : (
            <div className="flex max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borderLight bg-surfaceVariant/50 px-4 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Shield className="h-5 w-5 text-textTertiary" />
              </div>
              <div className="mt-1 text-sm font-semibold text-textSecondary">
                No ID Card Uploaded
              </div>
              <div className="text-xs text-textTertiary">
                This user did not provide an ID card during registration.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-borderLight pt-5">
          <label className="mb-2 block text-xs font-bold uppercase text-textTertiary">
            Admin Feedback
          </label>
          <textarea
            value={adminFeedback}
            onChange={(e) => setAdminFeedback(e.target.value)}
            placeholder="Write verification note or suspension reason..."
            className="w-full min-h-[100px] resize-none rounded-xl border border-outlineVariant bg-surface px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />

          {actionDone ? (
            <div className="mt-4 rounded-xl bg-successLight px-4 py-3 text-sm font-semibold text-success">
              {actionDone}
            </div>
          ) : isPendingType ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleVerify}
                className="rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Approve User
              </button>
              <button
                onClick={handleReject}
                className="rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Reject User
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setMessageOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-5 py-2.5 text-sm font-bold text-textPrimary transition hover:border-primary hover:bg-primaryLight/20 hover:text-primary"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
              {userStatus === "SUSPENDED" ? (
                <button
                  onClick={handleReactivate}
                  className="rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Reactivate User
                </button>
              ) : (
                <button
                  onClick={() => setSuspendModalOpen(true)}
                  className="rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Suspend User
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Non-pending sections: trust score, activity */}
      {!isPendingType && (
        <>
          {/* Trust Score */}
          <Card padding="none" className="p-5" interactive={true} maxTilt={1}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 font-bold text-textPrimary">
                <Star className="h-4 w-4 text-success" /> Trust Score
              </h2>
              <button
                onClick={() => setAdjusting(!adjusting)}
                className="flex items-center gap-1.5 rounded-xl bg-primaryLight px-3 py-1.5 text-xs font-bold text-primary transition hover:opacity-90"
              >
                <Edit2 className="h-3.5 w-3.5" /> Adjust Score
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold ${trustColor}`}>
                  {trustScore}
                </span>
                <span className="text-base font-medium text-textTertiary">
                  / 200
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <TrustBadge score={trustScore} />
                <div className="text-sm text-textSecondary">
                  User reputation based on rental history, reviews, reports, and
                  platform activity.
                </div>
              </div>
            </div>

            {adjusting && (
              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    type="number"
                    value={adjustment.value}
                    onChange={(e) => {
                      setAdjustment({ ...adjustment, value: e.target.value });
                      if (trustError) setTrustError(null);
                    }}
                    placeholder="+10 or -5"
                    className="rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={adjustment.reason}
                    onChange={(e) => {
                      setAdjustment({ ...adjustment, reason: e.target.value });
                      if (trustError) setTrustError(null);
                    }}
                    placeholder="Adjustment reason"
                    className="rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleTrustAdjustment}
                    disabled={
                      !adjustment.value.trim() || !adjustment.reason.trim()
                    }
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Apply Adjustment
                  </button>
                </div>
                {trustError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-error animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="break-words">{trustError}</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* User Activity */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bookings */}
            <Card padding="none" className="overflow-hidden" interactive={true} maxTilt={1}>
              <div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
                <Bookmark className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-textPrimary">Booking History</h2>
              </div>
              <div className="divide-y divide-borderLight">
                {user.bookings.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-textTertiary">
                    Booking history is not available here. View all platform
                    bookings in the{" "}
                    <Link
                      href="/bookings"
                      className="font-semibold text-primary hover:underline"
                    >
                      Bookings
                    </Link>{" "}
                    section.
                  </div>
                ) : (
                  user.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 px-4 py-4 transition hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div>
                        <div className="text-sm font-semibold text-textPrimary">
                          {booking.item}
                        </div>
                        <div className="mt-1 text-xs text-textTertiary">
                          {booking.id} · {booking.date}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-primary">
                        {booking.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Listed Items */}
            <Card padding="none" className="overflow-hidden" interactive={true} maxTilt={1}>
              <div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
                <Package className="h-4 w-4 text-accent" />
                <h2 className="font-bold text-textPrimary">Listed Items</h2>
              </div>
              <div className="divide-y divide-borderLight">
                {user.items.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-textTertiary">
                    Listed items are not available here. View all items in the{" "}
                    <Link
                      href="/items"
                      className="font-semibold text-primary hover:underline"
                    >
                      Items
                    </Link>{" "}
                    section.
                  </div>
                ) : (
                  user.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 px-4 py-4 transition hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div>
                        <div className="text-sm font-semibold text-textPrimary">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-textTertiary">
                          {item.id}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-primary">
                          {item.price}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-success">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Suspension info banner — shown when user is currently suspended */}
      {userStatus === "SUSPENDED" && (
        <div className="rounded-2xl border border-error/30 bg-errorLight p-5">
          <div className="flex items-center gap-2 font-bold text-error">
            <AlertTriangle className="h-4 w-4" /> Account Suspended
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase text-textTertiary">
                Suspension Type
              </span>
              <p className="mt-0.5 font-semibold text-textPrimary">
                {user.suspendedUntil ? "Temporary" : "Permanent"}
              </p>
            </div>
            {user.suspendedUntil && (
              <div>
                <span className="text-xs font-bold uppercase text-textTertiary">
                  Suspended Until
                </span>
                <p className="mt-0.5 font-semibold text-textPrimary">
                  {formatShortDate(user.suspendedUntil)}
                </p>
              </div>
            )}
            {user.scheduledDeletionAt && (
              <div>
                <span className="text-xs font-bold uppercase text-textTertiary">
                  Scheduled Deletion
                </span>
                <p className="mt-0.5 font-semibold text-error">
                  {formatShortDate(user.scheduledDeletionAt)}
                </p>
              </div>
            )}
            {user.suspensionReason && (
              <div className="sm:col-span-2">
                <span className="text-xs font-bold uppercase text-textTertiary">
                  Reason
                </span>
                <p className="mt-0.5 text-textPrimary">
                  {user.suspensionReason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Warning */}
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warningLight p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <div className="font-bold text-warning">Administrative Note</div>
          <div className="mt-1 text-sm text-textSecondary">
            Always verify student information carefully before approval.
            Suspensions should include proper feedback and evidence for future
            moderation review.
          </div>
        </div>
      </div>

      {/* ── Suspension modal ─────────────────────────────────────────────────── */}
      {/* Hidden while the permanent-suspend confirmation is open so the two
			    dialogs never stack (avoids competing focus traps). */}
      <ConfirmModal
        isOpen={suspendModalOpen && !permanentConfirmOpen}
        isDestructive
        title="Suspend Account"
        message={`Suspending ${user.name} will immediately invalidate their active session.`}
        confirmText={
          duration === "PERMANENT" ? "Permanently Suspend" : "Suspend User"
        }
        cancelText="Cancel"
        requireReason
        reasonLabel="Suspension reason"
        reasonPlaceholder="Describe the policy violation or reason for suspension…"
        reasonValue={suspensionReason}
        onReasonChange={setSuspensionReason}
        onConfirm={handleSuspend}
        onCancel={() => {
          setSuspendModalOpen(false);
          setSuspensionReason("");
          setDuration("ONE_DAY");
        }}
      >
        {/* Duration picker */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
            Suspension Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SUSPENSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  duration === opt.value
                    ? opt.value === "PERMANENT"
                      ? "border-error bg-errorLight text-error"
                      : "border-primary bg-primaryLight text-primary"
                    : "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
                }`}
              >
                <div className="text-sm font-bold">{opt.label}</div>
                <div className="mt-0.5 text-xs opacity-70">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
          {duration === "PERMANENT" && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-errorLight px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
              <p className="text-xs text-error">
                This account will be permanently deleted after a 15-day
                retention period. This action cannot be undone.
              </p>
            </div>
          )}
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={permanentConfirmOpen}
        isDestructive
        title="Permanently Suspend Account"
        message={`Permanently suspending ${user?.name ?? "this user"} schedules their account for deletion after 15 days. This cannot be undone. Continue?`}
        confirmText="Permanently Suspend"
        cancelText="Cancel"
        onConfirm={() => {
          setPermanentConfirmOpen(false);
          void executeSuspend();
        }}
        onCancel={() => setPermanentConfirmOpen(false)}
      />

      {!isPendingType && user && userId && (
        <MessageModal
          isOpen={messageOpen}
          targetUserId={Number(userId)}
          targetName={user.name}
          onClose={() => setMessageOpen(false)}
        />
      )}
    </div>
  );
}
