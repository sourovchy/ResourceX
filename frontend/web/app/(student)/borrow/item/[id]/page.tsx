"use client";

import React from "react";
import Link from "next/link";
import {
	Star,
	MapPin,
	CalendarDays,
	Shield,
	CheckCircle2,
	AlertTriangle,
	ArrowLeft,
	Heart,
	MessageSquare,
} from "lucide-react";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
	// Mock item data based on ID matching one from the list above, or just a static one
	const item = {
		id: params.id,
		title: "Sony Alpha A7III DSLR Camera",
		category: "Electronics",
		condition: "Excellent",
		description:
			"Professional mirrorless camera perfect for event photography or videography. Includes 28-70mm lens, 2 spare batteries, and a 64GB fast SD card. Please handle with extreme care and do not use in rainy conditions.",
		pricePerDay: 500,
		deposit: 5000,
		rating: 4.8,
		reviews: 14,
		owner: {
			name: "Arif Hossain",
			trustScore: 105,
			isVerified: true,
			joined: "Jan 2024",
			completedRentals: 42,
		},
		images: [
			"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800&h=500",
			"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=800&h=500",
		],
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			{/* Back button */}
			<Link
				href="/borrow"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Browse
			</Link>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Images Area */}
				<div className="space-y-4">
					<div className="bg-surfaceVariant rounded-2xl overflow-hidden aspect-[4/3] border border-borderLight relative group">
						<img
							src={item.images[0]}
							alt={item.title}
							className="w-full h-full object-cover"
						/>
						<button className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-textSecondary hover:text-error hover:bg-errorLight transition-all">
							<Heart className="w-5 h-5" />
						</button>
					</div>
					<div className="flex gap-4 overflow-x-auto pb-2">
						{item.images.map((img, i) => (
							<div
								key={i}
								className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer ${i === 0 ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
								<img src={img} alt="" className="w-full h-full object-cover" />
							</div>
						))}
					</div>
				</div>

				{/* Details Area */}
				<div className="space-y-6">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<span className="px-2.5 py-1 bg-primaryLight text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
								{item.category}
							</span>
							<span className="px-2.5 py-1 bg-surfaceVariant text-textSecondary rounded-md text-[10px] font-bold uppercase tracking-wider">
								Condition: {item.condition}
							</span>
						</div>
						<h1 className="text-2xl font-bold text-textPrimary leading-tight mb-2">
							{item.title}
						</h1>
						<div className="flex items-center gap-4 text-sm text-textSecondary">
							<span className="flex items-center gap-1">
								<Star className="w-4 h-4 text-warning fill-warning" />
								<span className="font-bold text-textPrimary">
									{item.rating}
								</span>{" "}
								({item.reviews} reviews)
							</span>
						</div>
					</div>

					<div className="bg-surface border border-borderLight rounded-2xl p-5 shadow-sm space-y-4">
						<div className="flex justify-between items-center pb-4 border-b border-borderLight">
							<div>
								<div className="text-sm font-semibold text-textSecondary mb-1">
									Rental Price
								</div>
								<div className="text-3xl font-extrabold text-primary">
									৳ {item.pricePerDay}
									<span className="text-sm text-textSecondary font-medium">
										{" "}
										/ day
									</span>
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm font-semibold text-textSecondary mb-1">
									Deposit
								</div>
								<div className="text-xl font-bold text-textPrimary">
									৳ {item.deposit}
								</div>
							</div>
						</div>
						<Link
							href={`/borrow/book/${item.id}`}
							className="block w-full py-3.5 bg-primary text-white text-center rounded-xl font-bold hover:bg-primaryDark transition-colors shadow-sm">
							Book This Item
						</Link>
						<div className="flex items-start gap-2 bg-warningLight/50 text-warningDark p-3 rounded-xl text-xs font-medium">
							<AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
							Deposit is fully refundable provided the item is returned in the
							same condition.
						</div>
					</div>

					{/* Owner Card */}
					<div>
						<h2 className="text-base font-bold text-textPrimary mb-3">
							Item Owner
						</h2>
						<Link
							href={`/profile/${item.owner.name}`}
							className="block bg-surface border border-borderLight rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-primaryLight text-primary rounded-full flex items-center justify-center font-extrabold text-lg">
									{item.owner.name.charAt(0)}
								</div>
								<div>
									<div className="font-bold text-textPrimary flex items-center gap-1.5">
										{item.owner.name}
										{item.owner.isVerified && (
											<CheckCircle2 className="w-4 h-4 text-success" />
										)}
									</div>
									<div className="text-xs text-textSecondary mt-0.5">
										Joined {item.owner.joined}
									</div>
								</div>
							</div>
							<div className="text-right flex flex-col items-end">
								<div className="flex items-center gap-1.5 bg-successLight text-success px-2 py-1 rounded-md text-xs font-bold leading-none mb-1">
									<Shield className="w-3.5 h-3.5" /> {item.owner.trustScore}{" "}
									Trust
								</div>
								<div className="text-xs text-textSecondary font-medium">
									{item.owner.completedRentals} Rentals
								</div>
							</div>
						</Link>
					</div>

					<div className="space-y-2">
						<h3 className="text-base font-bold text-textPrimary">
							Description
						</h3>
						<p className="text-sm text-textSecondary leading-relaxed whitespace-pre-line">
							{item.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
