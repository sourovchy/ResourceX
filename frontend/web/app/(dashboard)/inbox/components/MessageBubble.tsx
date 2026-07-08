"use client";

import { Message } from "@/types/chat";
import { formatTime } from "@/lib/dateUtils";

interface MessageBubbleProps {
	message: Message;
	currentUserId?: number;
	isFirstInGroup?: boolean;
	isLastInGroup?: boolean;
}

export default function MessageBubble({
	message,
	currentUserId,
	isFirstInGroup = true,
	isLastInGroup = true,
}: MessageBubbleProps) {
	const isMe = message.senderUserId === currentUserId;

	const formattedTime = formatTime(message.createdAt);

	// Tighter bubble corners on the "joined" side within a group
	let radiusClasses = "rounded-2xl";
	if (isMe) {
		if (!isFirstInGroup) radiusClasses += " rounded-tr-md";
		if (!isLastInGroup) radiusClasses += " rounded-br-md";
	} else {
		if (!isFirstInGroup) radiusClasses += " rounded-tl-md";
		if (!isLastInGroup) radiusClasses += " rounded-bl-md";
	}

	const bubbleBgClasses = isMe
		? "bg-primary text-white"
		: "bg-card text-textPrimary border border-border";

	return (
		<div
			className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
				isFirstInGroup ? "mt-3" : "mt-[3px]"
			}`}>


			<div
				className={`max-w-[82%] px-3 py-1.5 text-[14px] leading-[1.35] whitespace-pre-wrap break-words sm:max-w-[72%] lg:max-w-[60%] ${radiusClasses} ${bubbleBgClasses}`}>
				{message.content}
			</div>

			{/* Meta — once per group, on the last bubble only */}
			{isLastInGroup && (
				<div className="mt-[3px] flex items-center gap-1 px-1 text-[10px] font-medium text-textTertiary">
					<span>{formattedTime}</span>
					{isMe && (
						<span className="tracking-tighter text-primary">
							{message.isRead ? "✓✓" : "✓"}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
