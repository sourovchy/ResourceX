"use client";

import React from "react";

/**
 * Base shimmer block. Uses `animate-pulse` (always available) + a theme-aware
 * surface so skeletons read correctly in light and dark.
 */
export function Skeleton({ className = "" }: { className?: string }) {
	return <div className={`animate-pulse rounded-md bg-surfaceVariant ${className}`} />;
}

/** A KPI / stat card placeholder. */
export function StatCardSkeleton() {
	return (
		<div className="rounded-xl border border-borderLight bg-surface p-4 shadow-sm">
			<Skeleton className="h-3 w-20" />
			<Skeleton className="mt-3 h-7 w-24" />
		</div>
	);
}

/** A grid of generic content cards. */
export function CardGridSkeleton({
	count = 6,
	className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}: {
	count?: number;
	className?: string;
}) {
	return (
		<div className={className}>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
					<Skeleton className="h-40 w-full rounded-none" />
					<div className="space-y-2.5 p-4">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/3" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Avatar + two text lines — for conversations, notifications, user rows. */
export function ListRowSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="space-y-1">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 p-3">
					<Skeleton className="h-11 w-11 shrink-0 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-3.5 w-1/3" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</div>
			))}
		</div>
	);
}

/** Table placeholder: header + rows. */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
	return (
		<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
			<div className="flex gap-4 border-b border-borderLight bg-surfaceVariant/40 px-5 py-3">
				{Array.from({ length: cols }).map((_, i) => (
					<Skeleton key={i} className="h-3 flex-1" />
				))}
			</div>
			<div className="divide-y divide-borderLight">
				{Array.from({ length: rows }).map((_, r) => (
					<div key={r} className="flex items-center gap-4 px-5 py-4">
						{Array.from({ length: cols }).map((_, c) => (
							<Skeleton key={c} className="h-4 flex-1" />
						))}
					</div>
				))}
			</div>
		</div>
	);
}

/** Profile header placeholder. */
export function ProfileSkeleton() {
	return (
		<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm sm:p-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-16 w-16 shrink-0 rounded-full" />
				<div className="flex-1 space-y-2.5">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-3.5 w-56" />
				</div>
			</div>
		</div>
	);
}
