"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UploadCloud, CheckCircle2 } from "lucide-react";

export default function EditItemPage() {
	const params = useParams();
	const id = params?.id as string;

	const [submitted, setSubmitted] = useState(false);

	// Mock pre-filled data
	const [title, setTitle] = useState("Sony Alpha A7III DSLR Camera");
	const [category, setCategory] = useState("Electronics");
	const [condition, setCondition] = useState("Good");
	const [desc, setDesc] = useState(
		"Professional mirrorless camera perfect for event photography or videography. Includes 28-70mm lens, 2 spare batteries, and a 64GB fast SD card.",
	);
	const [price, setPrice] = useState("500");
	const [deposit, setDeposit] = useState("5000");
	const [isActive, setIsActive] = useState(true);
	const [images, setImages] = useState<File[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		console.log({
			id,
			title,
			category,
			condition,
			desc,
			price,
			deposit,
			isActive,
			images,
		});

		setSubmitted(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	const fieldDisabled = !isActive;

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Changes Saved!
				</h1>
				<p className="text-textSecondary">
					Your item has been updated successfully.
				</p>
				<Link
					href="/my-posts"
					className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Back to My Posts
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-6 pb-20">
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to My Posts
			</Link>

			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
					Edit Item
				</h1>

				<div className="flex items-center gap-2 text-sm font-bold bg-surfaceVariant px-4 py-2 rounded-xl text-textPrimary">
					Available:
					<button
						type="button"
						onClick={() => setIsActive(!isActive)}
						className={`w-10 h-5 rounded-full relative transition-colors ${
							isActive ? "bg-success" : "bg-outlineVariant"
						}`}>
						<span
							className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
								isActive ? "left-[22px]" : "left-0.5"
							}`}></span>
					</button>
				</div>
			</div>

			{!isActive && (
				<div className="bg-warningLight border border-warning/30 text-warning text-sm font-medium px-4 py-3 rounded-xl">
					This item is currently unavailable. Enable availability before editing
					the listing details.
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-borderLight p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
				{/* Basic Info */}
				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-borderLight pb-2">
						Basic Info
					</h2>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">Title</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={fieldDisabled}
							className={`w-full px-4 py-3 border border-borderLight rounded-xl ${
								fieldDisabled
									? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
									: "bg-surface"
							}`}
						/>
					</div>

					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Category
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								disabled={fieldDisabled}
								className={`w-full px-4 py-3 border border-borderLight rounded-xl ${
									fieldDisabled
										? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
										: "bg-surface"
								}`}>
								<option>Electronics</option>
								<option>Academic</option>
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Condition
							</label>
							<select
								value={condition}
								onChange={(e) => setCondition(e.target.value)}
								disabled={fieldDisabled}
								className={`w-full px-4 py-3 border border-borderLight rounded-xl ${
									fieldDisabled
										? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
										: "bg-surface"
								}`}>
								<option>New</option>
								<option>Good</option>
								<option>Fair</option>
							</select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">
							Description
						</label>
						<textarea
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							rows={4}
							disabled={fieldDisabled}
							className={`w-full px-4 py-3 border border-borderLight rounded-xl ${
								fieldDisabled
									? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
									: "bg-surface"
							}`}
						/>
					</div>
				</div>

				{/* Pricing */}
				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-borderLight pb-2">
						Pricing & Deposit
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Daily Rental Rate
							</label>

							<p className="text-xs text-textSecondary">
								Enter rental cost per day. Example: 500 = ৳500/day
							</p>

							<input
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								type="number"
								min="0"
								disabled={fieldDisabled}
								className={`w-full px-4 py-3 border rounded-xl transition ${
									fieldDisabled
										? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
										: "bg-surface border-borderLight"
								}`}
								placeholder="e.g. 500"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Security Deposit
							</label>

							<p className="text-xs text-textSecondary">
								Optional refundable amount before renting
							</p>

							<input
								value={deposit}
								onChange={(e) => setDeposit(e.target.value)}
								type="number"
								min="0"
								disabled={fieldDisabled}
								className={`w-full px-4 py-3 border rounded-xl transition ${
									fieldDisabled
										? "bg-surfaceVariant text-textSecondary cursor-not-allowed"
										: "bg-surface border-borderLight"
								}`}
								placeholder="e.g. 100"
							/>
						</div>
					</div>
				</div>

				{/* Photos */}
				<div>
					<label
						className={`border-2 border-dashed border-borderLight bg-surfaceVariant rounded-2xl p-6 flex flex-col items-center cursor-pointer ${
							fieldDisabled ? "opacity-60 cursor-not-allowed" : ""
						}`}>
						<UploadCloud className="w-8 h-8 mb-2 text-primary" />
						<span className="text-sm font-bold">Upload Photos</span>

						<input
							type="file"
							multiple
							className="hidden"
							onChange={handleFileChange}
							disabled={fieldDisabled}
						/>
					</label>

					{images.length > 0 && (
						<p className="text-xs text-textSecondary mt-2">
							{images.length} file(s) selected
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={fieldDisabled}
					className={`w-full py-4 rounded-xl font-bold transition-colors ${
						fieldDisabled
							? "bg-outlineVariant text-textSecondary cursor-not-allowed"
							: "bg-primary text-white hover:bg-primaryDark"
					}`}>
					Save Changes
				</button>
			</form>
		</div>
	);
}
