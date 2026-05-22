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
				className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
				onClick={onClose}
			/>

			{/* Panel */}
			<div className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-borderLight z-50 flex flex-col shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-borderLight">
					<h3 className="font-bold text-textPrimary text-base">Conversation Info</h3>
					<button
						onClick={onClose}
						className="p-2 rounded-lg text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
					{/* Avatar + Name */}
					<div className="flex flex-col items-center gap-3 pt-2">
						<div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
							{initial}
						</div>
						<div className="text-center">
							<h4 className="font-bold text-textPrimary text-lg">
								{user.name}
							</h4>
							<p className="text-sm text-textSecondary mt-0.5">
								{user.email}
							</p>
						</div>
					</div>

					{/* Conversation context */}
					<div className="bg-surfaceVariant rounded-xl p-4">
						<p className="text-xs font-semibold text-textTertiary uppercase tracking-wider mb-1">
							Conversation About
						</p>
						<p className="text-sm font-medium text-textPrimary">{itemTitle}</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2">
						<button
							onClick={() => router.push(`/student/profile/${user.userId}`)}
							className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primaryLight/40 text-primary hover:bg-primaryLight/70 transition-colors text-sm font-semibold">
							<UserCircle className="w-5 h-5" />
							View Profile
							<ExternalLink className="w-4 h-4 ml-auto opacity-60" />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
