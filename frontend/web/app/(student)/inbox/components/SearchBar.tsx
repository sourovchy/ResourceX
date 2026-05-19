// components/SearchBar.tsx
"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
	value: string;
	onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="relative">
			<Search className="w-4 h-4 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search messages..."
				className="w-full pl-9 pr-4 py-2 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-textPrimary placeholder:text-textTertiary"
			/>
		</div>
	);
}
