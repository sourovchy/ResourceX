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
			<div className="flex shrink-0 items-center justify-center gap-2 border-t border-borderLight bg-card p-4 text-xs font-medium text-textSecondary sm:text-sm">
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
			className="absolute bottom-0 left-0 z-10 flex w-full items-center gap-3 p-4 bg-transparent">
			<input
				type="text"
				maxLength={4000}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Write a message..."
				className="h-12 flex-1 rounded-full px-5 text-sm text-textPrimary placeholder:text-textTertiary bg-card border border-border shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)] outline-none transition-all duration-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus:shadow-[0_12px_32px_rgba(218,119,86,0.12),0_4px_12px_rgba(0,0,0,0.08)]"
			/>

			<button
				type="submit"
				disabled={!input.trim()}
				aria-label="Send message"
				className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgba(218,119,86,0.30),0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primaryDark hover:shadow-[0_12px_28px_rgba(218,119,86,0.40),0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40">
				<Send className="h-5 w-5" />
			</button>
		</form>
	);
}
