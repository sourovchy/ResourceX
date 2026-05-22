"use client";

import { Conversation } from "@/types/chat";

interface ConversationItemProps {
	conversation: Conversation;
	isActive: boolean;
	onClick: () => void;
	currentUserId?: number;
}

export default function ConversationItem({
	conversation,
	isActive,
	onClick,
	currentUserId,
}: ConversationItemProps) {
	const isParticipantOneCurrentUser =
		conversation.participantOneUserId === currentUserId;

	const otherParticipantName = isParticipantOneCurrentUser
		? conversation.participantTwoName
		: conversation.participantOneName;

	const otherParticipantInitial = otherParticipantName
		? otherParticipantName.charAt(0).toUpperCase()
		: "U";

	const contextLabel = conversation.bookingId
		? `Booking #${conversation.bookingId}`
		: conversation.disputeId
			? `Dispute #${conversation.disputeId}`
			: "Direct Conversation";

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
					{otherParticipantInitial}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-center mb-0.5 gap-2">
					<h3 className="font-bold text-textPrimary truncate text-sm">
						{otherParticipantName}
					</h3>

					{conversation.lastMessageAt && (
						<span className="text-xs text-textSecondary shrink-0">
							{new Date(conversation.lastMessageAt).toLocaleString()}
						</span>
					)}
				</div>

				<div className="text-xs text-primary font-medium truncate mb-1">
					{contextLabel}
				</div>

				<p
					className={`truncate text-sm ${
						conversation.unreadCount > 0
							? "font-bold text-textPrimary"
							: "text-textSecondary"
					}`}>
					{conversation.lastMessageContent || "No messages yet"}
				</p>
			</div>

			{/* Unread badge */}
			{conversation.unreadCount > 0 && !isActive && (
				<div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 self-center">
					{conversation.unreadCount}
				</div>
			)}
		</div>
	);
}
