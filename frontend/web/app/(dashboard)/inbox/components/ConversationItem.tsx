"use client";

import { Conversation } from "@/types/chat";
import { ShieldCheck } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { formatTime } from "@/lib/dateUtils";
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

	const formattedTime = formatTime(conversation.lastMessageAt);

	return (
		<div
			onClick={onClick}
			className="relative flex items-center gap-3.5 overflow-hidden p-3.5 transition-all duration-200 cursor-pointer bg-transparent border-0 select-none w-full">
			{/* Active indicator line */}
			{isActive && (
				<div className="absolute bottom-0 left-0 top-0 w-[4px] rounded-r-full bg-primary" />
			)}
			{/* Avatar */}
			<div className="relative shrink-0">
				{otherParticipantAvatarUrl ? (
					<SafeImage
						src={otherParticipantAvatarUrl}
						alt={otherParticipantName}
						width={48}
						height={48}
						className={`h-12 w-12 rounded-full object-cover shadow-sm transition-all duration-300 ${
							isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background/90" : "border border-borderLight"
						}`}
					/>
				) : isOtherParticipantStaff ? (
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition-all duration-300 shadow-sm ${
							isActive
								? "bg-white text-dashboardBlue ring-2 ring-primary ring-offset-2 ring-offset-background/90"
								: "bg-dashboardBlueTint text-dashboardBlue border border-borderLight"
						}`}>
						<ShieldCheck className="h-6 w-6" />
					</div>
				) : (
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition-all duration-300 shadow-sm ${
							isActive
								? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background/90"
								: "bg-surface border border-borderLight text-primary"
						}`}>
						{otherParticipantInitial}
					</div>
				)}

				{/* Unread badge floating over avatar */}
				{conversation.unreadCount > 0 && !isActive && (
					<span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white shadow-[0_2px_8px_rgba(218,119,86,0.5)] border-2 border-background">
						{conversation.unreadCount}
					</span>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col justify-center min-w-0">
				<div className="flex items-baseline justify-between gap-2 mb-0.5">
					<div className="flex items-center gap-1.5 truncate min-w-0">
						<h3 className={`truncate text-[15px] font-bold ${isActive ? "text-primaryDark" : "text-textPrimary"}`}>
							{otherParticipantName}
						</h3>
						{isOtherParticipantStaff && (
							<ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primaryDark" : "text-dashboardBlue"}`} />
						)}
					</div>
					{formattedTime && (
						<span className={`shrink-0 text-xs font-semibold ${conversation.unreadCount > 0 && !isActive ? "text-primary" : "text-textTertiary/80"}`}>
							{formattedTime}
						</span>
					)}
				</div>

				<div className="flex items-center justify-between gap-3">
					<p
						className={`truncate text-[13px] ${
							conversation.unreadCount > 0 && !isActive
								? "font-semibold text-textPrimary"
								: "text-textSecondary"
						}`}>
						{conversation.lastMessageContent || "No messages yet"}
					</p>
				</div>
			</div>
		</div>
	);
}
