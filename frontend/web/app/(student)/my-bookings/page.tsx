"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

type BookingStatus = "active" | "pending" | "completed" | "cancelled";

const MOCK_BOOKINGS = [
	{
		id: "b1",
		item: "Sony Alpha A7III",
		owner: "Arif H.",
		dates: "May 10 - May 12",
		status: "active" as BookingStatus,
		total: 1000,
		image:
			"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=150",
	},
	{
		id: "b2",
		item: "Arduino Mega 2560 Kit",
		owner: "Nusrat J.",
		dates: "May 15 - May 20",
		status: "pending" as BookingStatus,
		total: 250,
		image:
			"https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=200&h=150",
	},
	{
		id: "b3",
		item: "Calculus Textbook Vol 2",
		owner: "Sam I.",
		dates: "Apr 1 - Apr 30",
		status: "completed" as BookingStatus,
		total: 300,
		image:
			"https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=150",
	},
];

const STATUS_STYLES: Record<
	BookingStatus,
	{ label: string; className: string }
> = {
	active: {
		label: "Active",
		className: "bg-emerald-100 text-emerald-700",
	},
	pending: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-700",
	},
	completed: {
		label: "Completed",
		className: "bg-successLight text-successDark border border-successLight",
	},
	cancelled: {
		label: "Cancelled",
		className: "bg-errorLight text-errorDark border border-errorLight",
	},
};

export default function MyBookingsPage() {
	const [activeTab, setActiveTab] = useState("All");

	const filteredBookings =
		activeTab === "All"
			? MOCK_BOOKINGS
			: MOCK_BOOKINGS.filter(
				(b) => b.status.toLowerCase() === activeTab.toLowerCase()
			);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				My Bookings
			</h1>

			{/* Tabs */}
			<div className="flex border-b border-borderLight -mb-2">
				{["All", "Active", "Pending", "Completed", "Cancelled"].map(
					(tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-3 text-sm font-semibold transition-colors ${
								activeTab === tab
									? "border-b-2 border-primary text-primary"
									: "text-textSecondary hover:text-textPrimary"
							}`}
						>
							{tab}
						</button>
					)
				)}
			</div>

			{/* Empty State */}
			{filteredBookings.length === 0 && (
				<p className="text-center text-textSecondary py-10">
					{activeTab === "All"
						? "No bookings found"
						: `You have no ${activeTab.toLowerCase()} bookings`}
				</p>
			)}

			{/* Booking Cards */}
			<div className="space-y-4 pt-2">
				{filteredBookings.map((b) => {
					const statusMeta = STATUS_STYLES[b.status];

					return (
						<div
							key={b.id}
							className="bg-surfaceVariant border border-borderLight rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5"
						>
							{/* Image */}
							<div className="relative w-full sm:w-24 h-24 shrink-0">
								<Image
									src={b.image}
									alt={`${b.item} booking item`}
									fill
									className="object-cover rounded-xl border border-borderLight"
								/>
							</div>

							{/* Info */}
							<div className="flex-1 w-full text-left">
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
									<h3 className="font-bold text-textPrimary truncate text-lg">
										{b.item}
									</h3>

									<span
										className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${statusMeta.className}`}
									>
										{statusMeta.label}
									</span>
								</div>

								<div className="text-sm text-textSecondary space-y-1">
									<div className="flex items-center gap-1.5">
										<Clock className="w-4 h-4 text-primary" />
										{b.dates}
									</div>

									<div className="flex items-center gap-1.5 mt-1">
										From:
										<strong className="text-textPrimary">
											{b.owner}
										</strong>
										•
										Total:
										<strong className="text-primary font-bold">
											৳ {b.total}
										</strong>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
								{b.status === "active" && (
									<button className="px-4 py-2 bg-successLight text-successDark border border-successLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-success hover:text-white">
										Confirm Return
									</button>
								)}

								{b.status === "pending" && (
									<button className="px-4 py-2 bg-errorLight text-errorDark border border-errorLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-error hover:text-white">
										Cancel Request
									</button>
								)}

								{b.status === "completed" && (
									<Link
										href={`/borrow/review/${b.id}`}
										className="px-4 py-2 bg-primaryLight text-primary border border-primaryLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-primary hover:text-white flex justify-center items-center gap-1"
									>
										Leave Review
										<ArrowRight className="w-3 h-3" />
									</Link>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}