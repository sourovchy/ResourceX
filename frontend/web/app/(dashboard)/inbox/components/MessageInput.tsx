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
			className="flex shrink-0 items-center gap-2 border-t border-borderLight bg-surface p-2.5 sm:gap-3 sm:p-4">
			<input
				type="text"
				maxLength={4000}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Write a message..."
				className="flex-1 rounded-full border border-borderLight bg-surfaceVariant px-3 py-2.5 text-xs text-textPrimary transition-all placeholder:text-textTertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:px-5 sm:py-3 sm:text-sm"
			/>
			<button
				type="submit"
				disabled={!input.trim()}
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12">
				<Send className="ml-0.5 h-4 w-4 sm:h-5 sm:w-5" />
			</button>
		</form>
	);
}
