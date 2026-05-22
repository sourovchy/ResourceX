
"use client";

import { useChat } from "./hooks/useChat";
import ChatSidebar from "./components/ChatSidebar";
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
		currentUserId,
		loading,
	} = useChat();

	return (
		<div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden text-sm md:text-base">
			{/* Sidebar */}
			<ChatSidebar
				conversations={filteredConversations}
				selectedConversationId={selectedId}
				searchQuery={searchQuery}
				currentUserId={currentUserId}
				loading={loading}
				onConversationSelect={selectConversation}
				onSearchChange={setSearchQuery}
			/>

			{/* Chat Area */}
			<ChatWindow
				conversation={selectedConversation}
				messages={currentMessages}
				currentUserId={currentUserId}
				onSend={sendMessage}
			/>
		</div>
	);
}
