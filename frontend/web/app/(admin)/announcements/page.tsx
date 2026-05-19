"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Edit2, Trash2, X, Bell } from "lucide-react";

const INITIAL_ANNOUNCEMENTS = [
	{
		id: "AN-001",
		title: "CampusVault Scheduled Maintenance – May 10",
		body: "The platform will be unavailable from 2:00 AM to 5:00 AM on May 10, 2024 for scheduled database maintenance. Please plan your rentals accordingly.",
		date: "May 5, 2024",
		author: "Admin",
	},
	{
		id: "AN-002",
		title: "New Category Added: Sports & Activity Gear",
		body: "We've added a new category for sports equipment, camping gear, and outdoor activity items. Owners can now list their sports gear for rentals!",
		date: "Apr 28, 2024",
		author: "Admin",
	},
	{
		id: "AN-003",
		title: "Reminder: Return Items Before Semester End",
		body: "As the semester draws to a close, please ensure all borrowed items are returned before May 15. Late returns will incur penalties.",
		date: "Apr 20, 2024",
		author: "Admin",
	},
];

export default function AdminAnnouncementsPage() {
	const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
	const [showModal, setShowModal] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [form, setForm] = useState({ title: "", body: "" });

	const openAdd = () => {
		setEditId(null);
		setForm({ title: "", body: "" });
		setShowModal(true);
	};

	const openEdit = (a: (typeof announcements)[0]) => {
		setEditId(a.id);
		setForm({ title: a.title, body: a.body });
		setShowModal(true);
	};

	const handleSave = () => {
		if (!form.title.trim()) return;
		if (editId) {
			setAnnouncements(
				announcements.map((a) =>
					a.id === editId ? { ...a, title: form.title, body: form.body } : a,
				),
			);
		} else {
			setAnnouncements([
				{
					id: `AN-${String(announcements.length + 1).padStart(3, "0")}`,
					title: form.title,
					body: form.body,
					date: "May 5, 2024",
					author: "Admin",
				},
				...announcements,
			]);
		}
		setShowModal(false);
		setEditId(null);
		setForm({ title: "", body: "" });
	};

	const handleDelete = (id: string) => {
		setAnnouncements(announcements.filter((a) => a.id !== id));
		setDeleteId(null);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">Announcements</h1>
					<p className="text-textSecondary text-sm mt-1">
						Post campus-wide notices that appear in all students' notification
						feeds.
					</p>
				</div>
				<button
					onClick={openAdd}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary text-onPrimary rounded-xl text-sm font-bold hover:opacity-90 transition shadow">
					<Plus className="w-4 h-4" /> New Announcement
				</button>
			</div>

			{/* Add/Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								{editId ? "Edit Announcement" : "New Announcement"}
							</h3>
							<button onClick={() => setShowModal(false)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<div className="bg-primaryLight border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-primary">
							<Bell className="w-4 h-4 mt-0.5 shrink-0" />
							<span>
								This announcement will be pushed to all students' notification
								feeds.
							</span>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Title
							</label>
							<input
								type="text"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								placeholder="Announcement title..."
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm transition"
							/>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Body
							</label>
							<textarea
								value={form.body}
								onChange={(e) => setForm({ ...form, body: e.target.value })}
								rows={5}
								placeholder="Write the full announcement message here..."
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm resize-none transition"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={handleSave}
								className="flex-1 py-2.5 rounded-xl bg-primary text-onPrimary font-bold text-sm hover:opacity-90 transition">
								{editId ? "Save Changes" : "Post Announcement"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirm Modal */}
			{deleteId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Delete Announcement
							</h3>
							<button onClick={() => setDeleteId(null)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<p className="text-sm text-textSecondary">
							This announcement will be removed from the system.
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setDeleteId(null)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={() => handleDelete(deleteId)}
								className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition">
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Announcements list */}
			<div className="space-y-4">
				{announcements.map((a) => (
					<div
						key={a.id}
						className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-start gap-4 min-w-0">
								<div className="w-10 h-10 rounded-xl bg-primaryLight flex items-center justify-center shrink-0 mt-0.5">
									<Megaphone className="w-5 h-5 text-primary" />
								</div>
								<div className="min-w-0">
									<h3 className="font-bold text-textPrimary">{a.title}</h3>
									<p className="text-sm text-textSecondary mt-1.5 leading-relaxed">
										{a.body}
									</p>
									<div className="flex items-center gap-3 mt-3 text-xs text-textTertiary">
										<span>Posted by {a.author}</span>
										<span>·</span>
										<span>{a.date}</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<button
									onClick={() => openEdit(a)}
									className="flex items-center gap-1 px-2.5 py-1.5 bg-primaryLight text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition">
									<Edit2 className="w-3.5 h-3.5" /> Edit
								</button>
								<button
									onClick={() => setDeleteId(a.id)}
									className="flex items-center gap-1 px-2.5 py-1.5 bg-errorLight text-error rounded-lg text-xs font-bold hover:bg-error/20 transition">
									<Trash2 className="w-3.5 h-3.5" /> Delete
								</button>
							</div>
						</div>
					</div>
				))}

				{announcements.length === 0 && (
					<div className="py-16 text-center text-textTertiary bg-surface border border-borderLight rounded-2xl">
						<Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
						No announcements yet.
					</div>
				)}
			</div>
		</div>
	);
}
