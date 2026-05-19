"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Shield,
	Info,
	CheckCircle2,
	Clock,
	AlertCircle,
} from "lucide-react";

export default function DepositTrackerPage() {
	const [activeTab, setActiveTab] = useState("active");

	const activeDeposits = [
		{
			id: "D001",
			itemName: "Sony Alpha A7III Camera",
			amount: 5000,
			status: "held",
			borrower: "John Doe",
			borrowerId: "STU001",
			dateHeld: "2024-01-15",
			returnDate: "2024-01-22",
		},
		{
			id: "D002",
			itemName: "MacBook Pro 14-inch",
			amount: 15000,
			status: "held",
			borrower: "Jane Smith",
			borrowerId: "STU002",
			dateHeld: "2024-01-10",
			returnDate: "2024-01-25",
		},
	];

	const completedDeposits = [
		{
			id: "D003",
			itemName: "DJI Mavic Air 2 Drone",
			amount: 8000,
			status: "released",
			borrower: "Mike Johnson",
			borrowerId: "STU003",
			dateHeld: "2024-01-01",
			dateReleased: "2024-01-08",
		},
		{
			id: "D004",
			itemName: "Canon EOS R5 Camera",
			amount: 12000,
			status: "refunded",
			borrower: "Emily Brown",
			borrowerId: "STU004",
			dateHeld: "2023-12-20",
			dateReleased: "2023-12-27",
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "held":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "released":
				return "bg-green-100 text-green-800 border-green-200";
			case "refunded":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "held":
				return <Clock className="w-4 h-4" />;
			case "released":
				return <CheckCircle2 className="w-4 h-4" />;
			case "refunded":
				return <Info className="w-4 h-4" />;
			default:
				return <Info className="w-4 h-4" />;
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<div className="flex items-center justify-between">
				<Link
					href="/borrow"
					className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
					<ArrowLeft className="w-4 h-4" />
					Back to Borrow
				</Link>

				<h1 className="text-2xl font-extrabold text-textPrimary">
					Deposit Tracker
				</h1>

				<div className="w-24"></div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 bg-surface border border-borderLight rounded-xl p-1">
				<button
					onClick={() => setActiveTab("active")}
					className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
						activeTab === "active"
							? "bg-primary text-white shadow-sm"
							: "text-textSecondary hover:bg-surfaceVariant"
					}`}>
					Active Deposits
				</button>

				<button
					onClick={() => setActiveTab("completed")}
					className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
						activeTab === "completed"
							? "bg-primary text-white shadow-sm"
							: "text-textSecondary hover:bg-surfaceVariant"
					}`}>
					Completed Deposits
				</button>
			</div>

			{/* Content */}
			<div className="space-y-4">
				{activeTab === "active" &&
					activeDeposits.map((deposit) => (
						<div key={deposit.id} className="card">
							{/* same UI */}
						</div>
					))}

				{activeTab === "completed" &&
					completedDeposits.map((deposit) => (
						<div key={deposit.id} className="card">
							{/* same UI */}
						</div>
					))}
			</div>
		</div>
	);
}
