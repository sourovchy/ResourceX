
"use client";

import { Conversation } from "@/types/chat";
import SearchBar from "./SearchBar";
import ConversationList from "./ConversationList";
import { MessageSquare } from "lucide-react";

interface ChatSidebarProps {
	conversations: Conversation[];
	selectedConversationId: number | null;
	searchQuery: string;
	currentUserId?: number;
	loading?: boolean;
	onConversationSelect: (conversationId: number) => void;
	onSearchChange: (value: string) => void;
}

export default function ChatSidebar({
	conversations,
	selectedConversationId,
	searchQuery,
	currentUserId,
	loading = false,
	onConversationSelect,
	onSearchChange,
}: ChatSidebarProps) {
	return (
		<aside className="flex min-h-0 w-full flex-col border-b border-borderLight bg-surface lg:w-[360px] xl:w-[380px] lg:border-b-0 lg:border-r">
			{/* Header */}
			<div className="flex h-14 shrink-0 items-center justify-between border-b border-borderLight px-3 sm:h-16 sm:px-4">
				<div>
					<h2 className="font-bold text-textPrimary text-base">Messages</h2>
					<p className="text-xs text-textSecondary mt-0.5">
						{conversations.length} conversation{conversations.length === 1 ? "" : "s"}
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="shrink-0 border-b border-borderLight p-3 sm:p-4">
				<SearchBar value={searchQuery} onChange={onSearchChange} />
			</div>

			{/* List */}
			<div className="min-h-0 flex-1 overflow-y-auto">
				{loading ? (
					<div className="px-4 py-10 text-center text-textSecondary text-sm">
						Loading conversations...
					</div>
				) : conversations.length === 0 ? (
					<div className="px-4 py-12 flex flex-col items-center justify-center text-center text-textSecondary">
						<div className="w-14 h-14 rounded-2xl bg-surfaceVariant flex items-center justify-center mb-3">
							<MessageSquare className="w-7 h-7 text-outline" />
						</div>
						<p className="font-semibold text-textPrimary">No conversations found</p>
						<p className="text-xs mt-1 max-w-[220px]">
							Start a conversation from a booking or dispute, or search again.
						</p>
					</div>
				) : (
					<ConversationList
						conversations={conversations}
						selectedId={selectedConversationId}
						searchQuery={searchQuery}
						currentUserId={currentUserId}
						onSelect={onConversationSelect}
						onSearchChange={onSearchChange}
					/>
				)}
			</div>
		</aside>
	);
}