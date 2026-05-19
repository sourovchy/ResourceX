"use client";

import React, { useState } from "react";
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

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState([
		{
			id: 1,
			type: "return_reminder",
			title: "Return Due Tomorrow",
			message:
				"Your rental for 'DSLR Camera Setup' is due tomorrow by 5:00 PM.",
			time: "2 hours ago",
			isRead: false,
			icon: <AlertTriangle className="w-5 h-5 text-warningDark" />,
			bgColor: "bg-warningLight",
		},
		{
			id: 2,
			type: "booking_request",
			title: "New Booking Request Received",
			message:
				"John Doe wants to rent your 'Sony Alpha A7III' for May 10 - May 12.",
			time: "5 hours ago",
			isRead: false,
			icon: <Inbox className="w-5 h-5 text-primary" />,
			bgColor: "bg-primaryLight",
		},
		{
			id: 3,
			type: "booking_approved",
			title: "Booking Approved!",
			message:
				"Your request for 'Arduino Mega Kit' has been approved. Please pay the deposit.",
			time: "1 day ago",
			isRead: true,
			icon: <CheckCircle2 className="w-5 h-5 text-success" />,
			bgColor: "bg-successLight",
		},
		{
			id: 4,
			type: "deposit_released",
			title: "Deposit Released",
			message:
				"Good news! Your deposit of ৳ 5000 for 'MacBook Pro' has been fully released.",
			time: "2 days ago",
			isRead: true,
			icon: <DollarSign className="w-5 h-5 text-success" />,
			bgColor: "bg-successLight",
		},
		{
			id: 5,
			type: "item_approved",
			title: "Item Listing Live",
			message:
				"Admin approved your item 'Camping Tent'. It is now visible to all students.",
			time: "3 days ago",
			isRead: true,
			icon: <PackageOpen className="w-5 h-5 text-dashboardBlue" />,
			bgColor: "bg-dashboardBlueTint",
		},
		{
			id: 6,
			type: "penalty_applied",
			title: "Penalty Applied",
			message:
				"Admin approved a damage penalty of ৳ 150 against your booking of 'JBL PartyBox'.",
			time: "1 week ago",
			isRead: true,
			icon: <AlertOctagon className="w-5 h-5 text-error" />,
			bgColor: "bg-errorLight",
		},
	]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const markAllRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	};

	const markAsRead = (id: number) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
		);
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
				<div className="divide-y divide-borderLight">
					{notifications.map((n) => (
						<div
							key={n.id}
							onClick={() => markAsRead(n.id)}
							className={`p-6 flex flex-col sm:flex-row gap-5 cursor-pointer transition-colors ${n.isRead ? "bg-surface hover:bg-surfaceVariant/50" : "bg-primaryLight/10 hover:bg-primaryLight/20"}`}>
							<div
								className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${n.bgColor}`}>
								{n.icon}
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
					))}
					{notifications.length === 0 && (
						<div className="p-12 text-center text-textSecondary">
							<Bell className="w-12 h-12 text-outline mx-auto mb-4" />
							You have no notifications.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
