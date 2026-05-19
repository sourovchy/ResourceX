// components/MessageBubble.tsx
"use client";

import { Message } from "@/types/chat";

interface MessageBubbleProps {
	message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
	const isMe = message.senderId === "me";

	return (
		<div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
			<div
				className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
					isMe
						? "bg-primary text-white rounded-br-none"
						: "bg-primary/90 border border-borderLight text-textPrimary rounded-bl-none"
				}`}>
				{message.text}
			</div>
			<span className="text-[10px] font-medium text-textTertiary mt-1 px-1">
				{message.time} {isMe && "• Sent"}
			</span>
		</div>
	);
}
