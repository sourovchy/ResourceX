"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Conversation, Message } from "../types/chat";
import { chatService } from "../services/chatService";

export function useChat() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [messages, setMessages] = useState<Record<number, Message[]>>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

	// Load conversations on mount
	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			try {
				setLoading(true);
				const data = await chatService.getConversations();
				if (!isMounted) return;

				setConversations(data);

				if (data.length > 0 && selectedId === null) {
					setSelectedId(data[0].conversationId);
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		void load();

		return () => {
			isMounted = false;
		};
	}, [selectedId]);

	const selectedConversation = useMemo(
		() => conversations.find((c) => c.conversationId === selectedId) ?? null,
		[conversations, selectedId],
	);

	const filteredConversations = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return conversations;

		return conversations.filter((conversation) => {
			const haystack = [
				conversation.participantOneName,
				conversation.participantOneEmail,
				conversation.participantTwoName,
				conversation.participantTwoEmail,
				conversation.lastMessageContent ?? "",
				conversation.bookingId ? `booking ${conversation.bookingId}` : "",
				conversation.disputeId ? `dispute ${conversation.disputeId}` : "",
			]
				.join(" ")
				.toLowerCase();

			return haystack.includes(query);
		});
	}, [conversations, searchQuery]);

	const currentMessages = selectedId ? messages[selectedId] || [] : [];

	const selectConversation = useCallback(async (id: number) => {
		setSelectedId(id);

		const existing = messages[id];
		if (existing) {
			setConversations((prev) =>
				prev.map((c) => (c.conversationId === id ? { ...c, unreadCount: 0 } : c)),
			);
			return;
		}

		const data = await chatService.getMessages(id);
		setMessages((prev) => ({ ...prev, [id]: data }));
		setConversations((prev) =>
			prev.map((c) => (c.conversationId === id ? { ...c, unreadCount: 0 } : c)),
		);
	}, [messages]);

	const sendMessage = useCallback(
		async (text: string) => {
			if (!selectedId || !text.trim()) return;

			setSending(true);
			try {
				const newMsg = await chatService.sendMessage(selectedId, text.trim());

				setMessages((prev) => ({
					...prev,
					[selectedId]: [...(prev[selectedId] || []), newMsg],
				}));

				setConversations((prev) =>
					prev.map((c) =>
						c.conversationId === selectedId
							? {
								...c,
								lastMessageId: newMsg.messageId,
								lastMessageContent: newMsg.content,
								lastMessageSenderId: newMsg.senderUserId,
								lastMessageSenderName: newMsg.senderName,
								lastMessageAt: newMsg.createdAt,
							}
							: c,
					),
				);
			} finally {
				setSending(false);
			}
		},
		[selectedId],
	);

	const refreshConversations = useCallback(async () => {
		setLoading(true);
		try {
			const data = await chatService.getConversations();
			setConversations(data);
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		conversations,
		filteredConversations,
		selectedId,
		selectedConversation,
		currentMessages,
		searchQuery,
		loading,
		sending,
		currentUserId,
		setSearchQuery,
		setCurrentUserId,
		selectConversation,
		sendMessage,
		refreshConversations,
	};
}
