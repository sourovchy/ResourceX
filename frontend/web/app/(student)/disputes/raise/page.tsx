"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Scale,
	UploadCloud,
	CheckCircle2,
	AlertOctagon,
	Loader2,
	AlertTriangle,
} from "lucide-react";

import api from "@/lib/api";

type BookingOption = {
	bookingId: string;
	itemTitle: string;
	ownerName: string;
	renterName: string;
};

type BookingApiResponse =
	| {
		bookings?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const BOOKING_ENDPOINTS = [
	"/bookings/my",
	"/bookings",
	"/api/bookings/my",
	"/api/bookings",
];

const DISPUTE_ENDPOINTS = [
	"/disputes",
	"/api/disputes",
	"/student/disputes",
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

function normalizeBooking(raw: any): BookingOption {
	return {
		bookingId: String(raw?.bookingId ?? raw?.id ?? ""),
		itemTitle:
			raw?.item?.title ??
			raw?.itemTitle ??
			raw?.itemName ??
			"Untitled Item",
		ownerName:
			raw?.owner?.name ??
			raw?.ownerName ??
			"Unknown Owner",
		renterName:
			raw?.renter?.name ??
			raw?.renterName ??
			"Unknown Renter",
	};
}

function extractBookings(payload: BookingApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.bookings ??
		root.data ??
		root.content ??
		payload;

	if (!Array.isArray(source)) {
		return [] as BookingOption[];
	}

	return source.map((item: any) => normalizeBooking(item));
}

async function fetchBookingsFromEndpoint(endpoint: string) {
	const response = await api.get<BookingApiResponse>(endpoint, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
	});

	return extractBookings(response.data);
}

export default function RaiseDisputePage() {
	const [submitted, setSubmitted] = useState(false);
	const [bookings, setBookings] = useState<BookingOption[]>([]);
	const [selectedBooking, setSelectedBooking] = useState("");
	const [description, setDescription] = useState("");
	const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadBookings = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedBookings: BookingOption[] = [];

				for (const endpoint of BOOKING_ENDPOINTS) {
					try {
						const normalized = await fetchBookingsFromEndpoint(endpoint);

						if (normalized.length > 0) {
							loadedBookings = normalized;
							break;
						}
					} catch {
						// try next endpoint
					}
				}

				if (!active) return;

				setBookings(loadedBookings);
			} catch (err) {
				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load bookings.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadBookings();

		return () => {
			active = false;
		};
	}, []);

	const bookingCount = useMemo(() => bookings.length, [bookings]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!selectedBooking) {
			setError("Please select a related booking.");
			return;
		}

		if (!description.trim()) {
			setError("Please describe the dispute issue.");
			return;
		}

		try {
			setSubmitting(true);

			const formData = new FormData();
			formData.append("bookingId", selectedBooking);
			formData.append("reason", description.trim());

			evidenceFiles.forEach((file) => {
				formData.append("evidence", file);
			});

			let success = false;

			for (const endpoint of DISPUTE_ENDPOINTS) {
				try {
					const response = await fetch(endpoint, {
						method: "POST",
						credentials: "include",
						headers: {
							...getAuthHeaders(),
						},
						body: formData,
					});

					if (response.ok) {
						success = true;
						break;
					}
				} catch {
					// try next endpoint
				}
			}

			if (!success) {
				throw new Error("Failed to submit dispute.");
			}

			setSubmitted(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to submit dispute.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Dispute Filed
				</h1>
				<p className="text-textSecondary">
					Your dispute has been escalated to ResourceX administration. We will
					review the evidence and contact you shortly. Rest assured, fairness is
					our priority.
				</p>
				<div className="flex justify-center gap-4 mt-6">
					<Link
						href="/disputes/my"
						className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
						View My Disputes
					</Link>
					<Link
						href="/dashboard"
						className="px-6 py-3 bg-surfaceVariant text-textPrimary font-bold rounded-xl hover:bg-borderLight transition-colors">
						Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href="/disputes/my"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> My Disputes
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
					<Scale className="w-6 h-6 text-error" /> Raise a Dispute
				</h1>
				<p className="text-sm text-textSecondary mt-2">
					If you cannot resolve an issue directly with the other party, submit a
					dispute. A platform admin will step in to mediate.
				</p>
			</div>

			<div className="bg-errorLight text-error p-4 rounded-xl text-sm font-semibold flex items-start gap-3">
				<AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
				<div>
					Remember to include clear proof (photos, screenshots) if claiming
					damage or missing items. False dispute claims result in severe Trust
					Score penalties.
				</div>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/20 p-4 text-sm text-errorDark">
					<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-borderLight p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Select Related Booking
					</label>

					<select
						value={selectedBooking}
						onChange={(e) => setSelectedBooking(e.target.value)}
						className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error"
						required>
						<option value="">
							{loading
								? "Loading bookings..."
								: `-- Choose a booking (${bookingCount} available) --`}
						</option>

						{bookings.map((booking) => (
							<option key={booking.bookingId} value={booking.bookingId}>
								{booking.itemTitle} (Owner: {booking.ownerName}, Renter: {booking.renterName})
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Describe the Issue
					</label>

					<textarea
						rows={6}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Be as detailed as possible. Only state facts..."
						className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error resize-none"
						required
					/>
				</div>

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">
						Evidence (Optional but recommended)
					</label>

					<label className="border-2 border-dashed border-borderLight bg-surfaceVariant rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-error transition-colors cursor-pointer">
						<UploadCloud className="w-8 h-8 text-textSecondary mb-2" />
						<p className="text-sm font-bold text-textPrimary">
							Upload Photos / Screenshots
						</p>
						<p className="text-xs text-textSecondary mt-1">
							Images must be under 5MB
						</p>

						<input
							type="file"
							multiple
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const files = Array.from(e.target.files ?? []);
								setEvidenceFiles(files);
							}}
						/>
					</label>

					{evidenceFiles.length > 0 && (
						<div className="text-xs text-textSecondary space-y-1">
							{evidenceFiles.map((file, index) => (
								<div key={`${file.name}-${index}`}>
									• {file.name}
								</div>
							))}
						</div>
					)}
				</div>

				<button
					type="submit"
					disabled={submitting || loading}
					className="w-full py-4 bg-error text-white font-bold rounded-xl shadow-sm hover:bg-errorDark transition-colors mt-8 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
					{submitting ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Submitting Dispute...
						</>
					) : loading ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Loading Bookings...
						</>
					) : (
						"Submit to Administration"
					)}
				</button>
			</form>
		</div>
	);
}
