"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	AlertCircle,
	ArrowLeft,
	Check,
	Clock,
	Loader2,
	MessageSquare,
	Shield,
	X,
} from "lucide-react";
import api from "@/lib/api";

type RequestStatus = "Pending" | "Approved" | "Rejected";

type RequestItem = {
	id: string;
	postId: string;
	item: string;
	renterName: string;
	trustScore: number;
	dates: string;
	message: string;
	status: RequestStatus;
	rejectionReason?: string;
	createdAt?: string;
};

type RawRequest = {
	id?: string | number;
	requestId?: string | number;
	bookingId?: string | number;
	postId?: string | number;
	itemId?: string | number;
	itemTitle?: string;
	title?: string;
	item?: {
		title?: string;
	};
	renterName?: string;
	renter?: {
		name?: string;
		fullName?: string;
	};
	trustScore?: number;
	reviewerScore?: number;
	message?: string;
	bookingMessage?: string;
	dates?: string;
	startDate?: string;
	endDate?: string;
	status?: string;
	rejectionReason?: string;
	createdAt?: string;
	[item: string]: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const getAuthToken = () => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("campusvault_token");
};

const toRequestStatus = (value: unknown): RequestStatus => {
	const normalized = String(value ?? "").toUpperCase();
	if (normalized === "APPROVED" || normalized === "ACCEPTED") return "Approved";
	if (normalized === "REJECTED" || normalized === "DECLINED") return "Rejected";
	return "Pending";
};

const unwrapRequests = (payload: unknown): RawRequest[] => {
	if (Array.isArray(payload)) return payload as RawRequest[];
	if (payload && typeof payload === "object") {
		const record = payload as Record<string, unknown>;
		const candidate =
			record.data ?? record.requests ?? record.items ?? record.results ?? record.content;
		if (Array.isArray(candidate)) return candidate as RawRequest[];
	}
	return [];
};

const toSafeNumber = (value: unknown, fallback = 0) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

const formatDates = (request: RawRequest) => {
	if (request.dates) return String(request.dates);
	if (request.startDate || request.endDate) {
		const start = request.startDate ? new Date(String(request.startDate)) : null;
		const end = request.endDate ? new Date(String(request.endDate)) : null;
		const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
		const startLabel = start && !Number.isNaN(start.getTime()) ? start.toLocaleDateString(undefined, options) : "Start";
		const endLabel = end && !Number.isNaN(end.getTime()) ? end.toLocaleDateString(undefined, options) : "End";
		return `${startLabel} - ${endLabel}`;
	}
	return "Requested rental";
};

const mapRequest = (request: RawRequest): RequestItem => ({
	id: String(request.id ?? request.requestId ?? request.bookingId ?? `${request.postId ?? "request"}-${request.createdAt ?? Date.now()}`),
	postId: String(request.postId ?? request.itemId ?? ""),
	item: request.itemTitle || request.title || request.item?.title || "Untitled item",
	renterName:
		request.renterName || request.renter?.name || request.renter?.fullName || "Unknown renter",
	trustScore: toSafeNumber(request.trustScore ?? request.reviewerScore, 0),
	dates: formatDates(request),
	message: request.message || request.bookingMessage || "No message provided.",
	status: toRequestStatus(request.status),
	rejectionReason: request.rejectionReason ? String(request.rejectionReason) : undefined,
	createdAt: request.createdAt ? String(request.createdAt) : undefined,
});

const requestEndpointCandidates = (postId: string | null) => {
	const base = postId
		? [`/bookings/requests?postId=${encodeURIComponent(postId)}`, `/booking-requests?postId=${encodeURIComponent(postId)}`, `/requests?postId=${encodeURIComponent(postId)}`]
		: ["/bookings/requests", "/booking-requests", "/requests"];
	return base;
};

