// components/SearchBar.tsx
"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
	value: string;
	onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="relative w-full">
			<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textTertiary sm:h-4 sm:w-4" />
			<input
				type="text"
				maxLength={100}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search conversations…"
				className="w-full rounded-xl border border-[var(--color-chatBorder)] bg-[var(--color-chatElevated)] py-2 pl-8 pr-3 text-xs text-textPrimary transition-all placeholder:text-textTertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:py-2.5 sm:pl-9 sm:pr-4 sm:text-sm"
			/>
		</div>
	);
}
