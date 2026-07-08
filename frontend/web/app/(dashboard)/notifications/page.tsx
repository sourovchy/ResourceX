"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Star,
  Calendar,
  Bell,
  Check,
  Loader2,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/dateUtils";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { ListRowSkeleton } from "@/components/ui/Skeleton";

const PAGE_SIZE = 15;

type NotificationItem = {
  id: number;
  notificationType: string;
  message: string;
  time: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number | null;
};

function getNotificationTitle(type: string): string {
  switch (type.toUpperCase()) {
    case "BOOKING":
      return "Booking Update";
    case "MESSAGE":
      return "New Message";
    case "REVIEW":
      return "New Review";
    case "TRUST":
      return "Trust Score Update";
    case "ADMIN":
      return "Administrative Notice";
    default:
      return "Notification";
  }
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatShortDate(date);
}

function normalizeNotification(raw: any): NotificationItem {
  return {
    id: Number(raw?.notificationId ?? raw?.id),
    notificationType: String(raw?.notificationType ?? "ADMIN").toUpperCase(),
    message: raw?.message ?? "",
    time: formatRelativeTime(raw?.createdAt),
    isRead: Boolean(raw?.isRead),
    relatedEntityType: raw?.relatedEntityType
      ? String(raw.relatedEntityType).toUpperCase()
      : undefined,
    relatedEntityId: raw?.relatedEntityId ?? null,
  };
}

/** Map a notification to the in-app page it should open. */
function targetHref(n: NotificationItem): string | null {
  switch (n.relatedEntityType ?? n.notificationType) {
    case "BOOKING":
      return "/bookings";
    case "MESSAGE":
      return "/inbox";
    case "TRUST":
      return "/profile";
    case "REVIEW":
      return "/profile/my-reviews";
    case "ITEM":
      return "/my-posts";

    default:
      return null;
  }
}

function getNotificationStyle(type: string) {
  switch (type.toUpperCase()) {
    case "BOOKING":
      return {
        icon: <Calendar className="h-5 w-5 text-primary" />,
        bgColor: "bg-primaryLight",
      };
    case "MESSAGE":
      return {
        icon: <MessageSquare className="h-5 w-5 text-primary" />,
        bgColor: "bg-primaryLight",
      };
    case "REVIEW":
      return {
        icon: <Star className="h-5 w-5 text-warningDark" />,
        bgColor: "bg-warningLight",
      };
    case "TRUST":
      return {
        icon: <ShieldCheck className="h-5 w-5 text-success" />,
        bgColor: "bg-successLight",
      };
    default:
      return {
        icon: <Bell className="h-5 w-5 text-primary" />,
        bgColor: "bg-primaryLight",
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get<{ unreadCount: number }>(
        "/notifications/user/unread-count",
      );
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      // non-fatal
    }
  };

  const loadPage = async (p: number) => {
    const res = await api.get(`/notifications/me?page=${p}&size=${PAGE_SIZE}`);
    const data = res.data ?? {};
    const content: NotificationItem[] = Array.isArray(data.content)
      ? data.content.map(normalizeNotification)
      : [];
    setNotifications((prev) => (p === 0 ? content : [...prev, ...content]));
    setHasMore(!(data.last ?? true));
    setPage(p);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadPage(0);
        if (active) await fetchUnreadCount();
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load notifications.",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Refresh the newest page + unread count when returning to the tab.
  // (Focus-only: a polling reset would disrupt reading; the header bell already
  // keeps the unread badge live.)
  useAutoRefresh(() => {
    void loadPage(0);
    void fetchUnreadCount();
  });

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await loadPage(page + 1);
    } catch {
      // keep current list on failure
    } finally {
      setLoadingMore(false);
    }
  };

  const markAsRead = async (id: number) => {
    const target = notifications.find((n) => n.id === id);
    if (target && !target.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch {
        // optimistic — ignore
      }
    }
  };

  const handleClick = (n: NotificationItem) => {
    void markAsRead(n.id);
    const href = targetHref(n);
    if (href) router.push(href);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch("/notifications/user/read-all");
    } catch {
      // optimistic — ignore
    }
  };

  return (
    <div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8 graph-grid page-enter">
      {/* Header */}
      <div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative mt-1 sm:mt-0">
            <Bell className="h-8 w-8 text-textPrimary" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="mt-1 text-3xl font-bold tracking-tighter text-textPrimary sm:text-4xl">
              My <span className="text-gradient-brand italic">Notifications.</span>
            </h2>
            <p className="mt-2 text-sm text-textSecondary">
              Stay updated on your account activity.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl bg-primaryLight/50 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primaryLight"
          >
            <Check className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <Card padding="none" className="overflow-hidden p-2">
          <ListRowSkeleton count={6} />
        </Card>
      ) : error ? (
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="p-12 text-center font-medium text-error">{error}</div>
        </Card>
      ) : notifications.length === 0 ? (
        <PageEmpty
          icon={Bell}
          title="You're all caught up"
          description="New activity on your bookings, messages, and disputes will appear here."
        />
      ) : (
        <Card padding="none" className="flex flex-col overflow-hidden" interactive={true}>
          <div className="divide-y divide-borderLight stagger-children">
            {notifications.map((n) => {
              const style = getNotificationStyle(n.notificationType);
              const clickable = targetHref(n) !== null;
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleClick(n);
                    }
                  }}
                  className={`group flex gap-4 p-4 transition-all duration-200 ease-out sm:p-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${clickable ? "cursor-pointer" : "cursor-default"} ${
                    n.isRead
                      ? "bg-surface hover:bg-surfaceVariant hover:shadow-md md:hover:-translate-y-[1px]"
                      : "bg-primaryLight/20 hover:bg-primaryLight/40 hover:shadow-md md:hover:-translate-y-[1px]"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 ${style.bgColor}`}
                  >
                    {style.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-start justify-between gap-3">
                      <h3
                        className={`truncate text-sm transition-colors duration-200 ${
                          n.isRead
                            ? "font-semibold text-textPrimary group-hover:text-primary"
                            : "font-bold text-textPrimary group-hover:text-primary"
                        }`}
                      >
                        {getNotificationTitle(n.notificationType)}
                      </h3>
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-125" />
                      )}
                    </div>
                    <p
                      className={`text-sm transition-colors duration-200 ${
                        n.isRead
                          ? "text-textSecondary group-hover:text-textPrimary"
                          : "text-textPrimary"
                      }`}
                    >
                      {n.message}
                    </p>
                    <div className="mt-2 text-xs font-medium text-textTertiary">
                      {n.time}
                    </div>
                  </div>

                  {clickable && (
                    <div className="flex shrink-0 items-center opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                      <ChevronRight className="h-5 w-5 text-textSecondary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center justify-center gap-2 border-t border-borderLight py-4 text-sm font-semibold text-primary transition-colors hover:bg-surfaceVariant disabled:opacity-60"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </>
              ) : (
                "Load older notifications"
              )}
            </button>
          )}
        </Card>
      )}
    </div>
  );
}
