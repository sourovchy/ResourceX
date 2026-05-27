"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, CheckCircle2, X } from "lucide-react";
import api from "@/lib/api";
import { useImageUpload } from "@/hooks/useImageUpload";

type FormState = {
	title: string;
	category: string;
	condition: string;
	description: string;
	price: string;
	deposit: string;
	availability: string;
};

export default function AddItemPage() {
	const [submitted, setSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState<FormState>({
		title: "",
		category: "",
		condition: "",
		description: "",
		price: "",
		deposit: "",
		availability: "",
	});
	const [categories, setCategories] = useState<any[]>([]);

	const { previews, addFiles, removeFile, uploadAll, uploading, error: uploadError } =
		useImageUpload({ purpose: "ITEM_IMAGE", maxFiles: 5, maxSizeMB: 5 });

	React.useEffect(() => {
		api
			.get("/categories")
			.then((res) => setCategories(res.data?.content ?? res.data ?? []))
			.catch(console.error);
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const uploadedImageUrls = await uploadAll();

			const payload = {
				title: form.title,
				category: form.category,
				itemCondition: form.condition,
				description: form.description,
				dailyRate: parseFloat(form.price),
				imageUrls: uploadedImageUrls,
			};

			await api.post("/items", payload);
			setSubmitted(true);
		} catch (err: any) {
			console.error("Failed to create item", err);
			setError(err?.response?.data?.message || err.message || "Failed to create item");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successLight text-success sm:h-20 sm:w-20">
					<CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
				</div>

				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Item Published!
				</h1>

				<p className="text-sm text-textSecondary sm:text-base">
					Your item is now live in the ResourceX catalog and available for
					users to view right away.
				</p>

				<Link
					href="/my-posts"
					className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:px-6">
					Back to My Posts
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" /> Back to My Posts
			</Link>

			<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
				Add New Item
			</h1>

			{(error || uploadError) && (
				<div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
					{error || uploadError}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				{/* Basic Info */}
				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-xs font-bold uppercase tracking-wider text-textSecondary sm:text-sm">
						Basic Info
					</h2>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">Title</label>
						<input
							name="title"
							value={form.title}
							onChange={handleChange}
							type="text"
							placeholder="e.g. Sony Alpha A7III"
							className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							maxLength={100}
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Category
							</label>
							<select
								name="category"
								value={form.category}
								onChange={handleChange}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								required>
								<option value="">Select Category</option>
								{categories.map((c) => (
									<option key={c.id || c.name} value={c.name}>
										{c.name}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Condition
							</label>
							<select
								name="condition"
								value={form.condition}
								onChange={handleChange}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								required>
								<option value="">Select Condition</option>
								<option value="New">New</option>
								<option value="Good">Good</option>
								<option value="Fair">Fair</option>
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">
							Description
						</label>
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							rows={4}
							placeholder="Describe the item, what is included, and any important rules..."
							className="w-full resize-none rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							maxLength={1000}
							required
						/>
					</div>
				</div>

				{/* Pricing & Deposit */}
				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-sm font-bold uppercase tracking-wider text-textSecondary">
						Pricing & Deposit
					</h2>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Daily Rental Price
							</label>
							<input
								name="price"
								value={form.price}
								onChange={handleChange}
								type="number"
								min="0"
								max="100000"
								placeholder="Rental cost per day e.g. 500"
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Security Deposit
							</label>
							<input
								name="deposit"
								value={form.deposit}
								onChange={handleChange}
								type="number"
								min="0"
								max="100000"
								placeholder="Optional security deposit e.g. 100"
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>
				</div>

				{/* Photos */}
				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-sm font-bold uppercase tracking-wider text-textSecondary">
						Photos
					</h2>

					<label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant p-5 text-center transition-colors hover:border-primary sm:p-8">
						<UploadCloud className="mb-3 h-8 w-8 text-primary sm:h-10 sm:w-10" />
						<p className="mb-1 text-sm font-bold text-textPrimary">
							Click to upload photos
						</p>
						<p className="text-xs text-textSecondary">
							JPEG, PNG, WEBP · up to 5 MB each · max 5 images
						</p>
						<input
							type="file"
							multiple
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							onChange={(e) => e.target.files && addFiles(e.target.files)}
						/>
					</label>

					{previews.length > 0 && (
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
							{previews.map((p, i) => (
								<div
									key={i}
									className="relative aspect-square overflow-hidden rounded-xl border border-borderLight bg-surfaceVariant">
									<img
										src={p.url}
										alt=""
										className="h-full w-full object-cover"
									/>
									<button
										type="button"
										onClick={() => removeFile(i)}
										className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-error">
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading || uploading}
					className="mt-6 w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50 sm:mt-8 sm:py-4">
					{uploading
						? "Uploading images..."
						: isLoading
							? "Publishing..."
							: "Publish Listing"}
				</button>
			</form>
		</div>
	);
}
