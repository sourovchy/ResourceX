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
    deleteConversation,
  } = useChat();

  const isChatOpen = selectedId !== null;

  return (
    <div className="h-full w-full p-2 sm:p-3 md:p-5 flex flex-col md:flex-row gap-5 md:gap-6 text-sm md:text-base overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-full md:w-[320px] lg:w-[360px] shrink-0 h-full ${
          isChatOpen ? "hidden md:flex md:flex-col" : "flex flex-col"
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
        className={`min-h-0 flex-1 flex-col h-full ${
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
          onDeleteConversation={deleteConversation}
        />
      </div>
    </div>
  );
}
