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
		<div className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"}`}>
			{!isMe && (
				<div className="mb-1 px-1 text-[11px] font-semibold text-textSecondary sm:text-xs">
					{message.senderName}
				</div>
			)}

			<div
				className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words sm:max-w-[75%] sm:px-4 sm:py-3 sm:text-sm lg:max-w-[70%] ${
					isMe
						? "bg-primary text-white rounded-br-none"
						: "bg-surface border border-borderLight text-textPrimary rounded-bl-none"
				}`}>
				{message.content}
			</div>

			<div className="mt-1 flex flex-wrap items-center gap-1 px-1 text-[9px] font-medium text-textTertiary sm:text-[10px]">
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
