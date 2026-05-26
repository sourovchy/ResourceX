"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";

type ItemResponse = {
	id?: string | number;
	itemId?: string | number;
	title?: string;
	category?: string;
	itemCategory?: string;
	condition?: string;
	itemCondition?: string;
	description?: string;
	dailyRate?: number | string;
	securityDeposit?: number | string;
	deposit?: number | string;
	isActive?: boolean;
	available?: boolean;
	status?: string;
	imageUrls?: string[];
	images?: string[];
	[item: string]: unknown;
};

const toStringValue = (value: unknown, fallback = "") => {
	if (value === null || value === undefined) return fallback;
	return String(value);
};

const toNumberString = (value: unknown, fallback = "") => {
	if (value === null || value === undefined || value === "") return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? String(n) : fallback;
};

const unwrapItem = (payload: unknown): ItemResponse | null => {
	if (!payload || typeof payload !== "object") return null;

	const record = payload as Record<string, unknown>;
	const candidates = [record.data, record.item, record.result, record.payload, payload];

	for (const candidate of candidates) {
		if (candidate && typeof candidate === "object") {
			return candidate as ItemResponse;
		}
	}

	return null;
};

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
	const [deposit, setDeposit] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [images, setImages] = useState<File[]>([]);

	useEffect(() => {
		const loadItem = async () => {
			if (!id) return;

			setIsFetching(true);
			setError("");

			try {
				const res = await api.get(`/items/${id}`);
				const item = unwrapItem(res.data);

				if (!item) {
					throw new Error("Item not found.");
				}

				setTitle(toStringValue(item.title));
				setCategory(toStringValue(item.category ?? item.itemCategory));
				setCondition(toStringValue(item.condition ?? item.itemCondition));
				setDesc(toStringValue(item.description));
				setPrice(toNumberString(item.dailyRate));
				setDeposit(toNumberString(item.securityDeposit ?? item.deposit));
				setIsActive(Boolean(item.isActive ?? item.available ?? item.status === "ACTIVE"));
			} catch (err: any) {
				console.error("Failed to load item", err);
				setError(err?.response?.data?.message || err.message || "Failed to load item");
			} finally {
				setIsFetching(false);
			}
		};

		loadItem();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const uploadedImageUrls: string[] = [];
			if (images.length > 0) {
				for (const file of images) {
					const formData = new FormData();
					formData.append("file", file);
					const uploadRes = await api.post("/files/upload?purpose=ITEM_IMAGE", formData, {
						headers: { "Content-Type": "multipart/form-data" },
					});
					if (uploadRes.data && uploadRes.data.fileUrl) {
						uploadedImageUrls.push(uploadRes.data.fileUrl);
					}
				}
			}

			const payload: Record<string, unknown> = {
				title,
				category,
				itemCondition: condition,
				description: desc,
				dailyRate: Number.parseFloat(price),
				securityDeposit: deposit ? Number.parseFloat(deposit) : 0,
				isActive,
			};

			if (uploadedImageUrls.length > 0) {
				payload.imageUrls = uploadedImageUrls;
			}

			await api.put(`/items/${id}`, payload);
			setSubmitted(true);
		} catch (err: any) {
			console.error("Failed to update item", err);
			setError(err?.response?.data?.message || err.message || "Failed to update item");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	const fieldDisabled = !isActive;

	if (isFetching) {
		return (
			<div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-3 px-3 py-16 text-center sm:px-4 sm:py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">Loading item details...</p>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successLight text-success sm:h-20 sm:w-20">
					<CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">Changes Saved!</h1>
				<p className="text-sm text-textSecondary sm:text-base">Your item has been updated successfully.</p>
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

			<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">Edit Item</h1>

				<div className="flex items-center gap-2 rounded-xl bg-surfaceVariant px-4 py-2 text-sm font-bold text-textPrimary">
					Available:
					<button
						type="button"
						onClick={() => setIsActive(!isActive)}
						className={`relative h-5 w-10 rounded-full transition-colors ${isActive ? "bg-success" : "bg-outlineVariant"}`}>
						<span
							className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
								isActive ? "left-[22px]" : "left-0.5"
							}`}
						/>
					</button>
				</div>
			</div>

			{!isActive && (
				<div className="rounded-xl border border-warning/30 bg-warningLight px-4 py-3 text-sm font-medium text-warning">
					This item is currently unavailable. Enable availability before editing the listing details.
				</div>
			)}

			{error && <div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">{error}</div>}

			<form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-xs font-bold uppercase tracking-wider text-textSecondary sm:text-sm">
						Basic Info
					</h2>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">Title</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={fieldDisabled}
							className={`w-full rounded-xl border border-borderLight px-4 py-3 text-sm transition ${
								fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "bg-surface text-textPrimary"
							}`}
							maxLength={100}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">Category</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								disabled={fieldDisabled}
								className={`w-full rounded-xl border border-borderLight px-4 py-3 text-sm transition ${
									fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "bg-surface text-textPrimary"
								}`}>
								<option value="Electronics">Electronics</option>
								<option value="Academic">Academic</option>
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">Condition</label>
							<select
								value={condition}
								onChange={(e) => setCondition(e.target.value)}
								disabled={fieldDisabled}
								className={`w-full rounded-xl border border-borderLight px-4 py-3 text-sm transition ${
									fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "bg-surface text-textPrimary"
								}`}>
								<option value="New">New</option>
								<option value="Good">Good</option>
								<option value="Fair">Fair</option>
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">Description</label>
						<textarea
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							rows={4}
							disabled={fieldDisabled}
							className={`w-full resize-none rounded-xl border border-borderLight px-4 py-3 text-sm transition ${
								fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "bg-surface text-textPrimary"
							}`}
							maxLength={1000}
						/>
					</div>
				</div>

				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-xs font-bold uppercase tracking-wider text-textSecondary sm:text-sm">
						Pricing & Deposit
					</h2>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">Daily Rental Rate</label>
							<p className="text-xs text-textSecondary">Enter rental cost per day. Example: 500 = ৳500/day</p>
							<input
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								type="number"
								min="0"
								max="100000"
								disabled={fieldDisabled}
								className={`w-full rounded-xl border px-4 py-3 text-sm transition ${
									fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "border-borderLight bg-surface text-textPrimary"
								}`}
								placeholder="e.g. 500"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">Security Deposit</label>
							<p className="text-xs text-textSecondary">Optional refundable amount before renting</p>
							<input
								value={deposit}
								onChange={(e) => setDeposit(e.target.value)}
								type="number"
								min="0"
								max="100000"
								disabled={fieldDisabled}
								className={`w-full rounded-xl border px-4 py-3 text-sm transition ${
									fieldDisabled ? "cursor-not-allowed bg-surfaceVariant text-textSecondary" : "border-borderLight bg-surface text-textPrimary"
								}`}
								placeholder="e.g. 100"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-3 sm:space-y-4">
					<h2 className="border-b border-borderLight pb-2 text-xs font-bold uppercase tracking-wider text-textSecondary sm:text-sm">
						Photos
					</h2>

					<label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant p-5 text-center transition-colors hover:border-primary sm:p-8 ${fieldDisabled ? "cursor-not-allowed opacity-60" : ""}`}>
						<UploadCloud className="mb-2 h-8 w-8 text-primary sm:h-10 sm:w-10" />
						<span className="text-sm font-bold text-textPrimary">Upload Photos</span>

						<input type="file" multiple className="hidden" onChange={handleFileChange} disabled={fieldDisabled} />
					</label>

					{images.length > 0 && <p className="mt-2 text-xs text-textSecondary">{images.length} file(s) selected</p>}
				</div>

				<button
					type="submit"
					disabled={fieldDisabled || isLoading}
					className={`mt-6 w-full rounded-xl py-3.5 font-bold shadow-sm transition-colors sm:mt-8 sm:py-4 ${
						fieldDisabled || isLoading
							? "cursor-not-allowed bg-outlineVariant text-textSecondary"
							: "bg-primary text-white hover:bg-primaryDark"
					}`}>
					{isLoading ? "Saving..." : "Save Changes"}
				</button>
			</form>
		</div>
	);
}
