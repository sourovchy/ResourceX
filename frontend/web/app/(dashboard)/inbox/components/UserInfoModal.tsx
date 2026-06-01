// components/UserInfoModal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserCircle, ExternalLink, Ban, Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/lib/errorUtils";
import { chatService } from "../services/chatService";
import type { BlockStatus } from "../types/chat";
import { getFileUrl } from "@/lib/api";

interface ConversationUser {
	userId: number;
	name: string;
	email: string;
	isStaff?: boolean;
	avatarUrl?: string | null;
}

interface UserInfoModalProps {
	user: ConversationUser;
	itemTitle: string;
	blockStatus: BlockStatus | null;
	isCurrentUserStaff?: boolean;
	onClose: () => void;
	onBlockChange: (status: BlockStatus) => void;
}

export default function UserInfoModal({
	user,
	itemTitle,
	blockStatus,
	isCurrentUserStaff,
	onClose,
	onBlockChange,
}: UserInfoModalProps) {
	const router = useRouter();
	const { toast } = useToast();
	const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

	const blockedByMe = blockStatus?.blockedByMe ?? false;
	const blockedByThem = blockStatus?.blockedByThem ?? false;

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [working, setWorking] = useState(false);

	const handleConfirm = async () => {
		setWorking(true);
		try {
			const status = blockedByMe
				? await chatService.unblockUser(user.userId)
				: await chatService.blockUser(user.userId);
			onBlockChange(status);
			toast(blockedByMe ? "User unblocked." : "User blocked.");
			setConfirmOpen(false);
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setWorking(false);
		}
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Panel */}
			<div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-full flex-col border-l border-borderLight bg-surface shadow-2xl sm:w-80">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-borderLight p-3 sm:p-4">
					<h3 className="text-sm font-bold text-textPrimary sm:text-base">Conversation Info</h3>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-textSecondary transition-colors hover:bg-surfaceVariant hover:text-textPrimary">
						<X className="h-4 w-4 sm:h-5 sm:w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-5">
					{user.isStaff ? (
						<>
							<div className="flex flex-col gap-4 rounded-2xl border border-dashboardBlue/20 bg-dashboardBlueTint/30 p-5">
								<div className="flex flex-col items-center gap-3 text-center">
									<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-dashboardBlueTint text-dashboardBlue shadow-sm">
										<ShieldCheck className="h-8 w-8" />
									</div>
									<div>
										<h4 className="text-lg font-bold text-textPrimary">
											{user.name}
										</h4>
										<p className="mt-1 text-xs font-bold text-dashboardBlue uppercase tracking-wider">
											Platform Staff
										</p>
									</div>
								</div>

								<div className="mt-2 text-[13px] leading-relaxed text-textSecondary text-center">
									This is an official support channel. Our team is here to assist you with platform inquiries and moderation.
								</div>

								<button
									onClick={onClose}
									className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-dashboardBlue px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90">
									Return to Chat
								</button>
							</div>

							{itemTitle && itemTitle !== "Direct Conversation" && (
								<div className="mt-6 flex flex-col gap-1.5 px-1">
									<h4 className="text-[11px] font-bold uppercase tracking-wider text-textTertiary">
										Support Context
									</h4>
									<p className="text-sm font-medium text-textPrimary">
										{itemTitle}
									</p>
								</div>
							)}
						</>
					) : (
						<>
							{/* Contact Card */}
							<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surfaceVariant/50 p-4">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-sm">
										{user.avatarUrl ? (
											<img
												src={getFileUrl(user.avatarUrl)}
												alt={user.name}
												className="h-full w-full rounded-full object-cover"
											/>
										) : (
											initial
										)}
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="truncate text-base font-bold text-textPrimary">
											{user.name}
										</h4>
										<p className="mt-0.5 truncate text-sm text-textSecondary">
											{user.email}
										</p>
									</div>
								</div>

								<button
									onClick={() => router.push(isCurrentUserStaff ? `/users/${user.userId}` : `/profile/${user.userId}`)}
									className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface border border-borderLight px-4 py-2.5 text-sm font-semibold text-textPrimary transition-colors hover:border-primary hover:bg-primaryLight/20 hover:text-primary">
									<UserCircle className="h-4 w-4" />
									View Full Profile
									<ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" />
								</button>
							</div>

							{itemTitle && itemTitle !== "Direct Conversation" && (
								<div className="mt-4 flex flex-col gap-1.5 px-1">
									<h4 className="text-[11px] font-bold uppercase tracking-wider text-textTertiary">
										Context
									</h4>
									<p className="text-sm font-medium text-textPrimary">
										{itemTitle}
									</p>
								</div>
							)}

							{/* Block status indicators */}
							{blockedByThem && (
								<div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-errorLight/40 p-3 text-xs font-medium text-errorDark">
									<ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-error" />
									This user has blocked you. You can&apos;t exchange messages.
								</div>
							)}
							{blockedByMe && (
								<div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-errorLight/40 p-3 text-xs font-medium text-errorDark">
									<Ban className="mt-0.5 h-4 w-4 shrink-0 text-error" />
									You blocked this user. Unblock to resume messaging.
								</div>
							)}

							{/* Block / Unblock action */}
							<div className="mt-auto pt-6">
								<button
									onClick={() => setConfirmOpen(true)}
									disabled={working}
									className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 ${
										blockedByMe
											? "border border-borderLight bg-surface text-textPrimary hover:bg-surfaceVariant"
											: "border border-error/30 bg-errorLight text-error hover:bg-error hover:text-white"
									}`}>
									{working ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Ban className="h-4 w-4" />
									)}
									{blockedByMe ? "Unblock User" : "Block User"}
								</button>
							</div>
						</>
					)}
				</div>
			</div>

			<ConfirmModal
				isOpen={confirmOpen}
				isDestructive={!blockedByMe}
				title={blockedByMe ? "Unblock User" : "Block User"}
				message={
					blockedByMe
						? `Unblock ${user.name}? You'll be able to message each other again.`
						: `Block ${user.name}? Neither of you will be able to send messages, and your existing conversation becomes read-only.`
				}
				confirmText={blockedByMe ? "Unblock" : "Block"}
				cancelText="Cancel"
				isLoading={working}
				onConfirm={handleConfirm}
				onCancel={() => setConfirmOpen(false)}
			/>
		</>
	);
}
