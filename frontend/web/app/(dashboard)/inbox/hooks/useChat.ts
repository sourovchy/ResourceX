"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Conversation, Message } from "@/types/chat";
import { chatService } from "../services/chatService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/lib/errorUtils";

const WS_ENDPOINT = (process.env.NEXT_PUBLIC_API_BASE_URL ?? (typeof window === "undefined" ? "http://localhost:8082" : "")) + "/ws-endpoint";

export function useChat() {
	const { user, canAccess } = useAuth();
	const { toast } = useToast();
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
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		void load();

		return () => {
			isMounted = false;
		};
		// Load once on mount — selecting a conversation must NOT refetch the list
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
		// Sort by most recent activity (last message, else updated, else created)
		const activityTime = (c: Conversation) =>
			new Date(c.lastMessageAt ?? c.updatedAt ?? c.createdAt).getTime() || 0;
		const sorted = [...conversations].sort(
			(a, b) => activityTime(b) - activityTime(a),
		);

		const query = searchQuery.trim().toLowerCase();
		if (!query) return sorted;

		return sorted.filter((conversation) => {
			const haystack = [
				conversation.participantOneName,
				conversation.participantOneEmail,
				conversation.participantTwoName,
				conversation.participantTwoEmail,
				conversation.lastMessageContent ?? "",
			]
				.join(" ")
				.toLowerCase();

			return haystack.includes(query);
		});
	}, [conversations, searchQuery]);

	const currentMessages = selectedId ? messages[selectedId] || [] : [];

	const selectConversation = useCallback(async (id: number) => {
		setSelectedId(id);

		// Persist read-state to the backend (fire-and-forget, non-fatal)
		void chatService.markConversationAsRead(id).catch(() => undefined);

		// Optimistically clear the unread badge locally
		setConversations((prev) =>
			prev.map((c) => (c.conversationId === id ? { ...c, unreadCount: 0 } : c)),
		);

		// Messages already cached — no refetch needed
		if (messages[id]) return;

		const data = await chatService.getMessages(id);
		setMessages((prev) => ({ ...prev, [id]: data }));
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
			} catch (err) {
				// Surface failures (e.g. blocked → 403) instead of failing silently
				toast(extractErrorMessage(err), "error");
			} finally {
				setSending(false);
			}
		},
		[selectedId, toast],
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

	const deselectConversation = useCallback(() => {
		setSelectedId(null);
	}, []);

	// Called after a brand-new conversation is created: refresh the list and open it
	const openCreatedConversation = useCallback(
		async (conversationId: number) => {
			await refreshConversations();
			await selectConversation(conversationId);
		},
		[refreshConversations, selectConversation],
	);

	const deleteConversation = useCallback(async (conversationId: number) => {
		try {
			await chatService.deleteConversation(conversationId);
			setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId));
			if (selectedId === conversationId) {
				setSelectedId(null);
			}
			toast("Conversation deleted", "success");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	}, [selectedId, toast]);

	const isCurrentUserStaff = canAccess("admin") || canAccess("super_admin") || canAccess("moderator");

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
		isCurrentUserStaff,
		setSearchQuery,
		setCurrentUserId,
		selectConversation,
		deselectConversation,
		sendMessage,
		refreshConversations,
		openCreatedConversation,
		deleteConversation,
	};
}
