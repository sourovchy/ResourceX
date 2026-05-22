export interface Conversation {
	conversationId: number;

	participantOneUserId: number;
	participantOneName: string;
	participantOneEmail: string;

	participantTwoUserId: number;
	participantTwoName: string;
	participantTwoEmail: string;

	bookingId?: number | null;
	disputeId?: number | null;

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

	receiverUserId: number;
	receiverName: string;
	receiverEmail: string;

	content: string;
	isRead: boolean;
	readAt?: string | null;

	createdAt: string;
	updatedAt?: string | null;
}

export interface ConversationRequest {
	otherUserId: number;
	bookingId?: number;
	disputeId?: number;
	initialMessage?: string;
}

export interface MessageRequest {
	content: string;
}
