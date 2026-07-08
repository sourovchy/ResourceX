"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, MessageSquare, ChevronLeft, ShieldCheck, MoreVertical, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import SafeImage from "@/components/ui/SafeImage";
import type { BlockStatus, Conversation, Message } from "@/types/chat";
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
	onDeleteConversation?: (id: number) => void;
}

export default function ChatWindow({
	conversation,
	messages,
	currentUserId,
	isCurrentUserStaff,
	onSend,
	onBack,
	onDeleteConversation,
}: ChatWindowProps) {
	const router = useRouter();
	const bottomRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
	
	const [menuOpen, setMenuOpen] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	// Close menu on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const otherParticipant = useMemo(() => {
		if (!conversation) return null;

		if (conversation.participantOneUserId === currentUserId) {
			return {
				userId: conversation.participantTwoUserId,
				name: conversation.participantTwoName,
				email: conversation.participantTwoEmail,
				isStaff: conversation.participantTwoIsStaff,
				avatarUrl: conversation.participantTwoAvatarUrl,
			};
		}

		return {
			userId: conversation.participantOneUserId,
			name: conversation.participantOneName,
			email: conversation.participantOneEmail,
			isStaff: conversation.participantOneIsStaff,
			avatarUrl: conversation.participantOneAvatarUrl,
		};
	}, [conversation, currentUserId]);

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
			<div className="hidden flex-1 flex-col items-center justify-center gap-4 bg-card/40 backdrop-blur-xl border border-borderLight rounded-2xl shadow-sm text-textSecondary md:flex h-full">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-borderLight shadow-sm">
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
		<div className="relative flex min-w-0 flex-1 flex-col bg-card/40 backdrop-blur-xl border border-borderLight rounded-2xl shadow-sm overflow-hidden h-full">
			{/* Header */}
			<div className="flex h-14 shrink-0 items-center justify-between border-b border-borderLight bg-transparent px-3 sm:h-16 sm:px-6">
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
						{otherParticipant.avatarUrl ? (
							<SafeImage
								src={otherParticipant.avatarUrl}
								alt={otherParticipant.name}
								width={40}
								height={40}
								className="h-9 w-9 rounded-full object-cover shadow-sm sm:h-10 sm:w-10 transition-opacity group-hover:opacity-80"
							/>
						) : otherParticipant.isStaff ? (
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

					{/* 3-Dot Menu */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className={`p-2 transition-colors rounded-lg ${menuOpen ? "bg-surfaceVariant text-primary" : "text-textSecondary hover:text-primary hover:bg-surfaceVariant"}`}
							title="More options">
							<MoreVertical className="w-5 h-5" />
						</button>

						{menuOpen && (
							<div className="absolute right-0 mt-1 w-56 origin-top-right rounded-xl bg-surface py-2 shadow-lg ring-1 ring-black/5 z-50 border border-border">
								<button
									onClick={() => {
										setMenuOpen(false);
										setConfirmDeleteOpen(true);
									}}
									className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-error hover:bg-errorLight transition-colors">
									<Trash2 className="w-4 h-4" />
									Delete Conversation
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 md:px-6 pb-24 sm:pb-28">
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

			{showInfo && (
				<UserInfoModal
					user={otherParticipant}
					itemTitle=""
					blockStatus={blockStatus}
					isCurrentUserStaff={isCurrentUserStaff}
					onClose={() => setShowInfo(false)}
					onBlockChange={setBlockStatus}
				/>
			)}

			{/* Confirm Delete Conversation */}
			<ConfirmModal
				isOpen={confirmDeleteOpen}
				title="Delete Conversation"
				message={`Are you sure you want to completely delete this conversation with ${otherParticipant.name}? It will be removed from your inbox.`}
				confirmText="Delete"
				cancelText="Cancel"
				isDestructive={true}
				onConfirm={() => {
					onDeleteConversation?.(conversation.conversationId);
					setConfirmDeleteOpen(false);
				}}
				onCancel={() => setConfirmDeleteOpen(false)}
			/>
		</div>
	);
}
