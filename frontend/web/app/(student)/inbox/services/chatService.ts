// services/chatService.ts
// Abstraction layer — swap mock with real API calls later

import { Conversation, Message } from "../types/chat";
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from "../utils/dummyData";

export const chatService = {
	getConversations: async (): Promise<Conversation[]> => {
		return new Promise((resolve) =>
			setTimeout(() => resolve(DUMMY_CONVERSATIONS), 300),
		);
	},

	getMessages: async (conversationId: string): Promise<Message[]> => {
		return new Promise((resolve) =>
			setTimeout(() => resolve(DUMMY_MESSAGES[conversationId] || []), 200),
		);
	},

	sendMessage: async (
		conversationId: string,
		text: string,
	): Promise<Message> => {
		const newMessage: Message = {
			id: `m-${Date.now()}`,
			conversationId,
			senderId: "me",
			text,
			time: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			timestamp: Date.now(),
		};
		return new Promise((resolve) => setTimeout(() => resolve(newMessage), 100));
	},
};
