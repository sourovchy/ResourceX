import React from "react";
import Link from "next/link";
import { Star, Shield } from "lucide-react";

interface ItemCardProps {
	item: {
		id: string;
		title: string;
		image: string;
		category: string;
		condition: string;
		rating: number;
		reviews: number;
		pricePerDay: number;
		deposit: number;
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
			className="group bg-surface border border-borderLight rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col"
		>
			{/* Image */}
			<div className="relative h-48 w-full overflow-hidden">
				<img
					src={item.image}
					alt={item.title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>

				{/* subtle overlay for readability */}
				<div className="absolute inset-0 bg-black/10" />

				{/* Category */}
				<div className="absolute top-3 left-3">
					<span
						className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-semibold shadow-sm ${badgeStyles.category}`}
					>
						{item.category}
					</span>
				</div>

				{/* Condition */}
				<div className="absolute top-3 right-3">
					<span
						className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-semibold shadow-sm uppercase tracking-wide ${
							conditionStyles[item.condition.toLowerCase()] ||
							"bg-gray-100/90 text-gray-700"
						}`}
					>
						{item.condition}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 flex flex-col flex-1">
				<h3 className="text-base font-bold text-textPrimary line-clamp-2">
					{item.title}
				</h3>

				<div className="flex items-center gap-1.5 mt-2">
					<Star className="w-3.5 h-3.5 text-warning fill-warning" />
					<span className="text-sm font-bold">{item.rating}</span>
					<span className="text-xs text-textTertiary">({item.reviews})</span>
				</div>

				<div className="mt-4 pt-4 border-t border-borderLight flex justify-between">
					<div>
						<div className="text-xs text-textSecondary uppercase">Rent</div>
						<div className="text-lg font-extrabold text-primary">
							৳ {item.pricePerDay}
						</div>
					</div>
					<div>
						<div className="text-xs text-textSecondary uppercase">Deposit</div>
						<div className="text-sm font-bold">৳ {item.deposit}</div>
					</div>
				</div>

				<div className="mt-4 bg-surfaceVariant rounded-xl p-3 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded-full bg-primaryLight flex items-center justify-center text-[10px] font-bold text-primary">
							{item.owner.charAt(0)}
						</div>
						<span className="text-xs font-semibold">{item.owner}</span>
					</div>

					<div className="flex items-center gap-1 text-xs font-bold text-success">
						<Shield className="w-3.5 h-3.5" />
						{item.trustScore}
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ItemCard;
