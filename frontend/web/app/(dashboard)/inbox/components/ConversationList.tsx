// components/ConversationList.tsx
"use client";

import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";
import { TiltCard } from "@/components/ui/TiltCard";

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
		<div className="flex flex-col gap-3 px-2 pb-2">
			{conversations.map((c) => {
				const isActive = c.conversationId === selectedId;
				return (
					<TiltCard
						key={c.conversationId}
						maxTilt={4}
						hoverScale={1.02}
						glare={true}
						className={`
							overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer
							bg-card/75 backdrop-blur-md
							${
								isActive
									? "border-primary/40 shadow-[0_8px_24px_rgba(218,119,86,0.15)] bg-card/90"
									: "border-borderLight/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
							}
						`}
					>
						<ConversationItem
							conversation={c}
							currentUserId={currentUserId}
							isActive={isActive}
							onClick={() => onSelect(c.conversationId)}
						/>
					</TiltCard>
				);
			})}
		</div>
	);
}