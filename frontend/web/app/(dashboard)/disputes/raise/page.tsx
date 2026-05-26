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

const BOOKING_ENDPOINTS = ["/bookings/my", "/bookings", "/api/bookings/my", "/api/bookings"];
const DISPUTE_ENDPOINTS = ["/disputes", "/api/disputes", "/student/disputes"];

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token = localStorage.getItem("resourcex_token");
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeBooking(raw: any): BookingOption {
	return {
		bookingId: String(raw?.bookingId ?? raw?.id ?? ""),
		itemTitle: raw?.item?.title ?? raw?.itemTitle ?? raw?.itemName ?? "Untitled Item",
		ownerName: raw?.owner?.name ?? raw?.ownerName ?? "Unknown Owner",
		renterName: raw?.renter?.name ?? raw?.renterName ?? "Unknown Renter",
	};
}

function extractBookings(payload: BookingApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};
	const source = root.bookings ?? root.data ?? root.content ?? payload;

	if (!Array.isArray(source)) return [] as BookingOption[];
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
				setError(err instanceof Error ? err.message : "Failed to load bookings.");
			} finally {
				if (active) setLoading(false);
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
			setError(err instanceof Error ? err.message : "Failed to submit dispute.");
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-successLight text-success">
					<CheckCircle2 className="h-10 w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Dispute Filed
				</h1>
				<p className="mt-4 max-w-lg text-sm text-textSecondary sm:text-base">
					Your dispute has been escalated to ResourceX administration. We will review the evidence and contact you shortly. Rest assured, fairness is our priority.
				</p>
				<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Link
						href="/disputes/my"
						className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:w-auto">
						View My Disputes
					</Link>
					<Link
						href="/dashboard"
						className="inline-flex w-full items-center justify-center rounded-xl bg-surfaceVariant px-6 py-3 text-sm font-bold text-textPrimary transition-colors hover:bg-borderLight sm:w-auto">
						Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<Link
				href="/disputes/my"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" /> My Disputes
			</Link>

			<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
					<Scale className="h-6 w-6 text-error" /> Raise a Dispute
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">
					If you cannot resolve an issue directly with the other party, submit a dispute. A platform admin will step in to mediate.
				</p>
			</div>

			<div className="flex items-start gap-3 rounded-xl border border-error/20 bg-errorLight px-4 py-4 text-sm font-semibold text-errorDark">
				<AlertOctagon className="mt-0.5 h-5 w-5 shrink-0" />
				<div>
					Remember to include clear proof (photos, screenshots) if claiming damage or missing items. False dispute claims result in severe Trust Score penalties.
				</div>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/20 p-4 text-sm text-errorDark">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">Select Related Booking</label>

					<select
						value={selectedBooking}
						onChange={(e) => setSelectedBooking(e.target.value)}
						className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm outline-none transition focus:border-error focus:ring-1 focus:ring-error"
						required>
						<option value="">
							{loading ? "Loading bookings..." : `-- Choose a booking (${bookingCount} available) --`}
						</option>

						{bookings.map((booking) => (
							<option key={booking.bookingId} value={booking.bookingId}>
								{booking.itemTitle} (Owner: {booking.ownerName}, Renter: {booking.renterName})
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">Describe the Issue</label>

					<textarea
						rows={6}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Be as detailed as possible. Only state facts..."
						className="w-full resize-none rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm outline-none transition focus:border-error focus:ring-1 focus:ring-error"
						required
					/>
				</div>

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">Evidence (Optional but recommended)</label>

					<label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant px-4 py-6 text-center transition hover:border-error sm:px-6">
						<UploadCloud className="mb-2 h-8 w-8 text-textSecondary" />
						<p className="text-sm font-bold text-textPrimary">Upload Photos / Screenshots</p>
						<p className="mt-1 text-xs text-textSecondary">Images must be under 5MB</p>

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
						<div className="space-y-1 text-xs text-textSecondary">
							{evidenceFiles.map((file, index) => (
								<div key={`${file.name}-${index}`}>• {file.name}</div>
							))}
						</div>
					)}
				</div>

				<button
					type="submit"
					disabled={submitting || loading}
					className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-error px-4 py-4 font-bold text-white shadow-sm transition-colors hover:bg-errorDark disabled:cursor-not-allowed disabled:opacity-60">
					{submitting ? (
						<>
							<Loader2 className="h-5 w-5 animate-spin" />
							Submitting Dispute...
						</>
					) : loading ? (
						<>
							<Loader2 className="h-5 w-5 animate-spin" />
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
