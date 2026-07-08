"use client";

import { useState } from "react";
import { Conversation } from "@/types/chat";
import SearchBar from "./SearchBar";
import ConversationList from "./ConversationList";
import NewConversationModal from "./NewConversationModal";
import { MessageSquare, PenSquare } from "lucide-react";

interface ChatSidebarProps {
	conversations: Conversation[];
	selectedConversationId: number | null;
	searchQuery: string;
	currentUserId?: number;
	loading?: boolean;
	onConversationSelect: (conversationId: number) => void;
	onSearchChange: (value: string) => void;
	onConversationCreated: (conversationId: number) => void;
}

function ConversationSkeleton() {
	return (
		<div className="flex animate-pulse items-center gap-3 p-3">
			<div className="h-11 w-11 shrink-0 rounded-full bg-surfaceVariant" />
			<div className="flex-1 space-y-2">
				<div className="h-3 w-1/2 rounded bg-surfaceVariant" />
				<div className="h-2.5 w-3/4 rounded bg-surfaceVariant" />
			</div>
		</div>
	);
}

export default function ChatSidebar({
	conversations,
	selectedConversationId,
	searchQuery,
	currentUserId,
	loading = false,
	onConversationSelect,
	onSearchChange,
	onConversationCreated,
}: ChatSidebarProps) {
	const [newOpen, setNewOpen] = useState(false);

	return (
		<aside className="flex h-full w-full flex-col gap-4 md:gap-5 bg-transparent">
			{/* Search Card */}
			<div className="flex shrink-0 flex-col bg-card/40 backdrop-blur-xl border border-borderLight rounded-2xl shadow-md p-4 sm:p-5">
				{/* Header */}
				<div className="flex items-center justify-between pb-3 sm:pb-4">
					<div className="min-w-0">
						<h2 className="mt-0.5 text-2xl font-bold tracking-tighter text-textPrimary">
							My <span className="text-gradient-brand italic">Chats.</span>
						</h2>
						{!loading && conversations.length > 0 && (
							<p className="text-[11px] text-textTertiary">
								{conversations.length} conversation
								{conversations.length === 1 ? "" : "s"}
							</p>
						)}
					</div>
					<button
						onClick={() => setNewOpen(true)}
						className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceVariant"
						title="New message"
						aria-label="New message">
						<PenSquare className="h-5 w-5" />
					</button>
				</div>

				{/* Search */}
				<div className="w-full">
					<SearchBar value={searchQuery} onChange={onSearchChange} />
				</div>
			</div>

			{/* Conversation List Card */}
			<div className="min-h-0 flex-1 flex flex-col bg-card/40 backdrop-blur-xl border border-borderLight rounded-2xl shadow-md overflow-hidden py-2">
				<div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1">
					{loading ? (
						<div className="space-y-1">
							{Array.from({ length: 6 }).map((_, i) => (
								<ConversationSkeleton key={i} />
							))}
						</div>
					) : conversations.length === 0 ? (
						<div className="flex flex-col items-center justify-center px-4 py-12 text-center text-textSecondary">
							<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surfaceVariant">
								<MessageSquare className="h-7 w-7 text-outline" />
							</div>
							<p className="font-semibold text-textPrimary">
								{searchQuery ? "No matches found" : "No conversations yet"}
							</p>
							<p className="mt-1 max-w-[220px] text-xs">
								{searchQuery
									? "Try a different name or keyword."
									: "Start a new chat, or message someone from an item or booking."}
							</p>
							{!searchQuery && (
								<button
									onClick={() => setNewOpen(true)}
									className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primaryDark">
									<PenSquare className="h-4 w-4" />
									New message
								</button>
							)}
						</div>
					) : (
						<ConversationList
							conversations={conversations}
							selectedId={selectedConversationId}
							currentUserId={currentUserId}
							onSelect={onConversationSelect}
						/>
					)}
				</div>
			</div>

			<NewConversationModal
				isOpen={newOpen}
				onClose={() => setNewOpen(false)}
				onCreated={onConversationCreated}
			/>
		</aside>
	);
}
