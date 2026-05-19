"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	Clock,
	Shield,
	MessageSquare,
	Check,
	X,
	AlertCircle,
} from "lucide-react";

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
};

const INITIAL_REQUESTS: RequestItem[] = [
	{
		id: "req1",
		postId: "p1",
		item: "Sony Alpha A7III DSLR Camera",
		renterName: "John Doe",
		trustScore: 95,
		dates: "May 10 - May 12",
		message:
			"Hey! Need this for a short trip to Sylhet. Will take very good care of it.",
		status: "Pending",
	},
	{
		id: "req2",
		postId: "p1",
		item: "Sony Alpha A7III DSLR Camera",
		renterName: "Rafiq M.",
		trustScore: 82,
		dates: "May 13 - May 14",
		message: "Need this for an event.",
		status: "Pending",
	},
	{
		id: "req3",
		postId: "p2",
		item: "Arduino Mega Kit",
		renterName: "Nusrat J.",
		trustScore: 110,
		dates: "May 15 - May 20",
		message: "Final year project requires this. Thanks!",
		status: "Approved",
	},
];

export default function RequestsPage() {
	const searchParams = useSearchParams();
	const postId = searchParams.get("postId");

	const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
	const [filter, setFilter] = useState<RequestStatus | "All">("Pending");

	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null,
	);
	const [rejectionReason, setRejectionReason] = useState("");

	const postFiltered = useMemo(() => {
		return postId ? requests.filter((r) => r.postId === postId) : requests;
	}, [postId, requests]);

	const filteredReqs = useMemo(() => {
		return filter === "All"
			? postFiltered
			: postFiltered.filter((r) => r.status === filter);
	}, [filter, postFiltered]);

	const approveRequest = (id: string) => {
		setRequests((prev) =>
			prev.map((r) =>
				r.id === id
					? { ...r, status: "Approved", rejectionReason: undefined }
					: r,
			),
		);
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

	const confirmReject = () => {
		if (!selectedRequestId) return;

		const reason = rejectionReason.trim();
		if (!reason) return;

		setRequests((prev) =>
			prev.map((r) =>
				r.id === selectedRequestId
					? { ...r, status: "Rejected", rejectionReason: reason }
					: r,
			),
		);

		closeRejectModal();
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to My Posts
			</Link>

			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Booking Requests
			</h1>

			<div className="flex border-b border-borderLight">
				{["Pending", "Approved", "Rejected", "All"].map((tab) => (
					<button
						key={tab}
						onClick={() => setFilter(tab as RequestStatus | "All")}
						className={`px-4 py-3 text-sm font-semibold transition-colors ${
							filter === tab
								? "border-b-2 border-primary text-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{tab} (
						{
							postFiltered.filter((r) =>
								tab === "All" ? true : r.status === tab,
							).length
						}
						)
					</button>
				))}
			</div>

			<div className="space-y-4">
				{filteredReqs.map((req) => (
					<div
						key={req.id}
						className="bg-surface border border-borderLight rounded-2xl p-5 shadow-sm space-y-4">
						<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-borderLight">
							<div>
								<h3 className="font-bold text-textPrimary text-lg">
									{req.item}
								</h3>
								<div className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
									<Clock className="w-4 h-4" /> {req.dates}
								</div>
							</div>

							<div
								className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap self-start ${
									req.status === "Pending"
										? "bg-warningLight text-warningDark"
										: req.status === "Approved"
											? "bg-successLight text-successDark"
											: "bg-errorLight text-error"
								}`}>
								{req.status}
							</div>
						</div>

						<div className="bg-surfaceVariant p-4 rounded-xl space-y-3">
							<div className="flex items-center justify-between gap-3">
								<div className="font-bold text-textPrimary text-sm">
									Requested by: {req.renterName}
								</div>

								<div className="flex items-center gap-1 bg-successLight text-success px-2 py-0.5 rounded text-xs font-bold">
									<Shield className="w-3.5 h-3.5" /> Trust {req.trustScore}
								</div>
							</div>

							<div className="flex gap-2 text-sm text-textSecondary items-start border-t border-borderLight pt-2">
								<MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
								<p className="italic">"{req.message}"</p>
							</div>

							{req.status === "Rejected" && req.rejectionReason && (
								<div className="flex gap-2 text-sm text-error bg-errorLight/40 border border-error/20 rounded-xl p-3">
									<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
									<div>
										<p className="font-bold">Rejection reason</p>
										<p>{req.rejectionReason}</p>
									</div>
								</div>
							)}
						</div>

						{req.status === "Pending" && (
							<div className="flex gap-3">
								<button
									onClick={() => approveRequest(req.id)}
									className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primaryDark transition-colors">
									<Check className="w-4 h-4" /> Approve
								</button>
								<button
									onClick={() => openRejectModal(req.id)}
									className="flex-1 py-3 bg-surface border border-error text-error rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-errorLight transition-colors">
									<X className="w-4 h-4" /> Reject
								</button>
							</div>
						)}
					</div>
				))}
			</div>

			{filteredReqs.length === 0 && (
				<div className="p-8 text-center text-textSecondary bg-surface border border-borderLight rounded-2xl">
					No {filter.toLowerCase()} requests
					{postId && " for this item"}.
				</div>
			)}

			{rejectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-borderLight p-6 space-y-5">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-xl font-bold text-textPrimary">
									Reject Request
								</h2>
								<p className="text-sm text-textSecondary mt-1">
									Provide a reason so the renter understands why it was
									rejected.
								</p>
							</div>

							<button
								type="button"
								onClick={closeRejectModal}
								className="text-textSecondary hover:text-textPrimary">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Rejection Reason
							</label>
							<textarea
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								placeholder="Example: The item is already booked for these dates."
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
							/>
						</div>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={closeRejectModal}
								className="flex-1 py-3 rounded-xl border border-borderLight text-textPrimary font-bold hover:bg-surfaceVariant transition-colors">
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmReject}
								disabled={!rejectionReason.trim()}
								className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
									rejectionReason.trim()
										? "bg-error text-white hover:opacity-90"
										: "bg-outlineVariant text-textSecondary cursor-not-allowed"
								}`}>
								Confirm Reject
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
