"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateRange } from "@/lib/dateUtils";
import { TiltCard } from "@/components/ui/TiltCard";

export interface BookingCardProps {
	booking: {
		bookingId: number;
		status: string;
		startDate?: string;
		endDate?: string;
		totalPrice?: number | string;
		rejectionReason?: string | null;
		item?: {
			itemId: string | number;
			title?: string;
			imageUrls?: string[];
			owner?: { name?: string };
		};
	};
	isProcessing?: boolean;
	reviewed?: boolean;
	onCancel?: (bookingId: number) => void;
	onLeaveReview?: (booking: any) => void;
}

export const BookingCard = ({
	booking,
	isProcessing = false,
	reviewed = false,
	onCancel,
	onLeaveReview,
}: BookingCardProps) => {
	const rawStatus = (booking.status ?? "PENDING").toUpperCase();
	const isPending = rawStatus === "PENDING";
	const isCompleted = rawStatus === "COMPLETED";

	return (
		<TiltCard
			maxTilt={5}
			glare={true}
			className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface transition-all duration-300 hover:border-primary/40 hover:shadow-md"
		>
			{/* Item image */}
			<Link
				href={`/borrow/item/${booking.item?.itemId}`}
				className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surfaceVariant"
			>
				<SafeImage
					src={booking.item?.imageUrls?.[0]}
					alt={booking.item?.title ?? "Item"}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
				/>
				<div className="absolute left-3 top-3 z-10">
					<StatusBadge status={rawStatus} />
				</div>
			</Link>

			{/* Info */}
			<div className="flex flex-1 flex-col p-3 sm:p-4">
				<Link href={`/borrow/item/${booking.item?.itemId}`}>
					<h3 className="line-clamp-2 min-h-[2.5rem] break-words text-sm font-bold leading-tight text-textPrimary transition-colors group-hover:text-primary">
						{booking.item?.title ?? "Unknown Item"}
					</h3>
				</Link>

				<div className="mt-2 space-y-1.5 text-xs text-textSecondary sm:text-sm">
					<div className="flex items-center gap-1.5">
						<Clock className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
						<span className="line-clamp-1">
							{formatDateRange(booking.startDate, booking.endDate)}
						</span>
					</div>
					<div className="line-clamp-1">
						From <strong className="text-textPrimary">{booking.item?.owner?.name ?? "Unknown"}</strong>
					</div>
					<div>
						Total: <strong className="text-primary">৳&thinsp;{Number(booking.totalPrice).toLocaleString()}</strong>
					</div>
					{booking.rejectionReason && rawStatus === "REJECTED" && (
						<div className="mt-1 line-clamp-2 rounded-lg bg-errorLight/30 px-2 py-1 text-[10px] text-errorDark sm:text-xs">
							<strong>Reason:</strong> {booking.rejectionReason}
						</div>
					)}
				</div>

				{/* Actions */}
				{(isPending || isCompleted) && (
					<div className="mt-auto pt-3 border-t border-borderLight flex w-full flex-col gap-2">
						{isPending && onCancel && (
							<button
								type="button"
								disabled={isProcessing}
								onClick={() => onCancel(booking.bookingId)}
								className="w-full rounded-lg bg-errorLight px-3 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error hover:text-white disabled:opacity-50"
							>
								{isProcessing ? (
									<Loader2 className="mx-auto h-3 w-3 animate-spin" />
								) : (
									"Cancel Request"
								)}
							</button>
						)}

						{isCompleted && reviewed ? (
							<div className="flex w-full items-center justify-center gap-1 rounded-lg bg-surfaceVariant px-3 py-1.5 text-xs font-bold text-success">
								Review Submitted
							</div>
						) : isCompleted && onLeaveReview && (
							<button
								type="button"
								onClick={() => onLeaveReview(booking)}
								className="flex w-full items-center justify-center gap-1 rounded-lg bg-primaryLight px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
							>
								Leave Review <ArrowRight className="h-3 w-3" />
							</button>
						)}
					</div>
				)}
			</div>
		</TiltCard>
	);
};

export default BookingCard;
