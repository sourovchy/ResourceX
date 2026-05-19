import React from "react";
import Link from "next/link";

/**
 * Enhanced StatCard Component
 * Supports multiple display modes: simple stats, icon-based stats, and clickable cards
 */
interface StatCardProps {
	// Core properties
	title: string;
	value: string;

	// Optional icon styling
	icon?: React.ReactNode;
	tint?: string; // bg color classes for icon
	iconColor?: string; // text color for subtitle/icon

	// Optional display variants
	subtitle?: string;
	sub?: string; // Alias for subtitle
	trend?: string; // For simple stat display

	// Optional interactivity
	href?: string; // Makes card clickable/linkable
	className?: string;
}

const StatCard = ({
	icon,
	title,
	value,
	sub,
	subtitle,
	tint = "bg-blue-100",
	iconColor = "text-green-600",
	href,
	trend,
	className = "",
}: StatCardProps) => {
	// Support both 'sub' and 'subtitle' aliases
	const displaySubtitle = sub || subtitle;

	const inner = (
		<div
			className={`
				bg-surface border border-borderLight p-5 rounded-2xl shadow-sm 
				hover:shadow-md transition-all
				${icon ? "flex items-start gap-4" : "flex flex-col gap-2"}
				cursor-default group
				${href ? "cursor-pointer" : ""}
				${className}
			`.trim()}>
			{icon && <div className={`p-3 rounded-xl ${tint} shrink-0`}>{icon}</div>}
			<div className="min-w-0 flex-1">
				<div className="text-sm font-medium text-textSecondary">{title}</div>
				<div className="text-3xl font-extrabold text-textPrimary mt-0.5">
					{value}
				</div>
				{displaySubtitle && (
					<div className={`text-xs font-semibold mt-1 ${iconColor}`}>
						{displaySubtitle}
					</div>
				)}
				{trend && !displaySubtitle && (
					<div className="text-xs font-semibold mt-1 text-green-600">
						{trend}
					</div>
				)}
			</div>
		</div>
	);

	return href ? <Link href={href}>{inner}</Link> : inner;
};

export default StatCard;
