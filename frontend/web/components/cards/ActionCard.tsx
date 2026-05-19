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
				group bg-surface border border-borderLight p-5 rounded-2xl shadow-sm 
				hover:shadow-md hover:border-outline outline-none focus:ring-4 focus:ring-primaryLight 
				transition-all flex flex-col gap-3
				${className}
			`.trim()}>
			<div
				className={`w-12 h-12 flex items-center justify-center rounded-xl bg-opacity-80 transition-colors ${bgIcon}`}>
				{icon}
			</div>
			<div>
				<h3 className="text-sm font-bold text-textPrimary group-hover:text-primary transition-colors">
					{title}
				</h3>
				{description && (
					<p className="text-xs text-textSecondary mt-1 leading-relaxed">
						{description}
					</p>
				)}
			</div>
		</Link>
	);
};

export default ActionCard;
