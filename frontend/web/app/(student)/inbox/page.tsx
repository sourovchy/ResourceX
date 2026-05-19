// app/(student)/inbox/page.tsx
"use client";

import { useChat } from "@/hooks/useChat";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";

export default function InboxPage() {
	const {
		filteredConversations,
		selectedId,
		selectedConversation,
		currentMessages,
		searchQuery,
		setSearchQuery,
		selectConversation,
		sendMessage,
		toggleBlock,
		isBlocked,
	} = useChat();

	const blocked = selectedConversation
		? isBlocked(selectedConversation.participant.id)
		: false;

	return (
		<div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden text-sm md:text-base">
			{/* Sidebar */}
			<ConversationList
				conversations={filteredConversations}
				selectedId={selectedId}
				searchQuery={searchQuery}
				onSelect={selectConversation}
				onSearchChange={setSearchQuery}
			/>

			{/* Chat Area */}
			<ChatWindow
				conversation={selectedConversation}
				messages={currentMessages}
				isBlocked={blocked}
				onSend={sendMessage}
				onToggleBlock={toggleBlock}
			/>
		</div>
	);
}
