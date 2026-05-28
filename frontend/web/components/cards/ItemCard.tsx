import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, Shield, Star } from "lucide-react";

interface ItemCardProps {
	item: {
		id: string;
		title: string;
		image?: string;
		category: string;
		condition: string;
		rating?: number;
		reviews?: number;
		pricePerDay: number;
		deposit?: number;
		owner: string;
		trustScore: number;
		href?: string; // optional custom href
	};
	href?: string; // override default href
}

const ItemCard = ({ item, href }: ItemCardProps) => {
	const badgeStyles = {
		category: "bg-blue-100/90 text-blue-700",
	};
	const conditionStyles: Record<string, string> = {
		excellent: "bg-emerald-100/90 text-emerald-700",
		"like new": "bg-blue-100/90 text-blue-700",
		good: "bg-amber-100/90 text-amber-700",
		fair: "bg-red-100/90 text-red-700",
	};

	const itemHref = href || item.href || `/borrow/item/${item.id}`;

	return (
		<Link
			href={itemHref}
			className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface transition-all hover:shadow-md"
		>
			{/* Image */}
			<div className="relative h-40 w-full overflow-hidden xs:h-44 sm:h-48 md:h-52">
				{item.image ? (
					<Image
						src={item.image}
						alt={item.title}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					/>
				) : (
					<div className="w-full h-full bg-surfaceVariant flex items-center justify-center text-textTertiary">
						<ImageIcon className="w-10 h-10" />
					</div>
				)}

				{/* subtle overlay for readability */}
				<div className="absolute inset-0 bg-black/10" />

				{/* Category */}
				<div className="absolute top-3 left-3">
					<span
						className={`rounded-full px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-md sm:px-3 sm:text-xs ${badgeStyles.category}`}
					>
						{item.category}
					</span>
				</div>

				{/* Condition */}
				<div className="absolute top-3 right-3">
					<span
						className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-md sm:px-3 sm:text-xs ${
							conditionStyles[item.condition.toLowerCase()] ||
							"bg-gray-100/90 text-gray-700"
						}`}
					>
						{item.condition}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-3 sm:p-4">
				<h3 className="line-clamp-2 break-words text-sm font-bold leading-snug text-textPrimary sm:text-base">
					{item.title}
				</h3>

				{typeof item.rating === "number" && (
					<div className="mt-2 flex flex-wrap items-center gap-1.5">
						<Star className="w-3.5 h-3.5 text-warning fill-warning" />
						<span className="text-sm font-bold">{item.rating}</span>
						<span className="text-xs text-textTertiary">({item.reviews ?? 0})</span>
					</div>
				)}

				<div className="mt-4 flex items-start justify-between gap-3 border-t border-borderLight pt-4">
					<div>
						<div className="text-xs text-textSecondary uppercase">Rent</div>
						<div className="text-base font-extrabold text-primary sm:text-lg">
							৳ {item.pricePerDay}
						</div>
					</div>
					<div>
						<div className="text-xs text-textSecondary uppercase">Deposit</div>
						<div className="text-sm font-bold">
							{typeof item.deposit === "number" ? `৳ ${item.deposit}` : "N/A"}
						</div>
					</div>
				</div>

				<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surfaceVariant p-2.5 sm:p-3">
					<div className="flex min-w-0 items-center gap-2">
						<div className="w-6 h-6 rounded-full bg-primaryLight flex items-center justify-center text-[10px] font-bold text-primary">
							{item.owner.charAt(0)}
						</div>
						<span className="truncate text-xs font-semibold sm:text-sm">{item.owner}</span>
					</div>

					<div className="flex shrink-0 items-center gap-1 text-xs font-bold text-success">
						<Shield className="w-3.5 h-3.5" />
						{item.trustScore}
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ItemCard;
