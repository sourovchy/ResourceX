"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Tag, Plus, Edit2, Trash2 } from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { extractErrorMessage, logErrorDetails } from "@/lib/errorUtils";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageLoader } from "@/components/ui/PageLoader";

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
	const { toast } = useToast();
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

	const fetchCategories = useCallback(async () => {
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
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	// Categories change rarely — refresh on focus, no aggressive polling
	useAutoRefresh(fetchCategories);

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
			toast("Category created.");
		} catch (err) {
			const msg = extractErrorMessage(err);
			setError(msg);
			toast(msg, "error");
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
			toast("Category updated.");
		} catch (err) {
			const msg = extractErrorMessage(err);
			setError(msg);
			toast(msg, "error");
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
			toast("Category deleted.");
		} catch (err) {
			const msg = "Category cannot be deleted. Remove related items first.";
			setError(msg);
			toast(msg, "error");
		} finally {
			setSubmitting(false);
		}
	};

	const deleteTarget = useMemo(
		() => categories.find((c) => c.id === deleteId),
		[categories, deleteId],
	);

	if (loading) {
		return <PageLoader message="Loading categories..." />;
	}

	return (
		<div className="w-full space-y-5 px-3 pb-8 sm:space-y-6 sm:px-0 sm:pb-0 graph-grid page-enter">
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
						Product <span className="text-gradient-brand italic">Categories.</span>
					</h1>
					<p className="mt-2 text-sm text-textSecondary font-medium">
						Manage item categories from the backend database.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row md:w-auto self-start sm:self-auto">
					<Button
						onClick={() => {
							resetForm();
							setShowAddModal(true);
						}}
						variant="primary"
						leftIcon={<Plus className="h-4 w-4" />}
					>
						Add Category
					</Button>
				</div>
			</div>

			{error && !showAddModal && !editId && !deleteId && (
				<div
					role="alert"
					className="rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-in fade-in duration-200">
					{error}
				</div>
			)}

			{/* Add/Edit Modal */}
			<ConfirmModal
				isOpen={showAddModal || editId !== null}
				title={editId ? "Edit Category" : "New Category"}
				confirmText={editId ? "Save Changes" : "Create"}
				isLoading={submitting}
				onConfirm={editId ? handleEdit : handleAdd}
				onCancel={closeModal}
			>
				<Field label="Category Name">
					<Input
						type="text"
						value={form.name}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, name: e.target.value }))
						}
						placeholder="e.g. Musical Instruments"
					/>
				</Field>

				<Field label="Description">
					<Textarea
						rows={3}
						value={form.description}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, description: e.target.value }))
						}
						placeholder="Brief description..."
					/>
				</Field>
			</ConfirmModal>

			{/* Delete Modal */}
			{deleteTarget && (
				<ConfirmModal
					isOpen={deleteId !== null}
					title="Delete Category"
					isDestructive
					confirmText="Delete"
					cancelText={deleteTarget.items > 0 ? "Close" : "Cancel"}
					confirmDisabled={deleteTarget.items > 0}
					isLoading={submitting}
					onConfirm={() => deleteId !== null && handleDelete(deleteId)}
					onCancel={() => setDeleteId(null)}
					message={
						deleteTarget.items > 0
							? undefined
							: `Are you sure you want to delete ${deleteTarget.name}?`
					}
				>
					{deleteTarget.items > 0 && (
						<div className="rounded-xl border border-error/30 bg-errorLight p-4 text-sm text-error">
							<strong>Cannot delete.</strong> This category has {deleteTarget.items} active items.
						</div>
					)}
				</ConfirmModal>
			)}

			{/* Category List */}
			<Card padding="none" className="overflow-hidden" interactive={true}>
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
											<span className="font-bold text-textPrimary italic">
												{category.name}
											</span>

											<span className="rounded-full bg-surfaceVariant px-2 py-0.5 text-xs text-textTertiary font-mono">
												{category.items} items
											</span>
										</div>

										<p className="mt-0.5 max-w-md break-words text-xs text-textSecondary">
											{category.description}
										</p>
									</div>
								</div>

								<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
									<Button
										onClick={() => startEdit(category)}
										variant="subtle"
										size="sm"
										leftIcon={<Edit2 className="h-3 w-3" />}
									>
										Edit
									</Button>

									<Button
										onClick={() => setDeleteId(category.id)}
										variant="danger"
										size="sm"
										disabled={category.items > 0}
										leftIcon={<Trash2 className="h-3 w-3" />}
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
