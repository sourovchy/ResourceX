import React from "react";
import Link from "next/link";

/**
 * ActionCard Component
 * Clickable card for navigating to actions/pages with icon and description
 */
interface ActionCardProps {
	href: string;
	icon: React.ReactNode;
	title: string;
	description?: string;
	bgIcon?: string; // bg color classes for icon container
	className?: string;
}

const ActionCard = ({
	href,
	icon,
	title,
	description,
	bgIcon = "bg-blue-100",
	className = "",
}: ActionCardProps) => {
	return (
		<Link
			href={href}
			className={`
				group flex min-h-[140px] flex-col gap-3 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm transition-all
				hover:border-outline hover:shadow-md focus:outline-none focus:ring-4 focus:ring-primaryLight
				sm:min-h-[160px] sm:gap-4 sm:p-5
				${className}
			`.trim()}>
			<div
				className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-80 transition-colors sm:h-12 sm:w-12 ${bgIcon}`}>
				<div className="scale-90 sm:scale-100">{icon}</div>
			</div>
			<div className="min-w-0 flex-1">
				<h3 className="break-words text-sm font-bold text-textPrimary transition-colors group-hover:text-primary sm:text-base">
					{title}
				</h3>
				{description && (
					<p className="mt-1 line-clamp-3 break-words text-xs leading-relaxed text-textSecondary sm:text-sm">
						{description}
					</p>
				)}
			</div>
		</Link>
	);
};

export default ActionCard;
