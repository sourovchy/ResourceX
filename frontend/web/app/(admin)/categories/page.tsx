"use client";

import React, { useState } from "react";
import { Tag, Plus, Edit2, Trash2, X, CheckCircle2 } from "lucide-react";

const INITIAL_CATEGORIES = [
	{
		id: "C001",
		name: "Electronics",
		description: "Cameras, laptops, gadgets and electronic devices.",
		items: 142,
	},
	{
		id: "C002",
		name: "Books",
		description: "Textbooks, reference books and academic materials.",
		items: 89,
	},
	{
		id: "C003",
		name: "Lab Equipment",
		description: "Scientific instruments, kits and lab tools.",
		items: 67,
	},
	{
		id: "C004",
		name: "Audio/Visual",
		description: "Speakers, microphones, projectors and AV gear.",
		items: 54,
	},
	{
		id: "C005",
		name: "Sports & Activity",
		description: "Sports gear, camping equipment and outdoor items.",
		items: 38,
	},
	{
		id: "C006",
		name: "Stationery",
		description: "Drawing tools, office supplies and art materials.",
		items: 12,
	},
];

export default function AdminCategoriesPage() {
	const [categories, setCategories] = useState(INITIAL_CATEGORIES);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [form, setForm] = useState({ name: "", description: "" });

	const handleAdd = () => {
		if (!form.name.trim()) return;
		setCategories([
			...categories,
			{
				id: `C${String(categories.length + 1).padStart(3, "0")}`,
				name: form.name,
				description: form.description,
				items: 0,
			},
		]);
		setForm({ name: "", description: "" });
		setShowAddModal(false);
	};

	const handleEdit = () => {
		setCategories(
			categories.map((c) =>
				c.id === editId
					? { ...c, name: form.name, description: form.description }
					: c,
			),
		);
		setEditId(null);
		setForm({ name: "", description: "" });
	};

	const startEdit = (c: (typeof categories)[0]) => {
		setEditId(c.id);
		setForm({ name: c.name, description: c.description });
	};

	const handleDelete = (id: string) => {
		setCategories(categories.filter((c) => c.id !== id));
		setDeleteId(null);
	};

	const deleteTarget = categories.find((c) => c.id === deleteId);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">Categories</h1>
					<p className="text-textSecondary text-sm mt-1">
						Manage item categories. Categories with active items cannot be
						deleted.
					</p>
				</div>
				<button
					onClick={() => {
						setShowAddModal(true);
						setForm({ name: "", description: "" });
					}}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary text-onPrimary rounded-xl text-sm font-bold hover:opacity-90 transition shadow">
					<Plus className="w-4 h-4" /> Add Category
				</button>
			</div>

			{/* Add/Edit Modal */}
			{(showAddModal || editId) && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								{editId ? "Edit Category" : "New Category"}
							</h3>
							<button
								onClick={() => {
									setShowAddModal(false);
									setEditId(null);
								}}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Category Name
							</label>
							<input
								type="text"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								placeholder="e.g. Musical Instruments"
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm transition"
							/>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Description
							</label>
							<textarea
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								rows={3}
								placeholder="Brief description of this category..."
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm resize-none transition"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowAddModal(false);
									setEditId(null);
								}}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={editId ? handleEdit : handleAdd}
								className="flex-1 py-2.5 rounded-xl bg-primary text-onPrimary font-bold text-sm hover:opacity-90 transition">
								{editId ? "Save Changes" : "Create Category"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirm Modal */}
			{deleteId && deleteTarget && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Delete Category
							</h3>
							<button onClick={() => setDeleteId(null)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						{deleteTarget.items > 0 ? (
							<div className="bg-errorLight border border-error/30 rounded-xl p-4 text-sm text-error">
								<strong>Cannot delete.</strong> This category has{" "}
								{deleteTarget.items} active items. Reassign or remove those
								items first.
							</div>
						) : (
							<p className="text-sm text-textSecondary">
								Are you sure you want to delete{" "}
								<strong className="text-textPrimary">
									{deleteTarget.name}
								</strong>
								? This cannot be undone.
							</p>
						)}
						<div className="flex gap-3">
							<button
								onClick={() => setDeleteId(null)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								{deleteTarget.items > 0 ? "Close" : "Cancel"}
							</button>
							{deleteTarget.items === 0 && (
								<button
									onClick={() => handleDelete(deleteId)}
									className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition">
									Delete
								</button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Category List */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="divide-y divide-borderLight">
					{categories.map((c) => (
						<div
							key={c.id}
							className="flex items-center justify-between px-5 py-4 hover:bg-surfaceVariant/40 transition-colors">
							<div className="flex items-center gap-4 min-w-0">
								<div className="w-10 h-10 rounded-xl bg-primaryLight flex items-center justify-center shrink-0">
									<Tag className="w-5 h-5 text-primary" />
								</div>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-bold text-textPrimary">{c.name}</span>
										<span className="text-xs text-textTertiary px-2 py-0.5 bg-surfaceVariant rounded-full">
											{c.items} items
										</span>
									</div>
									<p className="text-xs text-textSecondary mt-0.5 truncate max-w-md">
										{c.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0 ml-4">
								<button
									onClick={() => startEdit(c)}
									className="flex items-center gap-1 px-2.5 py-1.5 bg-primaryLight text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition">
									<Edit2 className="w-3.5 h-3.5" /> Edit
								</button>
								<button
									onClick={() => setDeleteId(c.id)}
									className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
										c.items > 0
											? "bg-surfaceVariant text-textTertiary cursor-not-allowed"
											: "bg-errorLight text-error hover:bg-error/20"
									}`}>
									<Trash2 className="w-3.5 h-3.5" /> Delete
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
