"use client";

import { Conversation } from "../types/chat";
import { ShieldCheck } from "lucide-react";
import { getFileUrl } from "@/lib/api";
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

	const isOtherParticipantStaff = isParticipantOneCurrentUser
		? conversation.participantTwoIsStaff
		: conversation.participantOneIsStaff;

	const otherParticipantAvatarUrl = isParticipantOneCurrentUser
		? conversation.participantTwoAvatarUrl
		: conversation.participantOneAvatarUrl;

	const otherParticipantInitial = otherParticipantName
		? otherParticipantName.charAt(0).toUpperCase()
		: "U";

	const formattedTime = conversation.lastMessageAt
		? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "";

	return (
		<div
			onClick={onClick}
			className={`group relative flex items-center gap-3 overflow-hidden rounded-xl p-3 transition-all duration-200 cursor-pointer border ${
				isActive
					? "bg-primary/5 border-primary/20 shadow-sm"
					: "bg-transparent border-transparent hover:bg-surfaceVariant/50"
			}`}>
			{/* Active indicator line */}
			{isActive && (
				<div className="absolute bottom-0 left-0 top-0 w-[4px] rounded-r-full bg-primary" />
			)}
			{/* Avatar */}
			<div className="relative shrink-0">
				{isOtherParticipantStaff ? (
					<div
						className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold transition-colors ${
							isActive
								? "bg-white text-dashboardBlue"
								: "bg-dashboardBlueTint text-dashboardBlue"
						}`}>
						<ShieldCheck className="h-6 w-6" />
					</div>
				) : otherParticipantAvatarUrl ? (
					<img
						src={getFileUrl(otherParticipantAvatarUrl)}
						alt={otherParticipantName}
						className={`h-11 w-11 rounded-full object-cover shadow-sm transition-colors ${
							isActive ? "border-2 border-primary" : "border border-[var(--color-chatBorder)]"
						}`}
					/>
				) : (
					<div
						className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold transition-colors ${
							isActive
								? "bg-primary text-white"
								: "bg-[var(--color-chatBase)] border border-[var(--color-chatBorder)] text-primary"
						}`}>
						{otherParticipantInitial}
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col justify-center min-w-0">
				<div className="flex items-baseline justify-between gap-2 mb-0.5">
					<div className="flex items-center gap-1.5 truncate min-w-0">
						<h3 className={`truncate text-[15px] font-semibold ${isActive ? "text-primaryDark" : "text-textPrimary"}`}>
							{otherParticipantName}
						</h3>
						{isOtherParticipantStaff && (
							<ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primaryDark" : "text-dashboardBlue"}`} />
						)}
					</div>
					{formattedTime && (
						<span className={`shrink-0 text-[11px] font-medium ${conversation.unreadCount > 0 && !isActive ? "text-primary font-bold" : "text-textTertiary"}`}>
							{formattedTime}
						</span>
					)}
				</div>

				<div className="flex items-center justify-between gap-3">
					<p
						className={`truncate text-[13px] ${
							conversation.unreadCount > 0 && !isActive
								? "font-bold text-textPrimary"
								: "text-textSecondary"
						}`}>
						{conversation.lastMessageContent || "No messages yet"}
					</p>
					
					{/* Unread badge */}
					{conversation.unreadCount > 0 && !isActive && (
						<div className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm">
							{conversation.unreadCount}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
