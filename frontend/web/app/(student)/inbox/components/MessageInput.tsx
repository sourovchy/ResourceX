// components/MessageInput.tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
	onSend: (text: string) => void;
	blocked: boolean;
}

export default function MessageInput({ onSend, blocked }: MessageInputProps) {
	const [input, setInput] = useState("");

	// Backend messaging currently does not support chat blocking.
	if (blocked) {
		return null;
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
			className="p-4 bg-surface border-t border-borderLight flex items-center gap-3 shrink-0">
			<input
				type="text"
				maxLength={4000}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Write a message..."
				className="flex-1 bg-surfaceVariant border border-borderLight rounded-full px-5 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-textPrimary placeholder:text-textTertiary"
			/>
			<button
				type="submit"
				disabled={!input.trim()}
				className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primaryDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
				<Send className="w-5 h-5 ml-0.5" />
			</button>
		</form>
	);
}
