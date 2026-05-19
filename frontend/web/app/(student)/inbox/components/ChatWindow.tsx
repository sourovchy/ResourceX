// components/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
	Info,
	MoreVertical,
	MessageSquare,
	Ban,
	ShieldCheck,
} from "lucide-react";
import { Conversation, Message } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import UserInfoModal from "./UserInfoModal";

interface ChatWindowProps {
	conversation: Conversation | null;
	messages: Message[];
	isBlocked: boolean;
	onSend: (text: string) => void;
	onToggleBlock: (userId: string) => void;
}

export default function ChatWindow({
	conversation,
	messages,
	isBlocked,
	onSend,
	onToggleBlock,
}: ChatWindowProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [showMenu, setShowMenu] = useState(false);

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

	if (!conversation) {
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

	const { participant, itemTitle } = conversation;

	return (
		<div className="flex-1 flex flex-col min-w-0 bg-background/30">
			{/* Header */}
			<div className="h-16 border-b border-borderLight bg-surface px-6 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
							{participant.avatar}
						</div>
						{participant.online && (
							<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
						)}
					</div>
					<div>
						<h3 className="font-bold text-textPrimary text-sm leading-none">
							{participant.name}
						</h3>
						<div className="text-xs text-textSecondary mt-1 flex items-center gap-1.5">
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									participant.online ? "bg-success" : "bg-outline"
								}`}
							/>
							{participant.online ? "Online" : "Offline"}
							{isBlocked && (
								<span className="ml-2 text-error font-semibold flex items-center gap-1">
									<Ban className="w-3 h-3" /> Blocked
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
						title="User Info">
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
								<button
									onClick={() => {
										onToggleBlock(participant.id);
										setShowMenu(false);
									}}
									className={`flex items-center gap-2 w-full px-4 py-3 text-sm font-medium transition-colors ${
										isBlocked
											? "text-success hover:bg-success/10"
											: "text-error hover:bg-error/10"
									}`}>
									{isBlocked ? (
										<>
											<ShieldCheck className="w-4 h-4" /> Unblock User
										</>
									) : (
										<>
											<Ban className="w-4 h-4" /> Block User
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-6 space-y-4">
				<div className="text-center text-xs font-semibold text-textTertiary mb-6 uppercase tracking-wider">
					Chat started regarding {itemTitle}
				</div>

				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-textSecondary gap-3">
						<MessageSquare className="w-10 h-10 text-outline" />
						<p className="text-sm">No messages yet. Say hi!</p>
					</div>
				) : (
					messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<MessageInput onSend={onSend} blocked={isBlocked} />

			{/* User Info Modal */}
			{showInfo && (
				<UserInfoModal
					user={participant}
					itemTitle={itemTitle}
					isBlocked={isBlocked}
					onClose={() => setShowInfo(false)}
					onToggleBlock={() => onToggleBlock(participant.id)}
				/>
			)}
		</div>
	);
}
