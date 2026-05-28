"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Conversation, Message } from "../types/chat";
import { chatService } from "../services/chatService";
import { useAuth } from "@/context/AuthContext";

const WS_ENDPOINT = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8082") + "/ws-endpoint";

export function useChat() {
	const { user } = useAuth();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [messages, setMessages] = useState<Record<number, Message[]>>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
	const stompClientRef = useRef<Client | null>(null);

	useEffect(() => {
		if (user?.userId) {
			setCurrentUserId(user.userId);
		}
	}, [user]);

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

	// WebSocket subscription for real-time messages
	useEffect(() => {
		if (!currentUserId) return;

		const client = new Client({
			webSocketFactory: () => new SockJS(WS_ENDPOINT),
			reconnectDelay: 5000,
			onConnect: () => {
				client.subscribe(`/queue/messages/${currentUserId}`, (frame) => {
					try {
						const newMsg: Message = JSON.parse(frame.body);
						setMessages((prev) => {
							const existing = prev[newMsg.conversationId] ?? [];
							const alreadyPresent = existing.some((m) => m.messageId === newMsg.messageId);
							if (alreadyPresent) return prev;
							return { ...prev, [newMsg.conversationId]: [...existing, newMsg] };
						});
						setConversations((prev) =>
							prev.map((c) =>
								c.conversationId === newMsg.conversationId
									? {
										...c,
										lastMessageId: newMsg.messageId,
										lastMessageContent: newMsg.content,
										lastMessageSenderId: newMsg.senderUserId,
										lastMessageSenderName: newMsg.senderName,
										lastMessageAt: newMsg.createdAt,
										unreadCount: c.conversationId === selectedId ? 0 : (c.unreadCount ?? 0) + 1,
									}
									: c,
							),
						);
					} catch {
						// malformed frame — ignore
					}
				});
			},
		});

		client.activate();
		stompClientRef.current = client;

		return () => {
			client.deactivate();
			stompClientRef.current = null;
		};
	}, [currentUserId, selectedId]);

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