const actionEndpointCandidates = (requestId: string, action: "approve" | "reject") => {
	if (action === "approve") {
		return [
			`/bookings/requests/${requestId}/approve`,
			`/booking-requests/${requestId}/approve`,
			`/requests/${requestId}/approve`,
			`/bookings/${requestId}/approve`,
		];
	}

	return [
		`/bookings/requests/${requestId}/reject`,
		`/booking-requests/${requestId}/reject`,
		`/requests/${requestId}/reject`,
		`/bookings/${requestId}/reject`,
	];
};

async function tryGetRequests(postId: string | null): Promise<RequestItem[]> {
	const token = getAuthToken();
	if (!token) {
		throw new Error("Please sign in to view booking requests.");
	}

	let lastError: unknown = null;

	for (const endpoint of requestEndpointCandidates(postId)) {
		try {
			const res = await api.get(endpoint, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return unwrapRequests(res.data).map(mapRequest);
		} catch (err) {
			lastError = err;
		}
	}

	if (lastError instanceof Error) throw lastError;
	throw new Error("Failed to load booking requests.");
}

async function tryAction(
	requestId: string,
	action: "approve" | "reject",
	payload?: Record<string, unknown>,
) {
	const token = getAuthToken();
	if (!token) {
		throw new Error("Please sign in to manage booking requests.");
	}

	let lastError: unknown = null;
	for (const endpoint of actionEndpointCandidates(requestId, action)) {
		try {
			return await api.post(endpoint, payload ?? {}, {
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch (err) {
			lastError = err;
		}
	}

	if (lastError instanceof Error) throw lastError;
	throw new Error(`Failed to ${action} request.`);
}

export default function RequestsPage() {
	const searchParams = useSearchParams();
	const postId = searchParams.get("postId");

	const [requests, setRequests] = useState<RequestItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState<RequestStatus | "All">("Pending");

	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError("");

			try {
				const liveRequests = await tryGetRequests(postId);
				setRequests(liveRequests);
			} catch (err: any) {
				console.error("Failed to load requests", err);
				setError(err?.response?.data?.message || err.message || "Failed to load booking requests.");
				setRequests([]);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [postId]);

	const postFiltered = useMemo(() => {
		return postId ? requests.filter((r) => r.postId === postId) : requests;
	}, [postId, requests]);

	const filteredReqs = useMemo(() => {
		return filter === "All" ? postFiltered : postFiltered.filter((r) => r.status === filter);
	}, [filter, postFiltered]);

	const counts = useMemo(() => {
		const scope = postFiltered;
		return {
			Pending: scope.filter((r) => r.status === "Pending").length,
			Approved: scope.filter((r) => r.status === "Approved").length,
			Rejected: scope.filter((r) => r.status === "Rejected").length,
			All: scope.length,
		};
	}, [postFiltered]);

	const approveRequest = async (id: string) => {
		setBusyRequestId(id);
		setError("");
		try {
			await tryAction(id, "approve");
			setRequests((prev) =>
				prev.map((r) =>
					r.id === id ? { ...r, status: "Approved", rejectionReason: undefined } : r,
				),
			);
		} catch (err: any) {
			console.error("Approve failed", err);
			setError(err?.response?.data?.message || err.message || "Failed to approve request.");
		} finally {
			setBusyRequestId(null);
		}
	};

	const openRejectModal = (id: string) => {
		setSelectedRequestId(id);
		setRejectionReason("");
		setRejectModalOpen(true);
	};

	const closeRejectModal = () => {
		setRejectModalOpen(false);
		setSelectedRequestId(null);
		setRejectionReason("");
	};

	const confirmReject = async () => {
		if (!selectedRequestId) return;

		const reason = rejectionReason.trim();
		if (!reason) return;

		setBusyRequestId(selectedRequestId);
		setError("");

		try {
			await tryAction(selectedRequestId, "reject", { reason });
			setRequests((prev) =>
				prev.map((r) =>
					r.id === selectedRequestId
						? { ...r, status: "Rejected", rejectionReason: reason }
						: r,
				),
			);
			closeRejectModal();
		} catch (err: any) {
			console.error("Reject failed", err);
			setError(err?.response?.data?.message || err.message || "Failed to reject request.");
		} finally {
			setBusyRequestId(null);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-3 px-3 py-16 text-center sm:px-4 sm:py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">Loading booking requests...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" /> Back to My Posts
			</Link>

			<div className="space-y-1">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					Booking Requests
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					Review renter requests, approve the right booking, or reject with a reason.
				</p>
			</div>

			{error && <div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">{error}</div>}

			<div className="flex flex-wrap gap-2 border-b border-borderLight">
				{(["Pending", "Approved", "Rejected", "All"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setFilter(tab)}
						className={`rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors ${
							filter === tab
								? "border-b-2 border-primary text-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{tab} ({counts[tab]})
					</button>
				))}
			</div>

			<div className="space-y-4">
				{filteredReqs.map((req) => {
					const isBusy = busyRequestId === req.id;

					return (
						<div key={req.id} className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5">
							<div className="flex flex-col gap-2 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<h3 className="truncate text-lg font-bold text-textPrimary">
										{req.item}
									</h3>
									<div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-primary">
										<Clock className="h-4 w-4" /> {req.dates}
									</div>
								</div>

								<div
									className={`self-start rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
										req.status === "Pending"
											? "bg-warningLight text-warningDark"
											: req.status === "Approved"
												? "bg-successLight text-successDark"
												: "bg-errorLight text-error"
									}`}>
									{req.status}
								</div>
							</div>

							<div className="space-y-3 rounded-xl bg-surfaceVariant p-4">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div className="text-sm font-bold text-textPrimary">
										Requested by: {req.renterName}
									</div>

									<div className="flex items-center gap-1 self-start rounded-md bg-successLight px-2 py-0.5 text-xs font-bold text-success">
										<Shield className="h-3.5 w-3.5" /> Trust {req.trustScore}
									</div>
								</div>

								<div className="flex items-start gap-2 border-t border-borderLight pt-2 text-sm text-textSecondary">
									<MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
									<p className="italic">&quot;{req.message}&quot;</p>
								</div>

								{req.status === "Rejected" && req.rejectionReason && (
									<div className="flex gap-2 rounded-xl border border-error/20 bg-errorLight/40 p-3 text-sm text-error">
										<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
										<div>
											<p className="font-bold">Rejection reason</p>
											<p>{req.rejectionReason}</p>
										</div>
									</div>
								)}
							</div>

							{req.status === "Pending" && (
								<div className="flex flex-col gap-3 sm:flex-row">
									<button
										onClick={() => approveRequest(req.id)}
										disabled={isBusy}
										className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60">
										{isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
										Approve
									</button>
									<button
										onClick={() => openRejectModal(req.id)}
										disabled={isBusy}
										className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-error bg-surface py-3 font-bold text-error transition-colors hover:bg-errorLight disabled:cursor-not-allowed disabled:opacity-60">
										<X className="h-4 w-4" /> Reject
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{filteredReqs.length === 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface p-8 text-center text-textSecondary">
					No {filter.toLowerCase()} requests{postId && " for this item"}.
				</div>
			)}

			{rejectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-lg space-y-5 rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-xl font-bold text-textPrimary">Reject Request</h2>
								<p className="mt-1 text-sm text-textSecondary">
									Provide a reason so the renter understands why it was rejected.
								</p>
							</div>

							<button type="button" onClick={closeRejectModal} className="text-textSecondary hover:text-textPrimary">
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">Rejection Reason</label>
							<textarea
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								placeholder="Example: The item is already booked for these dates."
								className="w-full resize-none rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							/>
						</div>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={closeRejectModal}
								className="flex-1 rounded-xl border border-borderLight py-3 font-bold text-textPrimary transition-colors hover:bg-surfaceVariant">
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmReject}
								disabled={!rejectionReason.trim() || !!busyRequestId}
								className={`flex-1 rounded-xl py-3 font-bold transition-colors ${
									rejectionReason.trim() && !busyRequestId
										? "bg-error text-white hover:opacity-90"
										: "cursor-not-allowed bg-outlineVariant text-textSecondary"
								}`}>
								{busyRequestId ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm Reject"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
