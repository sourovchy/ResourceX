// components/UserInfoModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { X, UserCircle, ExternalLink } from "lucide-react";

interface ConversationUser {
	userId: number;
	name: string;
	email: string;
}

interface UserInfoModalProps {
	user: ConversationUser;
	itemTitle: string;
	isBlocked: boolean;
	onClose: () => void;
	onToggleBlock: () => void;
}

export default function UserInfoModal({
	user,
	itemTitle,
	onClose,
}: UserInfoModalProps) {
	const router = useRouter();
	const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

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
				<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:gap-6 sm:p-6">
					{/* Avatar + Name */}
					<div className="flex flex-col items-center gap-3 pt-1 sm:pt-2">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl">
							{initial}
						</div>
						<div className="text-center">
							<h4 className="break-words text-base font-bold text-textPrimary sm:text-lg">
								{user.name}
							</h4>
							<p className="mt-0.5 break-all text-xs text-textSecondary sm:text-sm">
								{user.email}
							</p>
						</div>
					</div>

					{/* Conversation context */}
					<div className="rounded-xl bg-surfaceVariant p-3 sm:p-4">
						<p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-textTertiary sm:text-xs">
							Conversation About
						</p>
						<p className="break-words text-xs font-medium text-textPrimary sm:text-sm">{itemTitle}</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2">
						<button
							onClick={() => router.push(`/users/${user.userId}`)}
							className="flex w-full items-center gap-2 rounded-xl bg-primaryLight/40 px-3 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primaryLight/70 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
							<UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
							View Profile
							<ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60 sm:h-4 sm:w-4" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
