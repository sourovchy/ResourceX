"use client";

import { Message } from "@/types/chat";

interface MessageBubbleProps {
	message: Message;
	currentUserId?: number;
}

export default function MessageBubble({
	message,
	currentUserId,
}: MessageBubbleProps) {
	const isMe = message.senderUserId === currentUserId;

	const formattedTime = message.createdAt
		? new Date(message.createdAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "";

	return (
		<div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
			{!isMe && (
				<div className="text-xs font-semibold text-textSecondary mb-1 px-1">
					{message.senderName}
				</div>
			)}

			<div
				className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
					isMe
						? "bg-primary text-white rounded-br-none"
						: "bg-surface border border-borderLight text-textPrimary rounded-bl-none"
				}`}>
				{message.content}
			</div>

			<div className="text-[10px] font-medium text-textTertiary mt-1 px-1 flex items-center gap-1">
				<span>{formattedTime}</span>

				{isMe && (
					<>
						<span>•</span>
						<span>
							{message.isRead ? "Read" : "Sent"}
						</span>
					</>
				)}
			</div>
		</div>
	);
}
