import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, Shield, Star } from "lucide-react";

interface ItemCardProps {
	item: {
		id: string;
		title: string;
		image?: string;
		category?: string;
		condition?: string;
		status?: string;
		rating?: number;
		reviews?: number;
		pricePerDay: number;
		deposit?: number;
		owner?: string;
		trustScore?: number;
		href?: string;
	};
	href?: string;
	actionsSlot?: React.ReactNode; // e.g. for Edit/Delete buttons
	topRightSlot?: React.ReactNode; // e.g. for Wishlist Remove button
}

const ItemCard = ({ item, href, actionsSlot, topRightSlot }: ItemCardProps) => {
	const badgeStyles = {
		category: "bg-blue-100/90 text-blue-800",
	};
	const conditionStyles: Record<string, string> = {
		excellent: "bg-emerald-100/90 text-emerald-800",
		"like new": "bg-blue-100/90 text-blue-800",
		good: "bg-amber-100/90 text-amber-800",
		fair: "bg-orange-100/90 text-orange-800",
	};

	const statusStyles: Record<string, string> = {
		AVAILABLE: "bg-emerald-100/90 text-emerald-800",
		UNAVAILABLE: "bg-amber-100/90 text-amber-800",
		BLOCKED: "bg-red-100/90 text-red-800",
		PENDING: "bg-blue-100/90 text-blue-800",
	};

	const itemHref = href || item.href || `/borrow/item/${item.id}`;

	return (
		<Link
			href={itemHref}
			className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface transition-all hover:border-primary/40 hover:shadow-md"
		>
			{/* Image Wrapper */}
			<div className="relative aspect-[4/3] w-full overflow-hidden bg-surfaceVariant">
				{item.image ? (
					<Image
						src={item.image}
						alt={item.title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-textTertiary">
						<ImageIcon className="h-8 w-8 opacity-50" />
					</div>
				)}

				<div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />

				{/* Badges / Slots */}
				{topRightSlot && (
					<div className="absolute right-2 top-2 z-10">
						{topRightSlot}
					</div>
				)}

				{!topRightSlot && item.condition && (
					<div className="absolute right-2 top-2 z-10">
						<span
							className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md sm:px-2 sm:text-[10px] ${
								conditionStyles[item.condition.toLowerCase()] ||
								"bg-surface/90 text-textSecondary"
							}`}
						>
							{item.condition}
						</span>
					</div>
				)}

				{(item.status || item.category) && (
					<div className="absolute left-2 top-2 z-10">
						{item.status ? (
							<span
								className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md sm:px-2 sm:text-xs ${
									statusStyles[item.status.toUpperCase()] ||
									"bg-surface/90 text-textSecondary"
								}`}
							>
								{item.status}
							</span>
						) : (
							<span
								className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md sm:px-2 sm:text-xs ${badgeStyles.category}`}
							>
								{item.category}
							</span>
						)}
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-3 sm:p-4">
				<h3 className="line-clamp-2 min-h-[2.5rem] break-words text-sm font-bold leading-tight text-textPrimary transition-colors group-hover:text-primary">
					{item.title}
				</h3>

				<div className="mt-2 flex items-baseline gap-1">
					<span className="text-sm font-extrabold text-primary sm:text-base">
						৳ {item.pricePerDay}
					</span>
					<span className="text-[10px] font-semibold text-textSecondary sm:text-xs">
						/day
					</span>
				</div>

				{typeof item.rating === "number" && (
					<div className="mt-1 flex items-center gap-1">
						<Star className="h-3 w-3 fill-warning text-warning" />
						<span className="text-xs font-bold">{item.rating}</span>
						<span className="text-[10px] text-textTertiary">({item.reviews ?? 0})</span>
					</div>
				)}

				{/* Owner / Trust Score (Compact) */}
				{item.owner && (
					<div className="mt-3 flex items-center justify-between border-t border-borderLight pt-3">
						<div className="flex min-w-0 items-center gap-1.5">
							<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primaryLight text-[9px] font-bold text-primary">
								{item.owner.charAt(0).toUpperCase()}
							</div>
							<span className="truncate text-xs font-medium text-textSecondary">
								{item.owner}
							</span>
						</div>
						{item.trustScore != null && (
							<div className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-success">
								<Shield className="h-3 w-3" />
								{item.trustScore}
							</div>
						)}
					</div>
				)}

				{actionsSlot && (
					<div className="mt-3 border-t border-borderLight pt-3">
						{actionsSlot}
					</div>
				)}
			</div>
		</Link>
	);
};

export default ItemCard;
