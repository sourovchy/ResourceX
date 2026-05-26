// components/ConversationList.tsx
"use client";

import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";
import SearchBar from "./SearchBar";
import { Users } from "lucide-react";

interface ConversationListProps {
	conversations: Conversation[];
	selectedId: number | null;
	searchQuery: string;
	currentUserId?: number;
	onSelect: (id: number) => void;
	onSearchChange: (val: string) => void;
}

export default function ConversationList({
	conversations,
	selectedId,
	searchQuery,
	currentUserId,
	onSelect,
	onSearchChange,
}: ConversationListProps) {
	return (
		<div className="flex w-full shrink-0 flex-col border-b border-borderLight bg-surfaceVariant/30 md:w-80 md:border-b-0 md:border-r">
			{/* Header */}
			<div className="border-b border-borderLight p-3 sm:p-4">
				<h2 className="mb-3 text-lg font-bold tracking-tight text-textPrimary sm:mb-4 sm:text-xl">
					Inbox
				</h2>
				<SearchBar value={searchQuery} onChange={onSearchChange} />
			</div>

			{/* List */}
			<div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2">
				{conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-12 text-textTertiary sm:py-16">
						<Users className="h-8 w-8 text-outline sm:h-10 sm:w-10" />
						<p className="text-xs font-medium sm:text-sm">No users found</p>
					</div>
				) : (
					conversations.map((c) => (
						<ConversationItem
							key={c.conversationId}
							conversation={c}
							currentUserId={currentUserId}
							isActive={c.conversationId === selectedId}
							onClick={() => onSelect(c.conversationId)}
						/>
					))
				)}
			</div>
		</div>
	);
}
