import React from "react";
import Link from "next/link";

interface StatCardProps {
	title: string;
	value: string;
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
	sub,
	subtitle,
	tint = "bg-blue-100",
	iconColor = "text-green-600",
	href,
	trend,
	className = "",
}: StatCardProps) => {
	const displaySubtitle = sub || subtitle;

	const inner = (
		<div
			className={`
				group rounded-2xl border border-borderLight bg-surface p-4 shadow-sm transition-all hover:shadow-md
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
			<div className="min-w-0 flex-1 overflow-hidden">
				<div className="break-words text-xs font-medium text-textSecondary sm:text-sm">{title}</div>
				<div className="mt-1 break-words text-2xl font-extrabold leading-tight text-textPrimary sm:text-3xl">
					{value}
				</div>
				{displaySubtitle && (
					<div className={`mt-1 break-words text-[11px] font-semibold sm:text-xs ${iconColor}`}>
						{displaySubtitle}
					</div>
				)}
				{trend && !displaySubtitle && (
					<div className="mt-1 break-words text-[11px] font-semibold text-green-600 sm:text-xs">
						{trend}
					</div>
				)}
			</div>
		</div>
	);

	return href ? <Link href={href}>{inner}</Link> : inner;
};

export default StatCard;
