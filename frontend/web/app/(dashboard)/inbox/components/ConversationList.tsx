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
		<div className="flex flex-col gap-1 px-2 pb-2">
			{conversations.map((c, index) => (
				<div key={c.conversationId}>
					<ConversationItem
						conversation={c}
						currentUserId={currentUserId}
						isActive={c.conversationId === selectedId}
						onClick={() => onSelect(c.conversationId)}
					/>
					{index < conversations.length - 1 && (
						<div className="mx-2 mt-1 h-[1px] bg-borderLight/50" />
					)}
				</div>
			))}
		</div>
	);
}
