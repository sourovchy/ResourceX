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
			className={`flex items-start gap-2 rounded-xl p-2.5 transition-colors sm:gap-3 sm:p-3 cursor-pointer ${
				isActive ? "bg-primaryLight/50" : "hover:bg-surfaceVariant"
			}`}>
			{/* Avatar */}
			<div className="relative shrink-0 self-start">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold sm:h-12 sm:w-12 sm:text-lg ${
						isActive
							? "bg-primary text-white"
							: "bg-surface border border-borderLight text-primary"
					}`}>
					{otherParticipantInitial}
				</div>
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="mb-0.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
					<h3 className="truncate text-sm font-bold text-textPrimary">
						{otherParticipantName}
					</h3>

					{conversation.lastMessageAt && (
						<span className="shrink-0 text-[11px] text-textSecondary sm:text-xs">
							{new Date(conversation.lastMessageAt).toLocaleString()}
						</span>
					)}
				</div>

				<div className="mb-1 truncate text-[11px] font-medium text-primary sm:text-xs">
					{contextLabel}
				</div>

				<p
					className={`truncate text-xs sm:text-sm ${
						conversation.unreadCount > 0
							? "font-bold text-textPrimary"
							: "text-textSecondary"
					}`}>
					{conversation.lastMessageContent || "No messages yet"}
				</p>
			</div>

			{/* Unread badge */}
			{conversation.unreadCount > 0 && !isActive && (
				<div className="flex h-5 w-5 shrink-0 self-center items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
					{conversation.unreadCount}
				</div>
			)}
		</div>
	);
}
