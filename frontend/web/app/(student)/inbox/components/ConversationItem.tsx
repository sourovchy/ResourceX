// components/ConversationItem.tsx
"use client";

import { Conversation } from "@/types/chat";

interface ConversationItemProps {
	conversation: Conversation;
	isActive: boolean;
	onClick: () => void;
}

export default function ConversationItem({
	conversation: c,
	isActive,
	onClick,
}: ConversationItemProps) {
	return (
		<div
			onClick={onClick}
			className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
				isActive ? "bg-primaryLight/50" : "hover:bg-surfaceVariant"
			}`}>
			{/* Avatar */}
			<div className="relative shrink-0">
				<div
					className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
						isActive
							? "bg-primary text-white"
							: "bg-surface border border-borderLight text-primary"
					}`}>
					{c.participant.avatar}
				</div>
				{c.participant.online && (
					<span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-surface" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-center mb-0.5">
					<h3 className="font-bold text-textPrimary truncate pr-2 text-sm">
						{c.participant.name}
					</h3>
					<span className="text-xs text-textSecondary shrink-0">
						{c.lastMessageTime}
					</span>
				</div>
				<div className="text-xs text-primary font-medium truncate mb-1">
					Re: {c.itemTitle}
				</div>
				<p
					className={`truncate text-sm ${
						c.unreadCount > 0
							? "font-bold text-textPrimary"
							: "text-textSecondary"
					}`}>
					{c.lastMessage}
				</p>
			</div>

			{/* Unread badge */}
			{c.unreadCount > 0 && !isActive && (
				<div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 self-center">
					{c.unreadCount}
				</div>
			)}
		</div>
	);
}
