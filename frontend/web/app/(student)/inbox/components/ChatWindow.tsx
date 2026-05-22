"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info, MoreVertical, MessageSquare } from "lucide-react";
import { Conversation, Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import UserInfoModal from "./UserInfoModal";

interface ChatWindowProps {
	conversation: Conversation | null;
	messages: Message[];
	currentUserId?: number;
	onSend: (text: string) => void;
}

export default function ChatWindow({
	conversation,
	messages,
	currentUserId,
	onSend,
}: ChatWindowProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [showMenu, setShowMenu] = useState(false);

	const otherParticipant = useMemo(() => {
		if (!conversation) return null;

		if (conversation.participantOneUserId === currentUserId) {
			return {
				userId: conversation.participantTwoUserId,
				name: conversation.participantTwoName,
				email: conversation.participantTwoEmail,
			};
		}

		return {
			userId: conversation.participantOneUserId,
			name: conversation.participantOneName,
			email: conversation.participantOneEmail,
		};
	}, [conversation, currentUserId]);

	const contextLabel = useMemo(() => {
		if (!conversation) return "";
		if (conversation.bookingId) return `Booking #${conversation.bookingId}`;
		if (conversation.disputeId) return `Dispute #${conversation.disputeId}`;
		return "Direct Conversation";
	}, [conversation]);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Close menu on outside click
	useEffect(() => {
		if (!showMenu) return;
		const handler = () => setShowMenu(false);
		document.addEventListener("click", handler);
		return () => document.removeEventListener("click", handler);
	}, [showMenu]);

	if (!conversation || !otherParticipant) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center text-textSecondary bg-background/30 gap-4">
				<div className="w-16 h-16 rounded-2xl bg-surfaceVariant flex items-center justify-center">
					<MessageSquare className="w-8 h-8 text-outline" />
				</div>
				<div className="text-center">
					<p className="font-semibold text-textPrimary text-base">
						No conversation selected
					</p>
					<p className="text-sm text-textSecondary mt-1">
						Pick a chat from the sidebar to start messaging
					</p>
				</div>
			</div>
		);
	}

	const participantInitial = otherParticipant.name
		? otherParticipant.name.charAt(0).toUpperCase()
		: "U";

	return (
		<div className="flex-1 flex flex-col min-w-0 bg-background/30">
			{/* Header */}
			<div className="h-16 border-b border-borderLight bg-surface px-6 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
							{participantInitial}
						</div>
					</div>
					<div>
						<h3 className="font-bold text-textPrimary text-sm leading-none">
							{otherParticipant.name}
						</h3>
						<div className="text-xs text-textSecondary mt-1 flex items-center gap-1.5">
							{otherParticipant.email}
							{conversation.unreadCount > 0 && (
								<span className="ml-2 text-primary font-semibold">
									{conversation.unreadCount} unread
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1">
					<button
						onClick={() => setShowInfo(true)}
						className="p-2 text-textSecondary hover:text-primary transition-colors hover:bg-surfaceVariant rounded-lg"
						title="Conversation Info">
						<Info className="w-5 h-5" />
					</button>

					{/* More menu */}
					<div className="relative">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu((v) => !v);
							}}
							className="p-2 text-textSecondary hover:text-primary transition-colors hover:bg-surfaceVariant rounded-lg">
							<MoreVertical className="w-5 h-5" />
						</button>
						{showMenu && (
							<div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-borderLight rounded-xl shadow-lg z-30 overflow-hidden">
								<div className="px-4 py-3 text-sm text-textSecondary">
									Booking/Dispute actions are handled from the backend context.
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-6 space-y-4">
				<div className="text-center text-xs font-semibold text-textTertiary mb-6 uppercase tracking-wider">
					{contextLabel}
				</div>

				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-textSecondary gap-3">
						<MessageSquare className="w-10 h-10 text-outline" />
						<p className="text-sm">No messages yet. Say hi!</p>
					</div>
				) : (
					messages.map((msg) => <MessageBubble key={msg.messageId} message={msg} />)
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<MessageInput onSend={onSend} blocked={false} />

			{/* User Info Modal */}
			{showInfo && (
				<UserInfoModal
					user={otherParticipant}
					itemTitle={contextLabel}
					isBlocked={false}
					onClose={() => setShowInfo(false)}
					onToggleBlock={() => undefined}
				/>
			)}
		</div>
	);
}
