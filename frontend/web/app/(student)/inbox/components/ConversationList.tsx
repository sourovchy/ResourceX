// components/ConversationList.tsx
"use client";

import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";
import SearchBar from "./SearchBar";
import { Users } from "lucide-react";

interface ConversationListProps {
	conversations: Conversation[];
	selectedId: string | null;
	searchQuery: string;
	onSelect: (id: string) => void;
	onSearchChange: (val: string) => void;
}

export default function ConversationList({
	conversations,
	selectedId,
	searchQuery,
	onSelect,
	onSearchChange,
}: ConversationListProps) {
	return (
		<div className="w-80 border-r border-borderLight flex flex-col bg-surfaceVariant/30 shrink-0">
			{/* Header */}
			<div className="p-4 border-b border-borderLight">
				<h2 className="text-xl font-bold text-textPrimary tracking-tight mb-4">
					Inbox
				</h2>
				<SearchBar value={searchQuery} onChange={onSearchChange} />
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
				{conversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-textTertiary gap-3">
						<Users className="w-10 h-10 text-outline" />
						<p className="text-sm font-medium">No users found</p>
					</div>
				) : (
					conversations.map((c) => (
						<ConversationItem
							key={c.id}
							conversation={c}
							isActive={c.id === selectedId}
							onClick={() => onSelect(c.id)}
						/>
					))
				)}
			</div>
		</div>
	);
}
