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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || blocked) return;
		onSend(input.trim());
		setInput("");
	};

	if (blocked) {
		return (
			<div className="p-4 bg-surface border-t border-borderLight flex items-center gap-3 shrink-0">
				<div className="flex-1 flex items-center gap-2 bg-errorLight/30 border border-error/30 rounded-full px-5 py-3 text-sm text-error">
					<Ban className="w-4 h-4 shrink-0" />
					<span className="font-medium">
						You blocked this user. Unblock to send messages.
					</span>
				</div>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="p-4 bg-surface border-t border-borderLight flex items-center gap-3 shrink-0">
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Type a message..."
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
