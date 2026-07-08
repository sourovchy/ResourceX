import React from "react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";
import { CountUp } from "@/components/ui/CountUp";

/** Plain integers (e.g. "12", "1,204") count up on reveal; anything else renders as-is. */
const asCountable = (value: React.ReactNode): number | null => {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && /^\d{1,3}(,\d{3})*$|^\d+$/.test(value.trim()))
		return Number(value.replace(/,/g, ""));
	return null;
};

interface StatCardProps {
	title: string;
	value: React.ReactNode;
	loading?: boolean;
	icon?: React.ReactNode;
	tint?: string;
	iconColor?: string;
	subtitle?: string;
	sub?: string;
	trend?: string;
	href?: string;
	className?: string;
}

const StatCard = ({
	icon,
	title,
	value,
	loading = false,
	sub,
	subtitle,
	tint = "bg-primaryLight",
	iconColor = "text-primary",
	href,
	trend,
	className = "",
}: StatCardProps) => {
	const displaySubtitle = sub || subtitle;
	const countable = asCountable(value);

	const inner = (
		<TiltCard
			maxTilt={6}
			glare={true}
			className={`
				group rounded-2xl border border-borderLight bg-surface p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-surfaceVariant/20 hover:shadow-md
				${icon ? "flex items-start gap-3 sm:gap-4" : "flex flex-col gap-2"}
				${href ? "cursor-pointer" : "cursor-default"}
				sm:p-5
				${className}
			`.trim()}>
			{icon && (
				<div
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint} sm:h-12 sm:w-12`}>
					<div className="scale-90 sm:scale-100">{icon}</div>
				</div>
			)}
			<div className="min-w-0 flex-1 overflow-hidden z-10 relative">
				<div className="break-words text-xs font-medium text-textSecondary sm:text-sm">{title}</div>
				{loading ? (
					<div className="mt-1 h-8 w-16 animate-pulse rounded bg-surfaceVariant sm:h-9" />
				) : (
					<div className="mt-1 break-words text-2xl font-extrabold leading-tight text-textPrimary sm:text-3xl">
						{countable !== null ? <CountUp value={countable} /> : value}
					</div>
				)}
				{displaySubtitle && !loading && (
					<div className={`mt-1 break-words text-[11px] font-semibold sm:text-xs ${iconColor}`}>
						{displaySubtitle}
					</div>
				)}
				{trend && !displaySubtitle && !loading && (
					<div className="mt-1 break-words text-[11px] font-semibold text-primary sm:text-xs">
						{trend}
					</div>
				)}
			</div>
		</TiltCard>
	);

	return href ? <Link href={href}>{inner}</Link> : inner;
};

export default StatCard;
