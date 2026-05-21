import { Conversation, Message } from "@/types/chat";
import api from "@/lib/api";

export const chatService = {
	getConversations: async (): Promise<Conversation[]> => {
		try {
			const { data } = await api.get<Conversation[]>("/messages/conversations");
			return data ?? [];
		} catch {
			return [];
		}
	},

	getMessages: async (conversationId: string): Promise<Message[]> => {
		try {
			const { data } = await api.get<Message[]>(`/messages/conversations/${conversationId}`);
			return data ?? [];
		} catch {
			return [];
		}
	},

	sendMessage: async (
		conversationId: string,
		text: string,
	): Promise<Message> => {
		const { data } = await api.post<Message>(`/messages/conversations/${conversationId}`, { text });
		return data;
	},
};
