"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
	Tag,
	User,
	DollarSign,
	XCircle,
	Image as ImageIcon,
	Package,
	Loader2,
	ShieldAlert,
	AlertCircle,
} from "lucide-react";

import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";

type ItemStatus =
	| "AVAILABLE"
	| "PENDING"
	| "REJECTED"
	| "REMOVED"
	| "BOOKED";

interface Owner {
	userId: number | string;
	name: string;
	email: string;
	trustScore?: number;
}

interface ItemData {
	itemId: number | string;
	title: string;
	description: string;
	category: string;
	dailyRate: number;
	status: ItemStatus;
	createdAt?: string;
	imageUrls: string[];
	owner?: Owner;
}

interface ItemApiResponse {
	itemId?: number | string;
	id?: number | string;
	title?: string;
	name?: string;
	description?: string;
	category?: string;
	categoryName?: string;
	dailyRate?: number | string;
	pricePerDay?: number | string;
	status?: string;
	createdAt?: string;
	imageUrls?: string[];
	images?: string[];
	owner?: {
		userId?: number | string;
		id?: number | string;
		name?: string;
		email?: string;
		trustScore?: number;
	};
	user?: {
		userId?: number | string;
		id?: number | string;
		name?: string;
		email?: string;
		trustScore?: number;
	};
}

function normalizeStatus(status?: string): ItemStatus {
	const value = status?.toUpperCase();

	if (
		value === "AVAILABLE" ||
		value === "PENDING" ||
		value === "REJECTED" ||
		value === "REMOVED" ||
		value === "BOOKED"
	) {
		return value;
	}

	return "PENDING";
}

function normalizeItem(data: ItemApiResponse): ItemData {
	const ownerSource = data.owner ?? data.user;

	return {
		itemId: data.itemId ?? data.id ?? "",
		title: data.title ?? data.name ?? "Untitled Item",
		description: data.description ?? "No description provided.",
		category: data.category ?? data.categoryName ?? "Uncategorized",
		dailyRate: Number(data.dailyRate ?? data.pricePerDay ?? 0),
		status: normalizeStatus(data.status),
		createdAt: data.createdAt,
		imageUrls: data.imageUrls ?? data.images ?? [],
		owner: ownerSource
			? {
				userId: ownerSource.userId ?? ownerSource.id ?? "",
				name: ownerSource.name ?? "Unknown User",
				email: ownerSource.email ?? "",
				trustScore: ownerSource.trustScore,
			}
			: undefined,
	};
}

function formatDate(value?: string) {
	if (!value) return "-";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return formatShortDate(date);
}

