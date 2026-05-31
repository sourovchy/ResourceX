// components/ConversationList.tsx
"use client";

import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";

interface ConversationListProps {
	conversations: Conversation[];
	selectedId: number | null;
	currentUserId?: number;
	onSelect: (id: number) => void;
}

export default function ConversationList({
	conversations,
	selectedId,
	currentUserId,
	onSelect,
}: ConversationListProps) {
	return (
		<div className="space-y-0.5">
			{conversations.map((c) => (
				<ConversationItem
					key={c.conversationId}
					conversation={c}
					currentUserId={currentUserId}
					isActive={c.conversationId === selectedId}
					onClick={() => onSelect(c.conversationId)}
				/>
			))}
		</div>
	);
}
