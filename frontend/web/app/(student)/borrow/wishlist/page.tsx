"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	Star,
	Shield,
	CheckCircle2,
	Heart,
	Search,
	ArrowRight,
} from "lucide-react";

// Mock Data
const INITIAL_WISHLIST = [
	{
		id: "item-1",
		title: "Sony Alpha A7III DSLR Camera",
		category: "Electronics",
		condition: "Excellent",
		pricePerDay: 500,
		deposit: 5000,
		rating: 4.8,
		reviews: 14,
		owner: "Arif H.",
		trustScore: 105,
		isVerified: true,
		image:
			"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=300",
	},
	{
		id: "item-3",
		title: "JBL PartyBox 310",
		category: "Events",
		condition: "Like New",
		pricePerDay: 800,
		deposit: 3000,
		rating: 5.0,
		reviews: 8,
		owner: "Tanvir A.",
		trustScore: 110,
		isVerified: true,
		image:
			"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400&h=300",
	},
];

export default function WishlistPage() {
	const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);

	const handleRemove = (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		setWishlist((prev) => prev.filter((item) => item.id !== id));
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-20">
			{/* Page Header */}
			<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
						<Heart className="w-6 h-6 text-error fill-error" /> My Wishlist
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						Items you've saved for later renting.
					</p>
				</div>
				<div className="text-sm font-bold text-primary bg-primaryLight px-4 py-2 rounded-xl border border-primary/20">
					{wishlist.length} Items Saved
				</div>
			</div>

			{/* Items Grid */}
			{wishlist.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{wishlist.map((item) => (
						<WishlistCard key={item.id} item={item} onRemove={handleRemove} />
					))}
				</div>
			) : (
				<div className="bg-surface border border-borderLight rounded-2xl p-16 text-center shadow-sm">
					<div className="w-20 h-20 bg-errorLight rounded-full flex items-center justify-center mx-auto mb-5">
						<Heart className="w-10 h-10 text-error opacity-50" />
					</div>
					<h3 className="text-xl font-bold text-textPrimary">
						Your wishlist is empty
					</h3>
					<p className="text-textSecondary mt-2 mb-6 max-w-md mx-auto">
						You haven't saved any items yet. Browse the campus catalog and tap
						the heart icon to save items here for quick access later.
					</p>
					<Link
						href="/borrow"
						className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
						<Search className="w-5 h-5" /> Browse Items
					</Link>
				</div>
			)}
		</div>
	);
}

function WishlistCard({
	item,
	onRemove,
}: {
	item: any;
	onRemove: (e: React.MouseEvent, id: string) => void;
}) {
	return (
		<div className="group bg-surface border border-borderLight rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-outline transition-all flex flex-col relative h-full">
			<Link
				href={`/borrow/item/${item.id}`}
				className="absolute inset-0 z-0"></Link>

			{/* Image Area */}
			<div className="relative h-48 w-full overflow-hidden bg-surfaceVariant shrink-0">
				<img
					src={item.image}
					alt={item.title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
				<div className="absolute top-3 left-3 flex gap-2">
					<span className="px-2.5 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-lg text-xs font-bold text-textPrimary">
						{item.category}
					</span>
				</div>
				<div className="absolute top-3 right-3">
					<span className="px-2 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-md text-[10px] font-bold text-textSecondary uppercase tracking-wider">
						{item.condition}
					</span>
				</div>
			</div>

			{/* Content Area */}
			<div className="p-5 flex flex-col flex-1 z-10 pointer-events-none">
				<div className="flex justify-between items-start gap-2">
					<h3 className="text-base font-bold text-textPrimary leading-tight line-clamp-2 h-[40px] group-hover:text-primary transition-colors">
						{item.title}
					</h3>
					{/* Remove from wishlist button */}
					<button
						onClick={(e) => onRemove(e, item.id)}
						className="pointer-events-auto p-1.5 -mr-1.5 -mt-1 rounded-full text-error hover:bg-errorLight transition-colors"
						title="Remove from wishlist">
						<Heart className="w-5 h-5 fill-error" />
					</button>
				</div>

				{/* Rating */}
				<div className="flex items-center gap-1.5 mt-2">
					<Star className="w-3.5 h-3.5 text-warning fill-warning" />
					<span className="text-sm font-bold text-textPrimary">
						{item.rating}
					</span>
					<span className="text-xs text-textTertiary">({item.reviews})</span>
				</div>

				<div className="mt-4 pt-4 border-t border-borderLight flex items-center justify-between">
					<div>
						<div className="text-xs text-textSecondary uppercase tracking-wider font-semibold">
							Rent
						</div>
						<div className="text-lg font-extrabold text-primary border-transparent">
							৳ {item.pricePerDay}
							<span className="text-xs text-textSecondary font-medium">
								/day
							</span>
						</div>
					</div>
					<div className="text-right">
						<div className="text-xs text-textSecondary uppercase tracking-wider font-semibold">
							Deposit
						</div>
						<div className="text-sm font-bold text-textPrimary">
							৳ {item.deposit}
						</div>
					</div>
				</div>

				{/* Actions & Owner Info */}
				<div className="mt-5 pt-4 border-t border-borderLight flex flex-col gap-4 sticky bottom-0">
					{/* Owner Info inner row */}
					<div className="flex items-center justify-between pointer-events-auto">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded-full bg-primaryLight flex items-center justify-center text-[10px] font-bold text-primary">
								{item.owner.charAt(0)}
							</div>
							<span className="text-xs font-semibold text-textPrimary flex items-center gap-1">
								{item.owner}
								{item.isVerified && (
									<CheckCircle2 className="w-3 h-3 text-success inline" />
								)}
							</span>
						</div>
						<div className="flex items-center gap-1 text-xs font-bold text-success">
							<Shield className="w-3.5 h-3.5" /> {item.trustScore}
						</div>
					</div>

					<Link
						href={`/borrow/book/${item.id}`}
						className="pointer-events-auto w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
						Book Now <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
}
