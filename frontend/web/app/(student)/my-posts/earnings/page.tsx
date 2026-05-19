"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, ArrowUpRight, Clock } from "lucide-react";

const earningsData = {
	total: 8700,
	pending: 5000,
	penalty: 0,
	items: [
		{
			id: "p1",
			title: "Sony Alpha A7III DSLR Camera",
			days: 15,
			amount: 7500,
		},
		{
			id: "p2",
			title: "Arduino Mega 2560 Kit",
			days: 24,
			amount: 1200,
		},
	],
};

export default function EarningsPage() {
	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to My Posts
			</Link>

			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Earnings Dashboard
			</h1>

			{/* EMPTY STATE */}
			{earningsData.items.length === 0 && (
				<div className="bg-surface border border-borderLight p-10 rounded-2xl text-center text-textSecondary text-sm">
					No earnings yet.
				</div>
			)}

			{/* STATS */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-surface border border-borderLight p-6 rounded-2xl shadow-sm">
					<div className="w-10 h-10 bg-successLight text-success rounded-xl flex items-center justify-center mb-3">
						<DollarSign className="w-5 h-5" />
					</div>
					<div className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">
						Total Earnings
					</div>
					<div className="text-3xl font-extrabold text-textPrimary">
						৳ {earningsData.total}
					</div>
				</div>

				<div className="bg-surface border border-borderLight p-6 rounded-2xl shadow-sm">
					<div className="w-10 h-10 bg-primaryLight text-primary rounded-xl flex items-center justify-center mb-3">
						<Clock className="w-5 h-5" />
					</div>
					<div className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">
						Pending Deposits
					</div>
					<div className="text-3xl font-extrabold text-textPrimary">
						৳ {earningsData.pending}
					</div>
				</div>

				<div className="bg-surface border border-borderLight p-6 rounded-2xl shadow-sm">
					<div className="w-10 h-10 bg-errorLight text-error rounded-xl flex items-center justify-center mb-3">
						<ArrowUpRight className="w-5 h-5" />
					</div>
					<div className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">
						Penalties Received
					</div>
					<div className="text-3xl font-extrabold text-textPrimary">
						৳ {earningsData.penalty}
					</div>
				</div>
			</div>

			{/* BREAKDOWN */}
			{earningsData.items.length > 0 && (
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-6 space-y-6 mt-6">
					<h2 className="text-lg font-bold text-textPrimary">
						Breakdown by Item
					</h2>

					<div className="divide-y divide-borderLight">
						{earningsData.items.map((item) => (
							<div
								key={item.id}
								className="py-4 flex justify-between items-center">
								<div>
									<div className="font-bold text-textPrimary text-sm">
										{item.title}
									</div>
									<div className="text-xs text-textSecondary">
										{item.days} Rental Days Total
									</div>
								</div>

								<div className="font-extrabold text-success">
									৳ {item.amount}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="bg-surface border border-borderLight p-8 text-center rounded-2xl text-sm font-semibold text-textSecondary">
				[ Chart mock area: Monthly earnings bar chart ]
			</div>
		</div>
	);
}