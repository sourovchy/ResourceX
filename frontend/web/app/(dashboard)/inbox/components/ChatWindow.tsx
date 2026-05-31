"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, MessageSquare, ChevronLeft, ShieldCheck } from "lucide-react";
import { Conversation, Message } from "@/types/chat";
import type { BlockStatus } from "../types/chat";
import { chatService } from "../services/chatService";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import UserInfoModal from "./UserInfoModal";

interface ChatWindowProps {
	conversation: Conversation | null;
	messages: Message[];
	currentUserId?: number;
	isCurrentUserStaff?: boolean;
	onSend: (text: string) => void;
	onBack: () => void;
}

export default function ChatWindow({
	conversation,
	messages,
	currentUserId,
	isCurrentUserStaff,
	onSend,
	onBack,
}: ChatWindowProps) {
	const router = useRouter();
	const bottomRef = useRef<HTMLDivElement>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);

	const otherParticipant = useMemo(() => {
		if (!conversation) return null;

		if (conversation.participantOneUserId === currentUserId) {
			return {
				userId: conversation.participantTwoUserId,
				name: conversation.participantTwoName,
				email: conversation.participantTwoEmail,
				isStaff: conversation.participantTwoIsStaff,
			};
		}

		return {
			userId: conversation.participantOneUserId,
			name: conversation.participantOneName,
			email: conversation.participantOneEmail,
			isStaff: conversation.participantOneIsStaff,
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

	// Load block status whenever the conversation partner changes
	const otherUserId = otherParticipant?.userId;
	useEffect(() => {
		if (!otherUserId) {
			setBlockStatus(null);
			return;
		}
		let active = true;
		chatService
			.getBlockStatus(otherUserId)
			.then((status) => {
				if (active) setBlockStatus(status);
			})
			.catch(() => {
				if (active) setBlockStatus(null);
			});
		return () => {
			active = false;
		};
	}, [otherUserId]);

	if (!conversation || !otherParticipant) {
		return (
			<div className="hidden flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-chatBase)] text-textSecondary md:flex">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-chatElevated)] border border-[var(--color-chatBorder)]">
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
		<div className="flex min-w-0 flex-1 flex-col bg-[var(--color-chatBase)] h-full">
			{/* Header */}
			<div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-chatBorder)] bg-[var(--color-chatElevated)] px-3 shadow-sm sm:h-16 sm:px-6">
				<div className="flex items-center gap-1 sm:gap-2 min-w-0">
					<button
						onClick={onBack}
						className="md:hidden p-1.5 -ml-1.5 text-textSecondary hover:text-primary transition-colors hover:bg-surfaceVariant rounded-lg"
						title="Back to conversations">
						<ChevronLeft className="w-6 h-6" />
					</button>
					<button
						onClick={() => {
							if (!otherParticipant.isStaff) {
								router.push(isCurrentUserStaff ? `/users/${otherParticipant.userId}` : `/profile/${otherParticipant.userId}`);
							}
						}}
						className={`group flex min-w-0 items-center gap-2 text-left sm:gap-3 ${otherParticipant.isStaff ? "cursor-default" : ""}`}
						title={otherParticipant.isStaff ? "Staff Member" : "View profile"}>
					<div className="relative">
						{otherParticipant.isStaff ? (
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-dashboardBlueTint text-base font-bold text-dashboardBlue sm:h-10 sm:w-10 sm:text-lg">
								<ShieldCheck className="h-5 w-5" />
							</div>
						) : (
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-bold text-white transition-opacity group-hover:opacity-80 sm:h-10 sm:w-10 sm:text-lg">
								{participantInitial}
							</div>
						)}
					</div>
					<div className="min-w-0 flex flex-col justify-center">
						<div className="flex items-center gap-2">
							<h3 className={`truncate text-sm font-bold leading-none text-textPrimary ${!otherParticipant.isStaff ? "transition-colors group-hover:text-primary" : ""}`}>
								{otherParticipant.name}
							</h3>
							{otherParticipant.isStaff && (
								<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-dashboardBlue" />
							)}
						</div>
						{!otherParticipant.isStaff && (
							<div className="mt-0.5 truncate text-[11px] font-medium text-textSecondary">
								{otherParticipant.email}
							</div>
						)}
						{otherParticipant.isStaff && (
							<div className="mt-0.5 truncate text-[11px] font-bold text-dashboardBlue uppercase tracking-wider">
								Platform Staff
							</div>
						)}
					</div>
				</button>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1">
					<button
						onClick={() => setShowInfo(true)}
						className="p-2 text-textSecondary hover:text-primary transition-colors hover:bg-surfaceVariant rounded-lg"
						title="Conversation Info">
						<Info className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 md:px-6">
				{(conversation.bookingId || conversation.disputeId) && (
					<div className="mb-3 flex justify-center">
						<span className="rounded-full bg-[var(--color-chatElevated)] border border-[var(--color-chatBorder)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-textTertiary sm:text-xs">
							{contextLabel}
						</span>
					</div>
				)}

				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-textSecondary gap-3">
						<MessageSquare className="w-10 h-10 text-outline" />
						<p className="text-sm">No messages yet. Say hi!</p>
					</div>
				) : (
					<div className="flex flex-col">
						{messages.map((msg, index) => {
							const prevMsg = index > 0 ? messages[index - 1] : null;
							const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

							const isSameSenderAsPrev = prevMsg && prevMsg.senderUserId === msg.senderUserId;
							const isSameSenderAsNext = nextMsg && nextMsg.senderUserId === msg.senderUserId;

							const timeDiffPrev = prevMsg ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() : 0;
							const timeDiffNext = nextMsg ? new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() : 0;

							// Group if within 5 minutes (300,000 ms)
							const isFirstInGroup = !isSameSenderAsPrev || timeDiffPrev > 300000;
							const isLastInGroup = !isSameSenderAsNext || timeDiffNext > 300000;

							return (
								<MessageBubble
									key={msg.messageId}
									message={msg}
									currentUserId={currentUserId}
									isFirstInGroup={isFirstInGroup}
									isLastInGroup={isLastInGroup}
								/>
							);
						})}
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<MessageInput onSend={onSend} blocked={!!blockStatus?.blocked} />

			{/* User Info Modal */}
			{showInfo && (
				<UserInfoModal
					user={otherParticipant}
					itemTitle={contextLabel}
					blockStatus={blockStatus}
					isCurrentUserStaff={isCurrentUserStaff}
					onClose={() => setShowInfo(false)}
					onBlockChange={setBlockStatus}
				/>
			)}
		</div>
	);
}
