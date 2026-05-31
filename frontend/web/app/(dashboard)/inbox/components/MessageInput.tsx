// components/MessageInput.tsx
"use client";

import { useState } from "react";
import { Send, Ban } from "lucide-react";

interface MessageInputProps {
	onSend: (text: string) => void;
	blocked: boolean;
}

export default function MessageInput({ onSend, blocked }: MessageInputProps) {
	const [input, setInput] = useState("");

	// Conversation is read-only when a block exists in either direction.
	if (blocked) {
		return (
			<div className="flex shrink-0 items-center justify-center gap-2 border-t border-[var(--color-chatBorder)] bg-[var(--color-chatElevated)] p-4 text-xs font-medium text-textSecondary sm:text-sm">
				<Ban className="h-4 w-4 shrink-0 text-error" />
				Messaging is unavailable. This conversation is read-only.
			</div>
		);
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || blocked) return;
		onSend(input.trim());
		setInput("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex shrink-0 items-end gap-2 border-t border-[var(--color-chatBorder)] bg-[var(--color-chatElevated)] p-3 sm:gap-3 sm:p-4">
			<input
				type="text"
				maxLength={4000}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Write a message…"
				className="h-11 flex-1 rounded-full border border-[var(--color-chatBorder)] bg-[var(--color-chatBase)] px-4 text-sm text-textPrimary transition-all placeholder:text-textTertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:px-5"
			/>
			<button
				type="submit"
				disabled={!input.trim()}
				aria-label="Send message"
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-40">
				<Send className="ml-0.5 h-5 w-5" />
			</button>
		</form>
	);
}
