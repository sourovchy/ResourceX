// hooks/useChat.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { Conversation, Message } from "../types/chat";
import { chatService } from "../services/chatService";
import { DUMMY_MESSAGES } from "../utils/dummyData";

export function useChat() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [messages, setMessages] =
		useState<Record<string, Message[]>>(DUMMY_MESSAGES);
	const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);

	// Load conversations on mount
	useEffect(() => {
		chatService.getConversations().then((data) => {
			setConversations(data);
			setLoading(false);
		});
	}, []);

	// Filtered conversations based on search
	const filteredConversations = conversations.filter((c) =>
		c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const selectedConversation =
		conversations.find((c) => c.id === selectedId) ?? null;

	const currentMessages = selectedId ? messages[selectedId] || [] : [];

	const selectConversation = useCallback((id: string) => {
		setSelectedId(id);
		// Mark as read
		setConversations((prev) =>
			prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
		);
	}, []);

	const sendMessage = useCallback(
		async (text: string) => {
			if (!selectedId || !text.trim()) return;

			const newMsg = await chatService.sendMessage(selectedId, text);

			setMessages((prev) => ({
				...prev,
				[selectedId]: [...(prev[selectedId] || []), newMsg],
			}));

			// Update last message in conversation list
			setConversations((prev) =>
				prev.map((c) =>
					c.id === selectedId
						? { ...c, lastMessage: text, lastMessageTime: newMsg.time }
						: c,
				),
			);
		},
		[selectedId],
	);

	const toggleBlock = useCallback((userId: string) => {
		setBlockedUsers((prev) => {
			const next = new Set(prev);
			if (next.has(userId)) {
				next.delete(userId);
			} else {
				next.add(userId);
			}
			return next;
		});
	}, []);

	const isBlocked = useCallback(
		(userId: string) => blockedUsers.has(userId),
		[blockedUsers],
	);

	return {
		conversations,
		filteredConversations,
		selectedId,
		selectedConversation,
		currentMessages,
		searchQuery,
		loading,
		setSearchQuery,
		selectConversation,
		sendMessage,
		toggleBlock,
		isBlocked,
	};
}
