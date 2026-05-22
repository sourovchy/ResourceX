import {
	Conversation,
	ConversationRequest,
	Message,
	MessageRequest,
} from "../types/chat";
import api from "@/lib/api";

const CONVERSATION_BASE_URL = "/conversations";
const MESSAGE_BASE_URL = "/messages";

export const chatService = {
	getConversations: async (): Promise<Conversation[]> => {
		try {
			const { data } = await api.get<Conversation[]>(CONVERSATION_BASE_URL);
			return data ?? [];
		} catch (error) {
			console.error("Failed to load conversations", error);
			return [];
		}
	},

	getConversation: async (
		conversationId: number,
	): Promise<Conversation | null> => {
		try {
			const { data } = await api.get<Conversation>(
				`${CONVERSATION_BASE_URL}/${conversationId}`,
			);
			return data;
		} catch (error) {
			console.error("Failed to load conversation", error);
			return null;
		}
	},

	startConversation: async (
		payload: ConversationRequest,
	): Promise<Conversation> => {
		const { data } = await api.post<Conversation>(
			CONVERSATION_BASE_URL,
			payload,
		);

		return data;
	},

	getMessages: async (conversationId: number): Promise<Message[]> => {
		try {
			const { data } = await api.get<Message[]>(
				`${CONVERSATION_BASE_URL}/${conversationId}/messages`,
			);

			return data ?? [];
		} catch (error) {
			console.error("Failed to load messages", error);
			return [];
		}
	},

	sendMessage: async (
		conversationId: number,
		content: string,
	): Promise<Message> => {
		const payload: MessageRequest = {
			content,
		};

		const { data } = await api.post<Message>(
			`${CONVERSATION_BASE_URL}/${conversationId}/messages`,
			payload,
		);

		return data;
	},

	markConversationAsRead: async (
		conversationId: number,
	): Promise<void> => {
		await api.post(`${CONVERSATION_BASE_URL}/${conversationId}/read`);
	},

	markMessageAsRead: async (messageId: number): Promise<void> => {
		await api.post(`${MESSAGE_BASE_URL}/${messageId}/read`);
	},

	getUnreadCount: async (): Promise<number> => {
		try {
			const { data } = await api.get<number>(
				`${CONVERSATION_BASE_URL}/unread-count`,
			);

			return data ?? 0;
		} catch (error) {
			console.error("Failed to load unread count", error);
			return 0;
		}
	},
};
