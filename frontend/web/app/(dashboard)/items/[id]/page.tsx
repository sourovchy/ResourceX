"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import SafeImage from "@/components/ui/SafeImage";
import Avatar from "@/components/ui/Avatar";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageEmpty } from "@/components/ui/PageEmpty";

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
	avatarUrl?: string | null;
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
		avatarUrl?: string | null;
	};
	user?: {
		userId?: number | string;
		id?: number | string;
		name?: string;
		email?: string;
		trustScore?: number;
		avatarUrl?: string | null;
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
				avatarUrl: ownerSource.avatarUrl,
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

	const fetchItem = useCallback(async () => {
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
	}, [id]);

	useEffect(() => {
		void fetchItem();
	}, [fetchItem]);

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

			// Unified delete — same endpoint/core logic as an owner deletion.
			await api.delete(`/items/${id}`, { params: { reason: removeReason.trim() } });

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
		return <PageLoader message="Loading item details..." />;
	}

	if (!item) {
		return (
			<div className="mx-auto max-w-4xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
				<PageEmpty
					icon={Package}
					title="Item not found"
					description="The item does not exist or could not be loaded."
				/>
			</div>
		);
	}


	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0 graph-grid page-enter">
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-textPrimary">
						Verify <span className="text-gradient-brand italic">Listing.</span>
					</h1>
					<p className="mt-2 text-sm text-textSecondary font-medium">
						Inspect listing description, media files, and verify owner trust status.
					</p>
				</div>
			</div>

			{/* Page-level errors only — hidden while the remove modal is open so the
			    message is never trapped behind the modal (it renders inside instead). */}
			{error && !showRemoveModal && (
				<div
					role="alert"
					className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-in fade-in duration-200">
					{error}
				</div>
			)}

			<Card padding="none" className="p-4 sm:p-6" interactive={true}>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="break-words text-xl font-bold italic text-textPrimary sm:text-2xl">
								{item.title}
							</h1>

							<StatusBadge status={item.status} />
						</div>

						<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-textSecondary font-medium">
							<span className="flex items-center gap-1">
								<Tag className="h-3.5 w-3.5 text-textSecondary" />
								{item.category}
							</span>

							<span className="flex items-center gap-1">
								<span className="font-mono text-primary font-bold">৳</span>{item.dailyRate}/day
							</span>
						</div>

						<div className="mt-1 text-xs text-textTertiary font-mono">
							Submitted {formatDate(item.createdAt)} · ID: {item.itemId}
						</div>
					</div>

					<Button
						onClick={() => {
							setError("");
							setRemoveReason("");
							setShowRemoveModal(true);
						}}
						variant="danger"
						leftIcon={<XCircle className="h-4 w-4" />}
					>
						Remove Post
					</Button>
				</div>
			</Card>

			<ConfirmModal
				isOpen={showRemoveModal}
				title="Remove This Item"
				message="Provide a reason for removal. The owner will receive this decision."
				confirmText="Confirm Remove"
				isDestructive
				requireReason
				reasonLabel="Reason"
				reasonPlaceholder="Explain why this item is being removed..."
				reasonValue={removeReason}
				onReasonChange={(v) => {
					setRemoveReason(v);
					if (error) setError("");
				}}
				error={error || null}
				isLoading={submitting}
				onConfirm={handleRemoveItem}
				onCancel={() => setShowRemoveModal(false)}
			/>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
				<div className="space-y-5 lg:col-span-2">
					<Card padding="none" className="p-4 sm:p-6 space-y-3" interactive={true}>
						<p className="text-sm leading-relaxed text-textSecondary">{item.description}</p>
					</Card>

					<Card padding="none" className="p-4 sm:p-6 space-y-4" interactive={true}>
						<h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-textTertiary">
							<ImageIcon className="h-3.5 w-3.5" />
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
										key={url}
										className="aspect-square overflow-hidden rounded-xl border border-borderLight bg-surfaceVariant relative">
										<SafeImage
											src={url}
											alt={`Item image ${idx + 1}`}
											fill
											sizes="(max-width: 640px) 50vw, 25vw"
											className="object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>

				<div className="space-y-4">
					<Card padding="none" className="p-4 sm:p-5 space-y-4" interactive={true}>
						<h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-textTertiary">
							<User className="h-3.5 w-3.5" />
							Owner
						</h2>

						{item.owner ? (
							<>
								<div className="mb-4 flex items-center gap-3 border-b border-borderLight pb-4">
									<Avatar src={item.owner.avatarUrl} name={item.owner.name} size={40} />

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
									className="mt-4 inline-flex items-center justify-center rounded-full font-bold italic transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-surface text-textPrimary border border-border hover:bg-surfaceVariant focus-visible:ring-primary/30 px-6 py-2.5 text-sm gap-2 w-full"
								>
									View Full Profile
								</Link>
							</>
						) : (
							<div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warningLight px-3 py-3 text-sm text-warning">
								<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
								<span>Owner info unavailable.</span>
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}