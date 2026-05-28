"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, X, Loader2 } from "lucide-react";
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
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
	const [form, setForm] = useState<FormState>({
		title: "",
		category: "",
		condition: "",
		description: "",
		price: "",
		deposit: "",
		availability: "",
	});
	const [categories, setCategories] = useState<{ id: string | number; name: string }[]>([]);
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [categoriesError, setCategoriesError] = useState("");

	const { previews, addFiles, removeFile, uploadAll, uploading, error: uploadError } =
		useImageUpload({ purpose: "ITEM_IMAGE", maxFiles: 5, maxSizeMB: 5 });

	React.useEffect(() => {
		let active = true;

		const fetchCategories = async () => {
			try {
				const res = await api.get("/categories");
				if (!active) return;
				
				const raw = res.data;
				const list = Array.isArray(raw)
					? raw
					: Array.isArray(raw?.data)
						? raw.data
						: Array.isArray(raw?.content)
							? raw.content
							: [];
				
				const normalizedCategories = list.map((c: any) => ({
					id: c.id ?? c.categoryId ?? c.name,
					name: c.name ?? "",
				}));
				setCategories(normalizedCategories);
			} catch (err) {
				if (active) {
					console.error("Failed to fetch categories:", err);
					setCategoriesError("Failed to load categories.");
				}
			} finally {
				if (active) setIsCategoriesLoading(false);
			}
		};

		fetchCategories();
		return () => { active = false; };
	}, []);

	const validate = (): boolean => {
		const errors: Partial<Record<keyof FormState, string>> = {};
		if (!form.title.trim() || form.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
		if (!form.category) errors.category = "Please select a category.";
		if (!form.condition) errors.condition = "Please select a condition.";
		if (!form.description.trim() || form.description.trim().length < 20) errors.description = "Description must be at least 20 characters.";
		const price = parseFloat(form.price);
		if (!form.price || isNaN(price) || price <= 0) errors.price = "Enter a valid daily price greater than 0.";
		if (form.deposit) {
			const dep = parseFloat(form.deposit);
			if (isNaN(dep) || dep < 0) errors.deposit = "Deposit must be a non-negative number.";
		}
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		if (!validate()) return;
		setIsLoading(true);

		try {
			const uploadedImageUrls = await uploadAll();

			const payload = {
				title: form.title,
				category: form.category,
				itemCondition: form.condition,
				description: form.description,
				dailyRate: parseFloat(form.price),
				deposit: form.deposit ? parseFloat(form.deposit) : null,
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
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (fieldErrors[name as keyof FormState]) {
			setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
		}
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
							className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1 ${fieldErrors.title ? "border-error focus:border-error focus:ring-error" : "border-borderLight focus:border-primary focus:ring-primary"}`}
							maxLength={100}
						/>
						{fieldErrors.title && <p className="text-xs text-error">{fieldErrors.title}</p>}
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
								required
								disabled={isCategoriesLoading || !!categoriesError}>
								<option value="">
									{isCategoriesLoading
										? "Loading categories..."
										: categoriesError
											? "Error loading categories"
											: "Select Category"}
								</option>
								{categories.map((c) => (
									<option key={c.id} value={c.name}>
										{c.name}
									</option>
								))}
							</select>
							{(categoriesError || fieldErrors.category) && (
								<p className="mt-1 text-xs text-error">{categoriesError || fieldErrors.category}</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Condition
							</label>
							<select
								name="condition"
								value={form.condition}
								onChange={handleChange}
								className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1 ${fieldErrors.condition ? "border-error focus:border-error focus:ring-error" : "border-borderLight focus:border-primary focus:ring-primary"}`}>
								<option value="">Select Condition</option>
								<option value="New">New</option>
								<option value="Good">Good</option>
								<option value="Fair">Fair</option>
							</select>
							{fieldErrors.condition && <p className="text-xs text-error">{fieldErrors.condition}</p>}
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
							className={`w-full resize-none rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1 ${fieldErrors.description ? "border-error focus:border-error focus:ring-error" : "border-borderLight focus:border-primary focus:ring-primary"}`}
							maxLength={1000}
						/>
						{fieldErrors.description && <p className="text-xs text-error">{fieldErrors.description}</p>}
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
								className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1 ${fieldErrors.price ? "border-error focus:border-error focus:ring-error" : "border-borderLight focus:border-primary focus:ring-primary"}`}
							/>
							{fieldErrors.price && <p className="text-xs text-error">{fieldErrors.price}</p>}
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
								className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1 ${fieldErrors.deposit ? "border-error focus:border-error focus:ring-error" : "border-borderLight focus:border-primary focus:ring-primary"}`}
							/>
							{fieldErrors.deposit && <p className="text-xs text-error">{fieldErrors.deposit}</p>}
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
					{uploading || isLoading ? (
						<span className="flex items-center justify-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							{uploading ? "Uploading images..." : "Publishing..."}
						</span>
					) : (
						"Publish Listing"
					)}
				</button>
			</form>
		</div>
	);
}
