"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Shield, Info, CheckCircle2 } from "lucide-react";

export default function BookItemPage({ params }: { params: { id: string } }) {
	const [days, setDays] = useState(1);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const item = {
		id: params.id,
		title: "Sony Alpha A7III DSLR Camera",
		pricePerDay: 500,
		deposit: 5000,
	};

	const totalRental = item.pricePerDay * days;
	const finalTotal = totalRental + item.deposit;

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href={`/borrow/item/${params.id}`}
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Item
			</Link>

			<div className="bg-surface border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-extrabold text-textPrimary">
						Request to Book
					</h1>
					<p className="text-textSecondary mt-1">{item.title}</p>
				</div>

				<div className="space-y-6">
					{/* Dates */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Start Date
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								End Date
							</label>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
							/>
						</div>
					</div>

					{/* Quick days selector for mock purposes */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
							Or Select Duration (Days)
						</label>
						<div className="flex items-center gap-4">
							<input
								type="range"
								min="1"
								max="14"
								value={days}
								onChange={(e) => setDays(parseInt(e.target.value))}
								className="flex-1 accent-primary"
							/>
							<span className="w-12 text-center text-lg font-bold text-textPrimary bg-surfaceVariant py-1 rounded-lg border border-borderLight">
								{days}
							</span>
						</div>
					</div>

					{/* Summary */}
					<div className="bg-surfaceVariant border border-borderLight rounded-xl p-5 space-y-4">
						<h3 className="font-bold text-textPrimary text-sm uppercase tracking-wider">
							Payment Summary
						</h3>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between text-textSecondary">
								<span>
									৳ {item.pricePerDay} × {days} days
								</span>
								<span className="font-medium text-textPrimary">
									৳ {totalRental}
								</span>
							</div>
							<div className="flex justify-between text-textSecondary">
								<span className="flex items-center gap-1">
									Refundable Deposit <Info className="w-3.5 h-3.5" />
								</span>
								<span className="font-medium text-textPrimary">
									৳ {item.deposit}
								</span>
							</div>
							<div className="pt-3 mt-3 border-t border-borderLight flex justify-between items-center text-base">
								<span className="font-bold text-textPrimary">
									Total Due Now
								</span>
								<span className="text-2xl font-extrabold text-primary">
									৳ {finalTotal}
								</span>
							</div>
						</div>
					</div>

					{/* Trust Notice */}
					<div className="flex items-start gap-3 bg-primaryLight border border-primary/20 p-4 rounded-xl text-sm">
						<Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
						<div className="text-primaryDark">
							<strong className="block mb-0.5">
								CampusVault Payment Protection
							</strong>
							Your deposit is held securely and returned automatically after the
							item is safely returned.
						</div>
					</div>

					<button
						className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-sm hover:bg-primaryDark transition-colors flex justify-center items-center gap-2"
						onClick={(e) => {
							e.preventDefault();
							alert("Mock Booking Request Submitted!");
						}}>
						Confirm Booking Request
					</button>
					<p className="text-center text-xs text-textSecondary">
						You won&apos;t be charged until the owner approves.
					</p>
				</div>
			</div>
		</div>
	);
}
