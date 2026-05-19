"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, CheckCircle2 } from "lucide-react";

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
	const [form, setForm] = useState<FormState>({
		title: "",
		category: "",
		condition: "",
		description: "",
		price: "",
		deposit: "",
		availability: "",
	});

	const [images, setImages] = useState<File[]>([]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		console.log({ ...form, images });

		setSubmitted(true);
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>

				<h1 className="text-3xl font-extrabold text-textPrimary">
					Item Published!
				</h1>

				<p className="text-textSecondary">
					Your item is now live in the CampusVault catalog and available for
					users to view right away.
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

			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Add New Item
			</h1>

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
							name="title"
							value={form.title}
							onChange={handleChange}
							type="text"
							placeholder="e.g. Sony Alpha A7III"
							className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Category
							</label>
							<select
								name="category"
								value={form.category}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
								required>
								<option value="">Select Category</option>
								<option value="Electronics">Electronics</option>
								<option value="Academic">Academic</option>
								<option value="Events">Events</option>
								<option value="Outdoors">Outdoors</option>
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
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
							className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
							required
						/>
					</div>
				</div>
				{/* Pricing & Deposit */}
				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-borderLight pb-2">
						Pricing & Deposit
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								placeholder="Rental cost per day e.g. 500"
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
								placeholder="Optional security deposit e.g. 100"
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>
				</div>

				{/* Photos */}
				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-borderLight pb-2">
						Photos
					</h2>

					<label className="border-2 border-dashed border-borderLight bg-surfaceVariant rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer">
						<UploadCloud className="w-10 h-10 text-primary mb-3" />
						<p className="text-sm font-bold text-textPrimary mb-1">
							Click to upload photos
						</p>
						<p className="text-xs text-textSecondary">
							PNG, JPG up to 5MB (Min 1 required)
						</p>

						<input
							type="file"
							multiple
							className="hidden"
							onChange={handleFileChange}
						/>
					</label>

					{images.length > 0 && (
						<p className="text-xs text-textSecondary">
							{images.length} file(s) selected
						</p>
					)}
				</div>

				<button
					type="submit"
					className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors mt-8">
					Publish Listing
				</button>
			</form>
		</div>
	);
}