export default function AdminItemDetailPage() {
	const { toast } = useToast();
	const params = useParams();
	const router = useRouter();

	const id = params?.id as string;

	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [removeReason, setRemoveReason] = useState("");
	const [item, setItem] = useState<ItemData | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const fetchItem = async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError("");

			const response = await api.get(`/items/${id}`);
			const raw = response.data?.data ?? response.data;

			setItem(normalizeItem(raw));
		} catch (err) {
			console.error(err);
			setError("Could not load item details.");
			setItem(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchItem();
	}, [id]);

	const statusColor = useMemo(() => {
		switch (item?.status) {
			case "AVAILABLE":
				return "bg-successLight text-success";
			case "PENDING":
				return "bg-warningLight text-warning";
			case "REJECTED":
			case "REMOVED":
				return "bg-errorLight text-error";
			default:
				return "bg-surfaceVariant text-textSecondary";
		}
	}, [item?.status]);

	const handleRemoveItem = async () => {
		if (!removeReason.trim()) {
			setError("Please provide a removal reason.");
			return;
		}

		try {
			setSubmitting(true);
			setError("");

			await api.post(`/admin/block-item/${id}?reason=${encodeURIComponent(removeReason.trim())}`);

			toast("Item removed from the marketplace.");
			router.push("/items");
		} catch (err) {
			const msg = extractErrorMessage(err);
			setError(msg);
			toast(msg, "error");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-6 w-6 animate-spin" />
				<span className="text-sm font-medium sm:text-base">Loading item details...</span>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="mx-auto max-w-4xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
				

				<div className="rounded-2xl border border-borderLight bg-surface p-6 text-center shadow-sm sm:p-8">
					<Package className="mx-auto mb-3 h-10 w-10 text-textTertiary opacity-40" />
					<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">Item not found</h1>
					<p className="mt-2 text-sm text-textSecondary sm:text-base">
						The item does not exist or could not be loaded.
					</p>
				</div>
			</div>
		);
	}

	const ownerInitial = item.owner?.name?.[0]?.toUpperCase() ?? "U";

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			

			{/* Page-level errors only — hidden while the remove modal is open so the
			    message is never trapped behind the modal (it renders inside instead). */}
			{error && !showRemoveModal && (
				<div
					role="alert"
					className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="break-words text-xl font-extrabold text-textPrimary sm:text-2xl">
								{item.title}
							</h1>

							<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor}`}>
								{item.status}
							</span>
						</div>

						<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-textSecondary">
							<span className="flex items-center gap-1">
								<Tag className="h-3.5 w-3.5" />
								{item.category}
							</span>

							<span className="flex items-center gap-1">
								<DollarSign className="h-3.5 w-3.5" />
								৳{item.dailyRate}/day
							</span>
						</div>

						<div className="mt-1 text-xs text-textTertiary">
							Submitted {formatDate(item.createdAt)} · ID: {item.itemId}
						</div>
					</div>

					<button
						onClick={() => {
							setError("");
							setRemoveReason("");
							setShowRemoveModal(true);
						}}
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 bg-errorLight px-4 py-2 text-sm font-bold text-error transition hover:bg-error/20 sm:w-auto">
						<XCircle className="h-4 w-4" />
						Remove Post
					</button>
				</div>
			</div>

			{showRemoveModal && createPortal(
				<div
					onClick={() => !submitting && setShowRemoveModal(false)}
					className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
					<div
						role="dialog"
						aria-modal="true"
						aria-label="Remove This Item"
						onClick={(e) => e.stopPropagation()}
						className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-borderLight bg-surface p-5 shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 sm:p-6 sm:slide-in-from-bottom-0 space-y-4">
						<h3 className="text-lg font-bold text-textPrimary">Remove This Item</h3>

						<p className="text-sm text-textSecondary">
							Provide a reason for removal. The owner will receive this decision.
						</p>

						<textarea
							value={removeReason}
							onChange={(e) => {
								setRemoveReason(e.target.value);
								if (error) setError("");
							}}
							rows={4}
							placeholder="Explain why this item is being removed..."
							aria-invalid={Boolean(error)}
							className="w-full resize-none rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
						/>

						{error && (
							<div
								role="alert"
								className="flex items-start gap-2 rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-error animate-in fade-in slide-in-from-top-1 duration-200">
								<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
								<span className="break-words">{error}</span>
							</div>
						)}

						<div className="flex flex-col gap-3 sm:flex-row">
							<button
								onClick={() => setShowRemoveModal(false)}
								disabled={submitting}
								className="w-full rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant disabled:opacity-50 sm:flex-1">
								Cancel
							</button>

							<button
								onClick={handleRemoveItem}
								disabled={submitting || !removeReason.trim()}
								className="w-full rounded-xl bg-error py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1">
								{submitting ? "Removing..." : "Confirm Remove"}
							</button>
						</div>
					</div>
				</div>,
				document.body,
			)}

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
				<div className="space-y-5 lg:col-span-2">
					<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
						<h2 className="mb-3 font-bold text-textPrimary">Description</h2>
						<p className="text-sm leading-relaxed text-textSecondary">{item.description}</p>
					</div>

					<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
						<h2 className="mb-4 flex items-center gap-2 font-bold text-textPrimary">
							<ImageIcon className="h-4 w-4 text-textSecondary" />
							Photos ({item.imageUrls.length})
						</h2>

						{item.imageUrls.length === 0 ? (
							<div className="rounded-xl border border-dashed border-outlineVariant py-10 text-center text-sm text-textTertiary">
								No images uploaded.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
								{item.imageUrls.map((url, idx) => (
									<div
										key={idx}
										className="aspect-square overflow-hidden rounded-xl border border-borderLight bg-surfaceVariant">
										<img
											src={url}
											alt={`Item image ${idx + 1}`}
											className="h-full w-full object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5">
						<h2 className="mb-4 flex items-center gap-2 font-bold text-textPrimary">
							<User className="h-4 w-4 text-textSecondary" />
							Owner
						</h2>

						{item.owner ? (
							<>
								<div className="mb-4 flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaryLight font-bold text-primary">
										{ownerInitial}
									</div>

									<div className="min-w-0">
										<div className="break-words text-sm font-bold text-textPrimary">{item.owner.name}</div>
										<div className="break-words text-xs text-textTertiary">{item.owner.email}</div>
									</div>
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between gap-3">
										<span className="text-textSecondary">Trust Score</span>
										<span className="font-bold text-success">{item.owner.trustScore ?? 100}</span>
									</div>
								</div>

								<Link
									href={`/users/${item.owner.userId}`}
									className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-surfaceVariant py-2 text-sm font-semibold text-textSecondary transition hover:bg-borderLight">
									View Full Profile
								</Link>
							</>
						) : (
							<div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warningLight px-3 py-3 text-sm text-warning">
								<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
								<span>Owner info unavailable.</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}