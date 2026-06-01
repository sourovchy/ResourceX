"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Loader2, MessageSquare, ChevronLeft, Send } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/lib/errorUtils";
import { chatService } from "../services/chatService";
import { getFileUrl } from "@/lib/api";

interface UserResult {
	userId: number;
	name: string;
	email: string;
	avatarUrl?: string | null;
	department?: string | null;
	trustScore?: number | null;
}

interface NewConversationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreated: (conversationId: number) => void;
}

export default function NewConversationModal({
	isOpen,
	onClose,
	onCreated,
}: NewConversationModalProps) {
	const { toast } = useToast();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<UserResult[]>([]);
	const [searching, setSearching] = useState(false);
	const [selected, setSelected] = useState<UserResult | null>(null);
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Reset everything whenever the modal is (re)opened/closed
	useEffect(() => {
		if (!isOpen) {
			setQuery("");
			setResults([]);
			setSelected(null);
			setMessage("");
		}
	}, [isOpen]);

	// Debounced search
	useEffect(() => {
		if (selected) return; // don't search while composing
		if (debounceRef.current) clearTimeout(debounceRef.current);

		const q = query.trim();
		if (q.length < 2) {
			setResults([]);
			setSearching(false);
			return;
		}

		setSearching(true);
		debounceRef.current = setTimeout(() => {
			api
				.get<UserResult[]>(`/users/search?q=${encodeURIComponent(q)}&limit=10`)
				.then((res) => setResults(Array.isArray(res.data) ? res.data : []))
				.catch(() => setResults([]))
				.finally(() => setSearching(false));
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, selected]);

	const handleSend = async () => {
		if (!selected || !message.trim()) return;
		setSending(true);
		try {
			const conversation = await chatService.startConversation({
				otherUserId: selected.userId,
				initialMessage: message.trim(),
			});
			toast("Message sent.");
			onCreated(conversation.conversationId);
			onClose();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setSending(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			<div className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-2xl">
				{/* Header */}
				<div className="flex items-center gap-2 border-b border-borderLight p-4">
					{selected && (
						<button
							onClick={() => setSelected(null)}
							className="rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-surfaceVariant"
							aria-label="Back to search">
							<ChevronLeft className="h-5 w-5" />
						</button>
					)}
					<h2 className="flex-1 font-bold text-textPrimary">
						{selected ? `Message ${selected.name}` : "New Message"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-surfaceVariant"
						aria-label="Close">
						<X className="h-5 w-5" />
					</button>
				</div>

				{!selected ? (
					<>
						{/* Search */}
						<div className="shrink-0 p-4">
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
								<input
									autoFocus
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search by name or email…"
									maxLength={100}
									className="w-full rounded-xl border border-borderLight bg-surfaceVariant py-2.5 pl-9 pr-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
								/>
							</div>
						</div>

						{/* Results */}
						<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
							{searching ? (
								<div className="flex items-center justify-center gap-2 py-10 text-sm text-textSecondary">
									<Loader2 className="h-4 w-4 animate-spin text-primary" /> Searching…
								</div>
							) : query.trim().length < 2 ? (
								<div className="px-4 py-10 text-center text-sm text-textSecondary">
									Type at least 2 characters to find someone to message.
								</div>
							) : results.length === 0 ? (
								<div className="px-4 py-10 text-center text-sm text-textSecondary">
									No users found for “{query.trim()}”.
								</div>
							) : (
								<ul className="space-y-1">
									{results.map((u) => (
										<li key={u.userId}>
											<button
												onClick={() => setSelected(u)}
												className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-surfaceVariant">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
													{u.avatarUrl ? (
														<img
															src={getFileUrl(u.avatarUrl)}
															alt={u.name}
															className="h-full w-full rounded-full object-cover"
														/>
													) : (
														u.name?.charAt(0).toUpperCase() ?? "U"
													)}
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-semibold text-textPrimary">
														{u.name}
													</p>
													<p className="truncate text-xs text-textSecondary">
														{u.department ? `${u.department} · ` : ""}
														{u.email}
													</p>
												</div>
												<MessageSquare className="h-4 w-4 shrink-0 text-textTertiary" />
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</>
				) : (
					/* Compose */
					<div className="flex flex-col gap-3 p-4">
						<textarea
							autoFocus
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={4}
							maxLength={4000}
							placeholder={`Write your first message to ${selected.name}…`}
							className="w-full resize-none rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
						/>
						<button
							onClick={handleSend}
							disabled={sending || !message.trim()}
							className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50">
							{sending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" /> Sending…
								</>
							) : (
								<>
									<Send className="h-4 w-4" /> Send Message
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
