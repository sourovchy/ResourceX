"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const WS_ENDPOINT =
	(process.env.NEXT_PUBLIC_API_BASE_URL ??
		(typeof window === "undefined" ? "http://localhost:8082" : "")) +
	"/ws-endpoint";

export default function NotifBell({ className }: { className?: string }) {
	const router = useRouter();
	const { user } = useAuth();
	const [count, setCount] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const stompClientRef = useRef<Client | null>(null);

	const fetchCount = async () => {
		try {
			const res = await api.get<{ unreadCount: number }>(
				"/notifications/user/unread-count",
			);
			setCount(res.data?.unreadCount ?? 0);
		} catch {
			// Non-fatal — silently ignore polling errors
		}
	};

	useEffect(() => {
		fetchCount();
		intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	useEffect(() => {
		if (!user?.userId) return;

		const client = new Client({
			webSocketFactory: () => new SockJS(WS_ENDPOINT),
			reconnectDelay: 5000,
			onConnect: () => {
				client.subscribe(`/topic/notifications/${user.userId}`, (frame) => {
					try {
						const notification = JSON.parse(frame.body) as { isRead?: boolean };
						if (!notification.isRead) {
							setCount((current) => current + 1);
						}
					} catch {
						// Ignore malformed frames; polling remains the fallback.
					}
				});
			},
		});

		client.activate();
		stompClientRef.current = client;

		return () => {
			client.deactivate();
			stompClientRef.current = null;
		};
	}, [user?.userId]);

	const hasNotifications = count > 0;

	return (
		<button
			type="button"
			aria-label={
				hasNotifications ? `Notifications, ${count} unread` : "Notifications"
			}
			onClick={() => router.push("/notifications")}
			className={className || "relative flex h-9 w-9 items-center justify-center rounded-full text-textSecondary transition-all duration-200 hover:bg-surfaceVariant hover:text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:h-10 sm:w-10"}>
			<Bell className="h-5 w-5" />

			{hasNotifications && (
				<span
					aria-hidden="true"
					className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-[18px] text-white shadow-sm">
					{count > 9 ? "9+" : count}
				</span>
			)}
		</button>
	);
}
