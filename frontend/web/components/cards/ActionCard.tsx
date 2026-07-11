import React from "react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";

/**
 * ActionCard Component
 * Clickable card for navigating to actions/pages with icon and description.
 *
 * - `variant="tile"` (default): tall vertical card for action grids
 *   (dashboard shortcuts, management actions).
 * - `variant="row"`: compact horizontal row for sidebar "Quick Actions"
 *   lists — icon left, title + description right.
 */
interface ActionCardProps {
	href: string;
	icon: React.ReactNode;
	title: string;
	description?: string;
	/** bg (and optional text) color classes for the icon container */
	bgIcon?: string;
	variant?: "tile" | "row";
	className?: string;
}

const ActionCard = ({
	href,
	icon,
	title,
	description,
	bgIcon = "bg-primaryLight",
	variant = "tile",
	className = "",
}: ActionCardProps) => {
	if (variant === "row") {
		return (
			<TiltCard
				maxTilt={1}
				className={`group rounded-xl transition-colors hover:bg-surfaceVariant ${className}`.trim()}
			>
				<Link
					href={href}
					className="flex items-center gap-3 p-3 outline-none focus-visible:ring-2 focus-visible:ring-primaryLight"
				>
					<div
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgIcon}`}
					>
						{icon}
					</div>
					<div className="relative z-10 min-w-0 flex-1">
						<div className="font-semibold text-textPrimary transition-colors group-hover:text-primary">
							{title}
						</div>
						{description && (
							<div className="truncate text-xs text-textSecondary">
								{description}
							</div>
						)}
					</div>
				</Link>
			</TiltCard>
		);
	}

	return (
		<TiltCard
			maxTilt={1}
			className={`
				group flex min-h-[140px] flex-col gap-3 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm transition-all
				hover:border-outline hover:shadow-md focus-within:ring-4 focus-within:ring-primaryLight
				sm:min-h-[160px] sm:gap-4 sm:p-5
				${className}
			`.trim()}
		>
			<Link href={href} className="flex h-full flex-col gap-3 outline-none sm:gap-4">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-80 transition-colors sm:h-12 sm:w-12 ${bgIcon}`}>
					<div className="scale-90 sm:scale-100">{icon}</div>
				</div>
				<div className="relative z-10 min-w-0 flex-1">
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
		</TiltCard>
	);
};

export default ActionCard;
