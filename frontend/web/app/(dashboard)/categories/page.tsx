"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tag, Plus, Edit2, Trash2, X, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage, logErrorDetails } from "@/lib/errorUtils";

interface Category {
	id: string | number;
	name: string;
	description: string;
	items: number;
}

interface CategoryApiResponse {
	id?: string | number;
	categoryId?: string | number;
	name?: string;
	description?: string;
	itemCount?: number;
	items?: number;
	activeItems?: number;
}

export default function AdminCategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [showAddModal, setShowAddModal] = useState(false);
	const [editId, setEditId] = useState<string | number | null>(null);
	const [deleteId, setDeleteId] = useState<string | number | null>(null);

	const [form, setForm] = useState({
		name: "",
		description: "",
	});

	const normalizeCategory = (data: CategoryApiResponse): Category => ({
		id: data.id ?? data.categoryId ?? "",
		name: data.name ?? "",
		description: data.description ?? "",
		items: Number(data.itemCount ?? data.items ?? data.activeItems ?? 0),
	});

	const fetchCategories = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get("/categories");

			const raw = response.data;

			const list = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.data)
					? raw.data
					: Array.isArray(raw?.content)
						? raw.content
						: [];

			setCategories(list.map(normalizeCategory));
		} catch (err) {
			logErrorDetails(err, {
				endpoint: "/api/categories",
				action: "Fetch Categories",
			});
			setError(extractErrorMessage(err));
			setCategories([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const resetForm = () => {
		setForm({
			name: "",
			description: "",
		});
	};

	const closeModal = () => {
		setShowAddModal(false);
		setEditId(null);
		resetForm();
	};

	const handleAdd = async () => {
		if (!form.name.trim()) return;

		try {
			setSubmitting(true);

			await api.post("/categories", {
				name: form.name.trim(),
				description: form.description.trim(),
			});

			await fetchCategories();
			closeModal();
		} catch (err) {
			console.error(err);
			setError("Failed to create category.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = async () => {
		if (!editId) return;

		try {
			setSubmitting(true);

			await api.put(`/categories/${editId}`, {
				name: form.name.trim(),
				description: form.description.trim(),
			});

			await fetchCategories();
			closeModal();
		} catch (err) {
			console.error(err);
			setError("Failed to update category.");
		} finally {
			setSubmitting(false);
		}
	};

	const startEdit = (category: Category) => {
		setEditId(category.id);

		setForm({
			name: category.name,
			description: category.description,
		});
	};

	const handleDelete = async (id: string | number) => {
		try {
			setSubmitting(true);

			await api.delete(`/categories/${id}`);

			setCategories((prev) => prev.filter((c) => c.id !== id));

			setDeleteId(null);
		} catch (err) {
			console.error(err);
			setError("Category cannot be deleted. Remove related items first.");
		} finally {
			setSubmitting(false);
		}
	};

	const deleteTarget = useMemo(
		() => categories.find((c) => c.id === deleteId),
		[categories, deleteId],
	);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-medium sm:text-base">Loading categories...</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-8 sm:space-y-6 sm:px-0 sm:pb-0">
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6">
				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Categories
					</h1>

					<p className="mt-1 text-sm text-textSecondary">
						Manage item categories from the backend database.
					</p>
				</div>

				<div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
					<button
						onClick={fetchCategories}
						className="flex w-full items-center justify-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant sm:w-auto">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</button>

					<button
						onClick={() => {
							resetForm();
							setShowAddModal(true);
						}}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-onPrimary shadow transition hover:opacity-90 sm:w-auto">
						<Plus className="h-4 w-4" />
						Add Category
					</button>
				</div>
			</div>

			{error && (
				<div className="rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			{/* Add/Edit Modal */}
			{(showAddModal || editId) && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
					<div className="w-full max-w-md space-y-4 rounded-2xl border border-borderLight bg-surface p-5 shadow-2xl sm:p-6">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-lg font-bold text-textPrimary">
								{editId ? "Edit Category" : "New Category"}
							</h3>

							<button onClick={closeModal} aria-label="Close modal">
								<X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
							</button>
						</div>

						<div>
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Category Name
							</label>

							<input
								type="text"
								value={form.name}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								placeholder="e.g. Musical Instruments"
								className="mt-1.5 w-full rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div>
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Description
							</label>

							<textarea
								rows={3}
								value={form.description}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Brief description..."
								className="mt-1.5 w-full resize-none rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<button
								onClick={closeModal}
								className="w-full rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant sm:flex-1">
								Cancel
							</button>

							<button
								onClick={editId ? handleEdit : handleAdd}
								disabled={submitting}
								className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1">
								{submitting
									? "Saving..."
									: editId
										? "Save Changes"
										: "Create Category"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Modal */}
			{deleteId && deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
					<div className="w-full max-w-sm space-y-4 rounded-2xl border border-borderLight bg-surface p-5 shadow-2xl sm:p-6">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-lg font-bold text-textPrimary">
								Delete Category
							</h3>

							<button onClick={() => setDeleteId(null)} aria-label="Close modal">
								<X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
							</button>
						</div>

						{deleteTarget.items > 0 ? (
							<div className="rounded-xl border border-error/30 bg-errorLight p-4 text-sm text-error">
								<strong>Cannot delete.</strong> This category has {deleteTarget.items} active items.
							</div>
						) : (
							<p className="text-sm text-textSecondary">
								Are you sure you want to delete <strong className="text-textPrimary">{deleteTarget.name}</strong>?
							</p>
						)}

						<div className="flex flex-col gap-3 sm:flex-row">
							<button
								onClick={() => setDeleteId(null)}
								className="w-full rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant sm:flex-1">
								{deleteTarget.items > 0 ? "Close" : "Cancel"}
							</button>

							{deleteTarget.items === 0 && (
								<button
									onClick={() => handleDelete(deleteId)}
									disabled={submitting}
									className="w-full rounded-xl bg-error py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:flex-1">
									{submitting ? "Deleting..." : "Delete"}
								</button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Category List */}
			<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
				{categories.length === 0 ? (
					<div className="px-4 py-16 text-center text-textTertiary sm:py-20">
						<Tag className="mx-auto mb-3 h-8 w-8 opacity-40" />
						No categories found.
					</div>
				) : (
					<div className="divide-y divide-borderLight">
						{categories.map((category) => (
							<div
								key={category.id}
								className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
								<div className="flex min-w-0 items-start gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaryLight">
										<Tag className="h-5 w-5 text-primary" />
									</div>

									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-bold text-textPrimary">
												{category.name}
											</span>

											<span className="rounded-full bg-surfaceVariant px-2 py-0.5 text-xs text-textTertiary">
												{category.items} items
											</span>
										</div>

										<p className="mt-0.5 max-w-md break-words text-xs text-textSecondary">
											{category.description}
										</p>
									</div>
								</div>

								<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
									<button
										onClick={() => startEdit(category)}
										className="flex items-center gap-1 rounded-lg bg-primaryLight px-2.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20">
										<Edit2 className="h-3.5 w-3.5" />
										Edit
									</button>

									<button
										onClick={() => setDeleteId(category.id)}
										className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
											category.items > 0
												? "cursor-not-allowed bg-surfaceVariant text-textTertiary"
												: "bg-errorLight text-error hover:bg-error/20"
										}`}
									>
										<Trash2 className="h-3.5 w-3.5" />
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
