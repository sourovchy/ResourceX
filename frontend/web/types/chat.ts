
export interface User {
	id: string;
	name: string;
	avatar: string;
	online: boolean;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string; // "me" or user id
	text: string;
	time: string;
	timestamp: number;
}

export interface Conversation {
	id: string;
	participant: User;
	itemTitle: string;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
}
