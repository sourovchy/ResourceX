"use client";

import Link from "next/link";
import { Heart, Search } from "lucide-react";

export default function WishlistPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						<Heart className="h-6 w-6 fill-error text-error" /> My Wishlist
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Items you&apos;ve saved for later renting.
					</p>
				</div>
				<div className="w-full rounded-xl border border-primary/20 bg-primaryLight px-4 py-2 text-center text-sm font-bold text-primary md:w-auto">
					0 Items Saved
				</div>
			</div>

			<div className="rounded-2xl border border-borderLight bg-surface px-4 py-12 text-center shadow-sm sm:py-16">
				<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight">
					<Heart className="h-10 w-10 text-error opacity-50" />
				</div>
				<h3 className="text-xl font-bold text-textPrimary sm:text-2xl">
					Wishlist coming soon
				</h3>
				<p className="mx-auto mb-6 mt-2 max-w-md px-2 text-sm text-textSecondary sm:text-base">
					Save items to your wishlist for quick access later. This feature is on its way.
					In the meantime, browse the catalog and book directly.
				</p>
				<Link
					href="/borrow"
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:text-base">
					<Search className="h-5 w-5" /> Browse Items
				</Link>
			</div>
		</div>
	);
}
