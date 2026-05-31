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
    deselectConversation,
    sendMessage,
    currentUserId,
    isCurrentUserStaff,
    loading,
    openCreatedConversation,
  } = useChat();

  const isChatOpen = selectedId !== null;

  return (
    <div className="h-full w-full bg-background p-2 sm:p-3 md:p-5">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-borderLight bg-[var(--color-chatBase)] text-sm shadow-sm md:flex-row md:text-base">
      {/* Sidebar */}
      <div
        className={`w-full md:w-[320px] lg:w-[360px] shrink-0 md:border-r md:border-[var(--color-chatBorder)] ${
          isChatOpen ? "hidden md:block" : "block"
        }`}
      >
        <ChatSidebar
          conversations={filteredConversations}
          selectedConversationId={selectedId}
          searchQuery={searchQuery}
          currentUserId={currentUserId}
          loading={loading}
          onConversationSelect={selectConversation}
          onSearchChange={setSearchQuery}
          onConversationCreated={openCreatedConversation}
        />
      </div>

      {/* Chat Area */}
      <div
        className={`min-h-0 flex-1 flex-col ${
          isChatOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatWindow
          conversation={selectedConversation}
          messages={currentMessages}
          currentUserId={currentUserId}
          isCurrentUserStaff={isCurrentUserStaff}
          onSend={sendMessage}
          onBack={deselectConversation}
        />
      </div>
      </div>
    </div>
  );
}
