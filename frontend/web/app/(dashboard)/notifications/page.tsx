"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	CheckCircle2,
	AlertTriangle,
	AlertOctagon,
	DollarSign,
	PackageOpen,
	Inbox,
	Bell,
	Check,
} from "lucide-react";
import api from "@/lib/api";

type NotificationItem = {
	id: number;
	type: string;
	title: string;
	message: string;
	time: string;
	isRead: boolean;
};

type NotificationApiResponse =
	| {
		notifications?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;



function formatRelativeTime(dateString?: string) {
	if (!dateString) return "Recently";

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

	return date.toLocaleDateString();
}

function normalizeNotification(raw: any): NotificationItem {
	return {
		id: Number(raw?.id ?? raw?.notificationId ?? Date.now()),
		type: raw?.type ?? raw?.notificationType ?? "general",
		title: raw?.title ?? "Notification",
		message: raw?.message ?? raw?.content ?? "",
		time: formatRelativeTime(raw?.createdAt ?? raw?.time ?? raw?.date),
		isRead: Boolean(raw?.isRead ?? raw?.read ?? false),
	};
}

function extractNotifications(payload: NotificationApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.notifications ?? root.data ?? root.content ?? payload;

	if (!Array.isArray(source)) {
		return [] as NotificationItem[];
	}

	return source.map((item: any) => normalizeNotification(item));
}

function getNotificationStyle(type: string) {
	switch (type.toLowerCase()) {
		case "return_reminder":
			return {
				icon: <AlertTriangle className="w-5 h-5 text-warningDark" />,
				bgColor: "bg-warningLight",
			};

		case "booking_request":
			return {
				icon: <Inbox className="w-5 h-5 text-primary" />,
				bgColor: "bg-primaryLight",
			};

		case "booking_approved":
			return {
				icon: <CheckCircle2 className="w-5 h-5 text-success" />,
				bgColor: "bg-successLight",
			};

		case "deposit_released":
			return {
				icon: <DollarSign className="w-5 h-5 text-success" />,
				bgColor: "bg-successLight",
			};

		case "item_approved":
			return {
				icon: <PackageOpen className="w-5 h-5 text-dashboardBlue" />,
				bgColor: "bg-dashboardBlueTint",
			};

		case "penalty_applied":
			return {
				icon: <AlertOctagon className="w-5 h-5 text-error" />,
				bgColor: "bg-errorLight",
			};

		default:
			return {
				icon: <Bell className="w-5 h-5 text-primary" />,
				bgColor: "bg-primaryLight",
			};
	}
}

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadNotifications = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedNotifications: NotificationItem[] = [];

				try {
					const response = await api.get("/notifications/user/all");
					const normalized = extractNotifications(response.data);

					if (normalized.length > 0) {
						loadedNotifications = normalized;
					}
				} catch {
					// Handle error
				}

				if (!active) return;

				setNotifications(loadedNotifications);
			} catch (err) {
				if (!active) return;
				setError(
					err instanceof Error
						? err.message
						: "Failed to load notifications.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadNotifications();

		return () => {
			active = false;
		};
	}, []);

	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.isRead).length,
		[notifications],
	);

	const markAllRead = async () => {
		setNotifications((prev) =>
			prev.map((n) => ({ ...n, isRead: true })),
		);

		try {
			await api.patch("/notifications/user/read-all");
		} catch {
			// Silent fail for optimistic UI.
		}
	};

	const markAsRead = async (id: number) => {
		setNotifications((prev) =>
			prev.map((n) =>
				n.id === id ? { ...n, isRead: true } : n,
			),
		);

		try {
			await api.patch(`/notifications/${id}/read`);
		} catch {
			// Silent fail for optimistic UI.
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="relative">
						<Bell className="w-7 h-7 text-textPrimary" />
						{unreadCount > 0 && (
							<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
								{unreadCount}
							</span>
						)}
					</div>
					<div>
						<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
							Notifications
						</h1>
						<p className="text-sm text-textSecondary mt-1">
							Stay updated on your account activity.
						</p>
					</div>
				</div>

				{unreadCount > 0 && (
					<button
						onClick={markAllRead}
						className="flex items-center gap-2 text-sm font-bold text-primary bg-primaryLight/50 hover:bg-primaryLight px-4 py-2 rounded-xl transition-colors">
						<Check className="w-4 h-4" /> Mark all as read
					</button>
				)}
			</div>

			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden flex flex-col">
				{loading ? (
					<div className="p-12 text-center text-textSecondary">
						Loading notifications...
					</div>
				) : error ? (
					<div className="p-12 text-center text-error font-medium">
						{error}
					</div>
				) : (
					<div className="divide-y divide-borderLight">
						{notifications.map((n) => {
							const style = getNotificationStyle(n.type);

							return (
								<div
									key={n.id}
									onClick={() => void markAsRead(n.id)}
									className={`p-6 flex flex-col sm:flex-row gap-5 cursor-pointer transition-colors ${n.isRead ? "bg-surface hover:bg-surfaceVariant/50" : "bg-primaryLight/10 hover:bg-primaryLight/20"}`}>
									<div
										className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${style.bgColor}`}>
										{style.icon}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-start gap-4 mb-1">
											<h3
												className={`font-bold text-textPrimary ${n.isRead ? "text-base" : "text-lg"}`}>
												{n.title}
											</h3>
											{!n.isRead && (
												<span className="shrink-0 w-2.5 h-2.5 rounded-full bg-primary mt-2"></span>
											)}
										</div>

										<p
											className={`text-textSecondary ${!n.isRead && "text-textPrimary font-medium"}`}>
											{n.message}
										</p>

										<div className="text-xs text-textTertiary font-medium mt-3">
											{n.time}
										</div>
									</div>
								</div>
							);
						})}

						{notifications.length === 0 && (
							<div className="p-12 text-center text-textSecondary">
								<Bell className="w-12 h-12 text-outline mx-auto mb-4" />
								You have no notifications.
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
