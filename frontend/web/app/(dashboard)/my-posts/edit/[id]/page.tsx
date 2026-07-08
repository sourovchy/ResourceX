"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UploadCloud, CheckCircle2, X } from "lucide-react";
import api from "@/lib/api";
import type { ItemResponse } from "@/types/item";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Select } from "@/components/ui/Select";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/PageLoader";

export default function EditItemPage() {
	const params = useParams();
	const id = params?.id as string;

	const [submitted, setSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [error, setError] = useState("");

	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [condition, setCondition] = useState("");
	const [desc, setDesc] = useState("");
	const [price, setPrice] = useState("");
	const [availability, setAvailability] = useState("CAMPUS_ONLY");

	const [categories, setCategories] = useState<{ id: string | number; name: string }[]>([]);
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [categoriesError, setCategoriesError] = useState("");

	const {
		previews,
		setPreviews,
		addFiles,
		removeFile,
		uploadAll,
		uploading,
		error: uploadError,
	} = useImageUpload({ purpose: "ITEM_IMAGE", maxFiles: 5, maxSizeMB: 5 });

	useEffect(() => {
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

		const loadItem = async () => {
			if (!id) return;

			setIsFetching(true);
			setError("");

			try {
				const res = await api.get<ItemResponse>(`/items/${id}`);
				const item = res.data;

				setTitle(item.title ?? "");
				setCategory(item.category ?? "");
				setCondition(item.itemCondition ?? "");
				setDesc(item.description ?? "");
				setPrice(item.dailyRate != null ? String(item.dailyRate) : "");
				setAvailability(item.availabilityScope ?? "CAMPUS_ONLY");

				if (item.imageUrls?.length) {
					setPreviews(
						item.imageUrls.map((url) => ({
							url,
							storedName: url.split("/").pop(),
						})),
					);
				}
			} catch (err: any) {
				console.error("Failed to load item", err);
				setError(
					err?.response?.data?.message || err.message || "Failed to load item",
				);
			} finally {
				if (active) setIsFetching(false);
			}
		};

		loadItem();
		return () => { active = false; };
	}, [id, setPreviews]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const imageUrls = await uploadAll();

			const payload: Record<string, unknown> = {
				title,
				category,
				itemCondition: condition,
				description: desc,
				dailyRate: Number.parseFloat(price),
				imageUrls,
				availabilityScope: availability,
			};

			await api.put(`/items/${id}`, payload);
			setSubmitted(true);
		} catch (err: any) {
			console.error("Failed to update item", err);
			setError(
				err?.response?.data?.message || err.message || "Failed to update item",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return <PageLoader message="Loading item details..." />;
	}

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successLight text-success sm:h-20 sm:w-20">
					<CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Changes Saved!
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					Your item has been updated successfully.
				</p>
				<Link href="/my-posts" className="mt-4 inline-block">
					<Button className="px-5 py-3 sm:px-6">Back to My Posts</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 sm:px-6 sm:pb-20 lg:space-y-8 lg:px-8">
			<div className="mb-2">
				<h1 className="mt-1 text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
					Edit <span className="text-primary font-bold">item.</span>
				</h1>
			</div>

			{(error || uploadError) && (
				<div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
					{error || uploadError}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6 rounded-2xl border border-borderLight bg-surface p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8 lg:p-10">
				<div className="space-y-4 sm:space-y-5">
					<h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
						Basic Info
					</h2>

					<Field label="Title">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={100}
						/>
					</Field>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field label="Category" error={categoriesError}>
							<SearchableCombobox
								value={category}
								onChange={setCategory}
								options={categories.map((c) => ({ value: c.name, label: c.name }))}
								placeholder={isCategoriesLoading ? "Loading categories..." : "Select Category"}
								searchPlaceholder="Search categories..."
								error={!!categoriesError}
								required
								loading={isCategoriesLoading}
							/>
						</Field>

						<Field label="Condition">
							<Select
								value={condition}
								onChange={setCondition}
								options={[
									{ value: "New", label: "New" },
									{ value: "Good", label: "Good" },
									{ value: "Fair", label: "Fair" },
								]}
								placeholder="Select Condition"
								required
							/>
						</Field>
					</div>

					<Field label="Description">
						<Textarea
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							rows={4}
							maxLength={1000}
						/>
					</Field>
				</div>

				<div className="space-y-4 sm:space-y-5">
					<h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
						Rental Availability
					</h2>

					<div className="space-y-3">
						<label className="text-sm font-bold text-textPrimary block">Where are you willing to rent this item?</label>
						
						<div className="space-y-3">
							<label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${availability === "CAMPUS_ONLY" || !availability ? "border-primary bg-primaryLight/30" : "border-borderLight hover:border-primary/50"}`}>
								<div className="flex h-5 items-center">
									<input
										type="radio"
										name="availability"
										value="CAMPUS_ONLY"
										checked={availability === "CAMPUS_ONLY" || !availability}
										onChange={(e) => setAvailability(e.target.value)}
										className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
									/>
								</div>
								<div>
									<span className="block text-sm font-bold text-textPrimary">Campus Only</span>
									<span className="block text-xs text-textSecondary mt-0.5">You will only meet renters inside university campus.</span>
								</div>
							</label>

							<label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${availability === "CAMPUS_AND_OUTSIDE" ? "border-primary bg-primaryLight/30" : "border-borderLight hover:border-primary/50"}`}>
								<div className="flex h-5 items-center">
									<input
										type="radio"
										name="availability"
										value="CAMPUS_AND_OUTSIDE"
										checked={availability === "CAMPUS_AND_OUTSIDE"}
										onChange={(e) => setAvailability(e.target.value)}
										className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
									/>
								</div>
								<div>
									<span className="block text-sm font-bold text-textPrimary">Campus & Outside Campus</span>
									<span className="block text-xs text-textSecondary mt-0.5">You are willing to meet renters both inside and outside campus.</span>
								</div>
							</label>
						</div>
					</div>
				</div>

				<div className="space-y-4 sm:space-y-5">
					<h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
						Pricing
					</h2>

					<Field
						label="Daily Rental Rate"
						hint="Enter rental cost per day. Example: 500 = ৳500/day"
					>
						<Input
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							type="number"
							min="0"
							max="100000"
							placeholder="e.g. 500"
						/>
					</Field>
				</div>

				<div className="space-y-4 sm:space-y-5">
					<h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
						Photos
					</h2>

					<label
						className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant p-5 text-center transition-colors hover:border-primary sm:p-8">
						<UploadCloud className="mb-2 h-8 w-8 text-primary sm:h-10 sm:w-10" />
						<span className="text-sm font-bold text-textPrimary">
							Upload Photos
						</span>
						<span className="mt-1 text-xs text-textSecondary">
							JPEG, PNG, WEBP · up to 5 MB each · max 5 images
						</span>
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
									{/* eslint-disable-next-line @next/next/no-img-element -- blob/object-URL preview; next/image cannot optimize these */}
									<img
										src={p.url}
										alt=""
										className="h-full w-full object-cover"
									/>
									{
										<button
											type="button"
											onClick={() => removeFile(i)}
											className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-error">
											<X className="h-3 w-3" />
										</button>
									}
								</div>
							))}
						</div>
					)}
				</div>

				<Button
					type="submit"
					disabled={isLoading || uploading}
					loading={uploading || isLoading}
					className="mt-8 w-full py-4 text-base font-bold shadow-sm sm:mt-10 sm:py-5 lg:text-lg"
				>
					{uploading ? "Uploading images..." : isLoading ? "Saving..." : "Save Changes"}
				</Button>
			</form>
		</div>
	);
}
