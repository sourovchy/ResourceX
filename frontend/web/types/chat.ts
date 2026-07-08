export interface Conversation {
	conversationId: number;

	participantOneUserId: number;
	participantOneName: string;
	participantOneEmail: string;
	participantOneIsStaff?: boolean;
	participantOneAvatarUrl?: string | null;

	participantTwoUserId: number;
	participantTwoName: string;
	participantTwoEmail: string;
	participantTwoIsStaff?: boolean;
	participantTwoAvatarUrl?: string | null;

	lastMessageId?: number | null;
	lastMessageContent?: string | null;
	lastMessageSenderId?: number | null;
	lastMessageSenderName?: string | null;
	lastMessageAt?: string | null;

	unreadCount: number;

	createdAt: string;
	updatedAt?: string | null;
}

export interface Message {
	messageId: number;
	conversationId: number;

	senderUserId: number;
	senderName: string;
	senderEmail: string;
	senderAvatarUrl?: string | null;

	content: string;
	isRead: boolean;

	createdAt: string;
	updatedAt?: string | null;
}

export interface ConversationRequest {
	otherUserId: number;
	initialMessage?: string;
}

export interface MessageRequest {
	content: string;
}

export interface BlockStatus {
	/** The current user has blocked the other user. */
	blockedByMe: boolean;
	/** The other user has blocked the current user. */
	blockedByThem: boolean;
	/** A block exists in either direction — the conversation is read-only. */
	blocked: boolean;
}
