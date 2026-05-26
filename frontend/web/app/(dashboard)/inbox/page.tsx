
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
		<div className="mx-auto flex h-auto min-h-[calc(100vh-120px)] max-w-7xl flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface text-sm shadow-sm md:h-[calc(100vh-120px)] md:flex-row md:text-base">
			{/* Sidebar */}
			<div className="w-full border-b border-borderLight md:w-[320px] md:min-w-[280px] md:max-w-[360px] md:border-b-0 md:border-r">
				<ChatSidebar
					conversations={filteredConversations}
					selectedConversationId={selectedId}
					searchQuery={searchQuery}
					currentUserId={currentUserId}
					loading={loading}
					onConversationSelect={selectConversation}
					onSearchChange={setSearchQuery}
				/>
			</div>

			{/* Chat Area */}
			<div className="flex min-h-0 flex-1">
				<ChatWindow
					conversation={selectedConversation}
					messages={currentMessages}
					currentUserId={currentUserId}
					onSend={sendMessage}
				/>
			</div>
		</div>
	);
}
