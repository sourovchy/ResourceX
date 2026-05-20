"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	ArrowLeft,
	Tag,
	User,
	DollarSign,
	XCircle,
	Image,
	Package,
} from "lucide-react";

import api from "@/lib/api";

export default function AdminItemDetailPage() {
	const params = useParams();
	const id = params?.id as string;
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [removeReason, setRemoveReason] = useState("");

	const [item, setItem] = React.useState<any>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (id) {
			api
				.get(`/items/${id}`)
				.then((res) => setItem(res.data))
				.catch(console.error)
				.finally(() => setLoading(false));
		}
	}, [id]);

	if (loading) {
		return (
			<div className="text-center py-20 text-textSecondary">Loading...</div>
		);
	}

	if (!item) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<Link
					href="/items"
					className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition font-medium">
					<ArrowLeft className="w-4 h-4" />
					Back to Items
				</Link>

				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-8 text-center">
					<Package className="w-10 h-10 mx-auto mb-3 text-textTertiary opacity-40" />
					<h1 className="text-xl font-bold text-textPrimary">Item not found</h1>
					<p className="text-sm text-textSecondary mt-2">
						The item you opened does not exist or the ID is invalid.
					</p>
				</div>
			</div>
		);
	}

	const statusColor =
		item.status === "AVAILABLE"
			? "bg-successLight text-success"
			: item.status === "PENDING"
				? "bg-warningLight text-warning"
				: item.status === "REJECTED"
					? "bg-errorLight text-error"
					: "bg-surfaceVariant text-textSecondary";

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Link
					href="/items"
					className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition font-medium">
					<ArrowLeft className="w-4 h-4" />
					Back to Items
				</Link>
			</div>

			{/* Header + Actions */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-6">
				<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="text-xl font-extrabold text-textPrimary">
								{item.title}
							</h1>
							<span
								className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
								{item.status}
							</span>
						</div>
						<div className="flex items-center gap-3 mt-2 text-sm text-textSecondary">
							<span className="flex items-center gap-1">
								<Tag className="w-3.5 h-3.5" /> {item.category}
							</span>
							<span className="flex items-center gap-1">
								<DollarSign className="w-3.5 h-3.5" /> ৳{item.dailyRate}/day
							</span>
						</div>
						<div className="text-xs text-textTertiary mt-1">
							Submitted{" "}
							{item.createdAt
								? new Date(item.createdAt).toLocaleDateString()
								: ""}{" "}
							· ID: {item.itemId}
						</div>
					</div>

					<div className="flex gap-2 shrink-0">
						<button
							onClick={() => setShowRemoveModal(true)}
							className="flex items-center gap-2 px-4 py-2 bg-errorLight text-error border border-error/30 rounded-xl text-sm font-bold hover:bg-error/20 transition">
							<XCircle className="w-4 h-4" /> Remove Post
						</button>
					</div>
				</div>
			</div>

			{/* Remove Modal */}
			{showRemoveModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
						<h3 className="text-lg font-bold text-textPrimary">
							Remove This Item
						</h3>
						<p className="text-sm text-textSecondary">
							Provide a clear reason. The item owner will receive this as a
							notification.
						</p>
						<textarea
							value={removeReason}
							onChange={(e) => setRemoveReason(e.target.value)}
							rows={4}
							placeholder="e.g. This listing contains inappropriate content or violates platform policy."
							className="w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-sm text-textPrimary focus:ring-2 focus:ring-primary outline-none resize-none transition"
						/>
						<div className="flex gap-3">
							<button
								onClick={() => setShowRemoveModal(false)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={async () => {
									try {
										await api.post(
											`/admin/block-item/${id}?reason=${encodeURIComponent(removeReason)}`,
										);
										window.location.href = "/admin/items";
									} catch (e) {
										console.error(e);
									}
								}}
								className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition">
								Confirm Remove
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Description */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-6">
						<h2 className="font-bold text-textPrimary mb-3">Description</h2>
						<p className="text-sm text-textSecondary leading-relaxed">
							{item.description}
						</p>
					</div>

					{/* Photo placeholders */}
					<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-6">
						<h2 className="font-bold text-textPrimary mb-4 flex items-center gap-2">
							<Image className="w-4 h-4 text-textSecondary" />
							Photos ({item.imageUrls?.length || 0})
						</h2>
						<div className="grid grid-cols-3 gap-3">
							{(item.imageUrls || []).map((url: string, idx: number) => (
								<div
									key={idx}
									className="aspect-square bg-surfaceVariant rounded-xl flex items-center justify-center border border-borderLight overflow-hidden">
									<img
										src={url}
										alt="Item"
										className="w-full h-full object-cover"
									/>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Owner Info */}
				<div className="space-y-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5">
						<h2 className="font-bold text-textPrimary mb-4 flex items-center gap-2">
							<User className="w-4 h-4 text-textSecondary" />
							Owner
						</h2>
						{item.owner && (
							<>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 rounded-full bg-primaryLight flex items-center justify-center font-bold text-primary shrink-0">
										{item.owner.name[0]}
									</div>
									<div>
										<div className="text-sm font-bold text-textPrimary">
											{item.owner.name}
										</div>
										<div className="text-xs text-textTertiary">
											{item.owner.email}
										</div>
									</div>
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-textSecondary">Trust Score</span>
										<span className="font-bold text-success">
											{item.owner.trustScore ?? 100}
										</span>
									</div>
								</div>
								<Link
									href={`/admin/users/${item.owner.userId}`}
									className="mt-4 flex items-center justify-center w-full py-2 bg-surfaceVariant text-textSecondary rounded-xl text-sm font-semibold hover:bg-borderLight transition">
									View Full Profile
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
