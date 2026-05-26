"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Shield,
	Info,
	CheckCircle2,
	Clock,
	AlertCircle,
	Loader2,
} from "lucide-react";

type DepositItem = {
	id: string;
	itemName: string;
	amount: number;
	status: string;
	borrower: string;
	borrowerId: string;
	dateHeld: string;
	returnDate?: string;
	dateReleased?: string;
};

type DepositApiResponse =
	| {
		deposits?: unknown;
		activeDeposits?: unknown;
		completedDeposits?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const DEPOSIT_ENDPOINTS = [
	"/api/deposits",
	"/api/deposit-tracker",
	"/api/bookings/deposits",
];

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token =
		localStorage.getItem("resourcex_token");

	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
}

async function fetchJson(url: string) {
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return (await response.json()) as DepositApiResponse;
}

function normalizeDeposit(raw: any): DepositItem {
	return {
		id: String(raw?.id ?? raw?.depositId ?? crypto.randomUUID()),
		itemName:
			raw?.itemName ??
			raw?.item?.title ??
			raw?.itemTitle ??
			"Unnamed Item",
		amount: Number(raw?.amount ?? raw?.depositAmount ?? 0),
		status: String(raw?.status ?? "held").toLowerCase(),
		borrower:
			raw?.borrower ??
			raw?.borrowerName ??
			raw?.userName ??
			"Unknown User",
		borrowerId:
			raw?.borrowerId ?? raw?.studentId ?? raw?.userId ?? "N/A",
		dateHeld:
			raw?.dateHeld ?? raw?.createdAt ?? raw?.holdDate ?? "",
		returnDate:
			raw?.returnDate ?? raw?.expectedReturnDate ?? undefined,
		dateReleased:
			raw?.dateReleased ?? raw?.releasedAt ?? undefined,
	};
}

function extractDeposits(payload: DepositApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.deposits ??
		root.activeDeposits ??
		root.completedDeposits ??
		root.data ??
		root.content ??
		payload;

	if (!Array.isArray(source)) {
		return [] as DepositItem[];
	}

	return source.map((item: any) => normalizeDeposit(item));
}

function formatDate(date?: string) {
	if (!date) return "—";

	return new Date(date).toLocaleDateString();
}

export default function DepositTrackerPage() {
	const [activeTab, setActiveTab] = useState("active");

	const [deposits, setDeposits] = useState<DepositItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadDeposits = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedDeposits: DepositItem[] = [];

				for (const endpoint of DEPOSIT_ENDPOINTS) {
					try {
						const payload = await fetchJson(endpoint);
						const normalized = extractDeposits(payload);

						if (normalized.length > 0) {
							loadedDeposits = normalized;
							break;
						}
					} catch {
						// try next endpoint
					}
				}

				if (!active) return;

				setDeposits(loadedDeposits);
			} catch (err) {
				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load deposits.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadDeposits();

		return () => {
			active = false;
		};
	}, []);

	const activeDeposits = useMemo(
		() =>
			deposits.filter(
				(deposit) => deposit.status === "held",
			),
		[deposits],
	);

	const completedDeposits = useMemo(
		() =>
			deposits.filter(
				(deposit) => deposit.status !== "held",
			),
		[deposits],
	);

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
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Link
					href="/borrow"
					className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
					<ArrowLeft className="w-4 h-4" />
					Back to Borrow
				</Link>

				<h1 className="text-xl font-extrabold text-textPrimary sm:text-2xl">
					Deposit Tracker
				</h1>

				<div className="hidden w-24 sm:block"></div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 overflow-x-auto rounded-xl border border-borderLight bg-surface p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<button
					onClick={() => setActiveTab("active")}
					className={`flex-1 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-bold transition-all sm:px-4 ${
						activeTab === "active"
							? "bg-primary text-white shadow-sm"
							: "text-textSecondary hover:bg-surfaceVariant"
					}`}>
					Active Deposits
				</button>

				<button
					onClick={() => setActiveTab("completed")}
					className={`flex-1 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-bold transition-all sm:px-4 ${
						activeTab === "completed"
							? "bg-primary text-white shadow-sm"
							: "text-textSecondary hover:bg-surfaceVariant"
					}`}>
					Completed Deposits
				</button>
			</div>

			{/* Content */}
			<div className="space-y-4 pb-2">
				{loading ? (
					<div className="card flex min-h-[220px] items-center justify-center gap-3 px-4 py-16 text-center text-textSecondary">
						<Loader2 className="w-5 h-5 animate-spin" />
						Loading deposits...
					</div>
				) : error ? (
					<div className="card flex items-start gap-3 border border-error bg-errorLight/20 py-6 text-errorDark">
						<AlertCircle className="w-5 h-5 shrink-0" />
						<span>{error}</span>
					</div>
				) : (
					(activeTab === "active"
						? activeDeposits
						: completedDeposits
					).map((deposit) => (
						<div
							key={deposit.id}
							className="space-y-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="break-words text-lg font-bold text-textPrimary">
										{deposit.itemName}
									</h2>
									<p className="mt-1 text-sm text-textSecondary break-words">
										Deposit ID: {deposit.id}
									</p>
								</div>

								<div
									className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:w-auto ${getStatusColor(deposit.status)}`}>
									{getStatusIcon(deposit.status)}
									{deposit.status.toUpperCase()}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="rounded-xl border border-borderLight bg-surfaceVariant p-4">
									<div className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-1">
										Borrower
									</div>
									<div className="font-semibold text-textPrimary">
										{deposit.borrower}
									</div>
									<div className="text-sm text-textSecondary mt-1">
										{deposit.borrowerId}
									</div>
								</div>

								<div className="rounded-xl border border-borderLight bg-surfaceVariant p-4">
									<div className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-1">
										Amount
									</div>
									<div className="break-words font-bold text-lg text-primary">
										৳ {deposit.amount.toLocaleString()}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
								<div className="flex items-start gap-2 text-textSecondary">
									<Clock className="w-4 h-4" />
									Held: {formatDate(deposit.dateHeld)}
								</div>

								{deposit.returnDate && (
									<div className="flex items-start gap-2 text-textSecondary">
										<Shield className="w-4 h-4" />
										Return Date: {formatDate(deposit.returnDate)}
									</div>
								)}

								{deposit.dateReleased && (
									<div className="flex items-start gap-2 text-textSecondary">
										<CheckCircle2 className="w-4 h-4" />
										Released: {formatDate(deposit.dateReleased)}
									</div>
								)}
							</div>
						</div>
					))
				)}

				{!loading &&
					!error &&
					(activeTab === "active"
						? activeDeposits.length === 0
						: completedDeposits.length === 0) && (
						<div className="card px-4 py-16 text-center text-textSecondary">
							<Shield className="w-12 h-12 mx-auto mb-4 text-outline" />
							<p className="font-semibold">
								No deposits found.
							</p>
						</div>
					)}
			</div>
		</div>
	);
}
