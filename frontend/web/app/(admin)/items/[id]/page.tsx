"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
	ArrowLeft,
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
		description:
			data.description ?? "No description provided.",
		category:
			data.category ??
			data.categoryName ??
			"Uncategorized",

		dailyRate: Number(
			data.dailyRate ??
			data.pricePerDay ??
			0,
		),

		status: normalizeStatus(data.status),

		createdAt: data.createdAt,

		imageUrls:
			data.imageUrls ??
			data.images ??
			[],

		owner: ownerSource
			? {
				userId:
					ownerSource.userId ??
					ownerSource.id ??
					"",
				name:
					ownerSource.name ??
					"Unknown User",
				email:
					ownerSource.email ??
					"",
				trustScore:
				ownerSource.trustScore,
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

	return date.toLocaleDateString();
}

export default function AdminItemDetailPage() {
	const params = useParams();
	const router = useRouter();

	const id = params?.id as string;

	const [showRemoveModal, setShowRemoveModal] =
		useState(false);

	const [removeReason, setRemoveReason] =
		useState("");

	const [item, setItem] =
		useState<ItemData | null>(null);

	const [loading, setLoading] =
		useState(true);

	const [submitting, setSubmitting] =
		useState(false);

	const [error, setError] =
		useState("");

	const fetchItem = async () => {
		if (!id) return;

		try {
			setLoading(true);
			setError("");

			const response = await api.get(
				`/items/${id}`,
			);

			const raw =
				response.data?.data ??
				response.data;

			setItem(normalizeItem(raw));
		} catch (err) {
			console.error(err);
			setError(
				"Could not load item details.",
			);
			setItem(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchItem();
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
			setError(
				"Please provide a removal reason.",
			);
			return;
		}

		try {
			setSubmitting(true);
			setError("");

			await api.post(
				`/admin/block-item/${id}`,
				{
					reason:
						removeReason.trim(),
				},
			);

			router.push("/admin/items");
		} catch (err) {
			console.error(err);
			setError(
				"Failed to remove item.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center py-20 text-textSecondary">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (!item) {
		return (
			<div className="mx-auto max-w-4xl space-y-6">
				<Link
					href="/admin/items"
					className="flex items-center gap-1.5 text-sm font-medium text-textSecondary transition hover:text-textPrimary">
					<ArrowLeft className="h-4 w-4" />
					Back to Items
				</Link>

				<div className="rounded-2xl border border-borderLight bg-surface p-8 text-center shadow-sm">
					<Package className="mx-auto mb-3 h-10 w-10 text-textTertiary opacity-40" />

					<h1 className="text-xl font-bold text-textPrimary">
						Item not found
					</h1>

					<p className="mt-2 text-sm text-textSecondary">
						The item does not exist or could not be loaded.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<Link
				href="/admin/items"
				className="flex items-center gap-1.5 text-sm font-medium text-textSecondary transition hover:text-textPrimary">
				<ArrowLeft className="h-4 w-4" />
				Back to Items
			</Link>

			{error && (
				<div className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			{/* Header */}
			<div className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="text-xl font-extrabold text-textPrimary">
								{item.title}
							</h1>

							<span
								className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor}`}>
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
							Submitted{" "}
							{formatDate(
								item.createdAt,
							)}{" "}
							· ID: {item.itemId}
						</div>
					</div>

					<button
						onClick={() =>
							setShowRemoveModal(
								true,
							)
						}
						className="flex items-center gap-2 rounded-xl border border-error/30 bg-errorLight px-4 py-2 text-sm font-bold text-error transition hover:bg-error/20">
						<XCircle className="h-4 w-4" />
						Remove Post
					</button>
				</div>
			</div>

			{/* Remove Modal */}
			{showRemoveModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md space-y-4 rounded-2xl border border-borderLight bg-surface p-6 shadow-2xl">
						<h3 className="text-lg font-bold text-textPrimary">
							Remove This Item
						</h3>

						<p className="text-sm text-textSecondary">
							Provide a reason for
							removal. The owner
							will receive this
							decision.
						</p>

						<textarea
							value={
								removeReason
							}
							onChange={(e) =>
								setRemoveReason(
									e.target
										.value,
								)
							}
							rows={4}
							placeholder="Explain why this item is being removed..."
							className="w-full resize-none rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
						/>

						<div className="flex gap-3">
							<button
								onClick={() =>
									setShowRemoveModal(
										false,
									)
								}
								className="flex-1 rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
								Cancel
							</button>

							<button
								onClick={
									handleRemoveItem
								}
								disabled={
									submitting
								}
								className="flex-1 rounded-xl bg-error py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
								{submitting
									? "Removing..."
									: "Confirm Remove"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Side */}
				<div className="space-y-6 lg:col-span-2">
					{/* Description */}
					<div className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm">
						<h2 className="mb-3 font-bold text-textPrimary">
							Description
						</h2>

						<p className="leading-relaxed text-sm text-textSecondary">
							{item.description}
						</p>
					</div>

					{/* Images */}
					<div className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 font-bold text-textPrimary">
							<ImageIcon className="h-4 w-4 text-textSecondary" />
							Photos (
							{
								item.imageUrls
									.length
							}
							)
						</h2>

						{item.imageUrls
							.length === 0 ? (
							<div className="rounded-xl border border-dashed border-outlineVariant py-10 text-center text-sm text-textTertiary">
								No images uploaded.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
								{item.imageUrls.map(
									(
										url,
										idx,
									) => (
										<div
											key={
												idx
											}
											className="aspect-square overflow-hidden rounded-xl border border-borderLight bg-surfaceVariant">
											<img
												src={
													url
												}
												alt={`Item image ${idx + 1}`}
												className="h-full w-full object-cover"
											/>
										</div>
									),
								)}
							</div>
						)}
					</div>
				</div>

				{/* Right Side */}
				<div className="space-y-4">
					<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 font-bold text-textPrimary">
							<User className="h-4 w-4 text-textSecondary" />
							Owner
						</h2>

						{item.owner ? (
							<>
								<div className="mb-4 flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primaryLight font-bold text-primary">
										{item.owner.name?.[0]?.toUpperCase()}
									</div>

									<div>
										<div className="text-sm font-bold text-textPrimary">
											{
												item
													.owner
													.name
											}
										</div>

										<div className="text-xs text-textTertiary">
											{
												item
													.owner
													.email
											}
										</div>
									</div>
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-textSecondary">
											Trust
											Score
										</span>

										<span className="font-bold text-success">
											{item
													.owner
													.trustScore ??
												100}
										</span>
									</div>
								</div>

								<Link
									href={`/admin/users/${item.owner.userId}`}
									className="mt-4 flex w-full items-center justify-center rounded-xl bg-surfaceVariant py-2 text-sm font-semibold text-textSecondary transition hover:bg-borderLight">
									View Full
									Profile
								</Link>
							</>
						) : (
							<div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warningLight px-3 py-3 text-sm text-warning">
								<ShieldAlert className="h-4 w-4" />
								Owner info unavailable.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}